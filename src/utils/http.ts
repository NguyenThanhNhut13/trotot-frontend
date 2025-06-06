import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { toast } from "react-toastify";
import HttpStatusCode from "../constants/httpStatusCode.enum";
import { AuthResponse, RefreshTokenReponse } from "../types/auth.type";
import {
  clearLS,
  getAccessTokenFromLS,
  getRefreshTokenFromLS,
  setAccessTokenToLS,
  setRefreshTokenToLS,
} from "./auth";
import config from "../constants/config";
import {
  URL_LOGIN,
  URL_LOGOUT,
  URL_REFRESH_TOKEN,
  URL_REGISTER,
  URL_VERIFY_OTP,
} from "../apis/auth.api";
import { isAxiosExpiredTokenError, isAxiosUnauthorizedError } from "./utils";
import { ErrorResponse } from "../types/utils.type";

// Add this retry function
const retryRequest = async (
  fn: () => Promise<any>,
  maxRetries = 3,
  delay = 1000
): Promise<any> => {
  let retries = 0;
  let lastError: AxiosError | null = null;

  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      const axiosError = error as AxiosError;

      // Only retry on 500 errors
      if (
        !axiosError.response ||
        axiosError.response.status < 500 ||
        axiosError.response.status >= 600
      ) {
        throw error; // Don't retry for non-500 errors
      }

      lastError = axiosError;
      retries++;
      console.log(
        `API call failed with 500 error. Retrying attempt ${retries}/${maxRetries} in ${delay}ms...`
      );

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Exponential backoff
      delay *= 2;
    }
  }

  if (lastError) {
    console.error("All retry attempts failed:", lastError);
    throw lastError;
  } else {
    throw new Error("All retry attempts failed, but no error was captured.");
  }
};

export class Http {
  instance: AxiosInstance;
  private accessToken: string;
  private refreshToken: string;
  private refreshTokenRequest: Promise<string> | null;

  constructor() {
    this.accessToken = getAccessTokenFromLS();
    this.refreshToken = getRefreshTokenFromLS();
    this.refreshTokenRequest = null;

    this.instance = axios.create({
      baseURL: config.baseUrl,
      timeout: 60000,
      headers: {
        "Content-Type": "application/json",
        "expire-access-token": 60 * 60 * 24, // 1 day
        "expire-refresh-token": 60 * 60 * 24 * 160, // 160 days
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        if (this.accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      this.handleResponse.bind(this),
      this.handleError.bind(this)
    );
  }

  private handleResponse(response: any) {
    const { url } = response.config;

    if (url === URL_LOGIN) {
      const data = response.data as AuthResponse;
      this.accessToken = data.data.accessToken;
      this.refreshToken = data.data.refreshToken;
      setAccessTokenToLS(this.accessToken);
      setRefreshTokenToLS(this.refreshToken);
    } else if ([URL_LOGOUT, URL_REGISTER, URL_VERIFY_OTP].includes(url)) {
      this.accessToken = "";
      this.refreshToken = "";
      clearLS();
    }

    return response;
  }

  private async handleError(error: AxiosError) {
    const config = error.response?.config;

    // Try to retry 500 errors
    if (
      error.response?.status &&
      error.response.status >= 500 &&
      error.response.status < 600 &&
      config
    ) {
      try {
        return await retryRequest(() => this.instance(config), 3, 1000);
      } catch (retryError) {
        // If retry fails, continue with normal error handling
        console.error("Retry failed after multiple attempts:", retryError);
      }
    }

    // Handle general error messages
    if (
      ![
        HttpStatusCode.UnprocessableEntity,
        HttpStatusCode.Unauthorized,
      ].includes(error.response?.status as number)
    ) {
      const message =
        (error.response?.data as { message?: string })?.message || error.message;
      toast.error(message);
    }

    // Handle unauthorized errors
    if (
      isAxiosUnauthorizedError<ErrorResponse<{ name: string; message: string }>>(error)
    ) {
      const config = error.response?.config || { headers: {}, url: "" };
      const { url } = config;

      // Handle expired token
      if (
        isAxiosExpiredTokenError(error) &&
        url !== URL_REFRESH_TOKEN &&
        url !== URL_LOGIN
      ) {
        return this.handleTokenRefresh(config);
      }

      // Skip error toast for login failures
      if (url !== URL_LOGIN) {
        const errorMessage =
          error.response?.data?.data?.message || error.response?.data?.message;
        toast.error(errorMessage);
      }
    }

    return Promise.reject(error);
  }

  private handleTokenRefresh(config: any) {
    // Create or reuse the refresh token request
    if (!this.refreshTokenRequest) {
      this.refreshTokenRequest = this.handleRefreshToken().finally(() => {
        setTimeout(() => {
          this.refreshTokenRequest = null;
        }, 10000);
      });
    }

    // Retry original request with new token
    return this.refreshTokenRequest.then((accessToken) => {
      return this.instance({
        ...config,
        headers: {
          ...config.headers,
          authorization: `Bearer ${accessToken}`,
        },
      });
    });
  }

  private handleRefreshToken() {
    return this.instance
      .post<RefreshTokenReponse>(URL_REFRESH_TOKEN, {
        refreshToken: this.refreshToken,
        accessToken: this.accessToken,
      })
      .then((res) => {
        const { accessToken, refreshToken } = res.data.data;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        setAccessTokenToLS(accessToken);
        setRefreshTokenToLS(refreshToken);
        return accessToken;
      });
  }
}

const http = new Http().instance;
export default http;