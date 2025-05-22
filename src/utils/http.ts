import axios, { AxiosError, type AxiosInstance } from "axios";
import HttpStatusCode from "../constants/httpStatusCode.enum";
import { toast } from "react-toastify";
import { AuthResponse, RefreshTokenReponse } from "../types/auth.type";
import {
  clearLS,
  getAccessTokenFromLS,
  getRefreshTokenFromLS,
  setAccessTokenToLS,
  setProfileToLS,
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
import { URL_GET_PROFILE } from "../apis/user.api";
import { isAxiosExpiredTokenError, isAxiosUnauthorizedError } from "./utils";
import { ErrorResponse, ResponseOfAccessToken401 } from "../types/utils.type";
import { UserRespone } from "../types/user.type";

// Post: 1 - 3
// Me: 2 - 5
// Refresh Token cho Post: 3 -  4
// Gọi lại Post: 4 - 6
// Refresh Token mới cho me: 5 - 6
// Gọi lại Me: 6

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
        "expire-access-token": 60 * 60 * 24, // 1 ngày
        "expire-refresh-token": 60 * 60 * 24 * 160, // 160 ngày
      },
    });
    this.instance.interceptors.request.use(
      (config) => {
        if (this.accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${getAccessTokenFromLS()}`;

          return config;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    // Add a response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        const { url } = response.config;
        if (url === URL_LOGIN) {
          const data = response.data as AuthResponse;
          this.accessToken = data.data.accessToken;
          this.refreshToken = data.data.refreshToken;
          setAccessTokenToLS(this.accessToken);
          setRefreshTokenToLS(this.refreshToken);
        } else if (
          url === URL_LOGOUT ||
          url === URL_REGISTER ||
          url === URL_VERIFY_OTP
        ) {
          this.accessToken = "";
          this.refreshToken = "";
          clearLS();
        } else if (url === URL_GET_PROFILE) {
          const data = response.data as UserRespone;
          setProfileToLS(data.data);
        }
        return response;
      },
      (error: AxiosError) => {
        // Chỉ toast lỗi không phải 422 và 401
        if (
          ![
            HttpStatusCode.UnprocessableEntity,
            HttpStatusCode.Unauthorized,
          ].includes(error.response?.status as number)
        ) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data: any | undefined = error.response?.data;
          const message = data?.message || error.message;
          toast.error(message);
        }

        // Lỗi Unauthorized (401) có rất nhiều trường hợp
        // - Token không đúng
        // - Không truyền token
        // - Token hết hạn*

        // Nếu là lỗi 401
        if (
          isAxiosUnauthorizedError<
            ErrorResponse<{ name: string; message: string }>
          >(error)
        ) {
          const config = error.response?.config || { headers: {}, url: "" };
          const { url } = config;
          // Trường hợp Token hết hạn và request đó không phải là của request refresh token
          // thì chúng ta mới tiến hành gọi refresh token
          if (isAxiosExpiredTokenError(error) && url !== URL_REFRESH_TOKEN) {
            // Hạn chế gọi 2 lần handleRefreshToken
            this.refreshTokenRequest = this.refreshTokenRequest
              ? this.refreshTokenRequest
              : this.handleRefreshToken().finally(() => {
                  // Giữ refreshTokenRequest trong 10s cho những request tiếp theo nếu có 401 thì dùng
                  setTimeout(() => {
                    this.refreshTokenRequest = null;
                  }, 10000);
                });
            return this.refreshTokenRequest.then((accessToken) => {
              // Nghĩa là chúng ta tiếp tục gọi lại request cũ vừa bị lỗi
              return this.instance({
                ...config,
                headers: {
                  ...config.headers,
                  authorization: `Bearer ${accessToken}`,
                },
              });
            });
          }

          // Còn những trường hợp như token không đúng
          // không truyền token,
          // token hết hạn nhưng gọi refresh token bị fail
          // thì tiến hành xóa local storage và toast message

          // clearLS();
          // this.accessToken = "";
          // this.refreshToken = "";
          toast.error(
            (error as AxiosError<ErrorResponse<{ message: string }>>).response
              ?.data.data?.message ||
              (error as AxiosError<ErrorResponse<{ message: string }>>).response
                ?.data.message
          );
          // window.location.reload()
        }
        return Promise.reject(error);
      }
    );
  }
  private handleRefreshToken() {
    console.log("refresh token");
    return this.instance
      .post<RefreshTokenReponse>(URL_REFRESH_TOKEN, {
        refreshToken: this.refreshToken,
        accessToken: this.accessToken,
      })
      .then((res) => {
        const { accessToken, refreshToken } = res.data.data;
        setAccessTokenToLS(accessToken);
        setRefreshTokenToLS(refreshToken);
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        return accessToken;
      })
      .catch((error) => {
        // clearLS();
        // this.accessToken = "";
        // this.refreshToken = "";
        throw error;
      });
  }
}
const http = new Http().instance;
export default http;
