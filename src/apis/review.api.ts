import { create, get, update } from "lodash";
import http from "../utils/http";
import { SuccessResponse } from "../types/utils.type";
import { Review } from "../types/review.type";
import { RoomImage } from "../types/room.type";

export const BASE_URL = "api/v1/reviews";

const reviewAPI = {
  getReviews(params: { userId?: number }) {
    return http.get<SuccessResponse<Review[]>>(
      `${BASE_URL}/user/${params.userId}`
    );
  },
  createReview(body: {
    roomId: number;
    userId: number;
    rating: number;
    comment: string;
    images: RoomImage[];
  }) {
    return http.post<SuccessResponse<Review>>(`${BASE_URL}`, body);
  },
  updateReview(body: {
    id: number;
    roomId: number;
    userId: number;
    rating: number;
    comment: string;
    images: RoomImage[];
  }) {
    return http.put<SuccessResponse<Review>>(`${BASE_URL}`, body);
  },
  deleteReview(id: number) {
    return http.delete<SuccessResponse<Review>>(`${BASE_URL}/${id}`);
  },
  getReviewsByUseId(params: { userId?: number }) {
    return http.get<SuccessResponse<Review[]>>(
      `${BASE_URL}/user/${params.userId}`
    );
  },
};

export default reviewAPI;
