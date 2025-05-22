import http from "../utils/http";
import { SuccessResponse } from "../types/utils.type";

export const URL_ADD_POST_SLOTS = "api/v1/users/add-posts"; // Match backend endpoint
export const URL_GET_WALLET = "api/v1/payments/wallet";
export const URL_THEMTIEN_WALLET = "api/v1/payments/vn-pay";


const paymentAPI = {
  purchaseSlot(body: { amount: number }) {
    return http.post<SuccessResponse<any>>(URL_ADD_POST_SLOTS, body);
  },
  getWallet(userId: number) {
    return http.get<SuccessResponse<any>>(`${URL_GET_WALLET}/${userId}`);
  },
  addMoneyToWallet(userId: number, amount: number) {
    return http.get<SuccessResponse<any>>(`${URL_THEMTIEN_WALLET}?amount=${amount}&userId=${userId}&bankCode=NCB`);
  },
  getTransactionHistory(userId: number) {
    return http.get<SuccessResponse<any>>(`api/v1/payments/user/${userId}`);
  }
};

export default paymentAPI;