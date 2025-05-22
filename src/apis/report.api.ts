import { update } from 'lodash';
import http from "../utils/http";
import { SuccessResponse } from "../types/utils.type";

interface ReportDTO {
  id: number;
  roomId: number;
  userId: number;
  type: string;
  description: string;
  status: "PENDING" | "PROCESSING" | "RESOLVED";
  createAt: string;
  updateAt: string;
}

interface ReportStatusRequest {
  status: "PENDING" | "PROCESSING" | "RESOLVED";
}

export const REPORT_TYPES = {
  SPAM: "SPAM",
  INAPPROPRIATE: "INAPPROPRIATE",
  FAKE: "FAKE",
  SCAM: "SCAM",
} as const;

export const REPORT_STATUSES = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  RESOLVED: "RESOLVED",
} as const;

const reportAPI = {
  getAllReports() {
    return http.get<SuccessResponse<ReportDTO[]>>("/api/v1/reports");
  },
  submitReport(body: { roomId: number; userId: number; type: string; description: string }) {
    return http.post<SuccessResponse<ReportDTO>>("/api/v1/reports", body);
  },
  updateReportStatus(id: number, status: ReportStatusRequest) {
    return http.put<SuccessResponse<ReportDTO>>(`/api/v1/reports/${id}/status`, status);
  },
  deleteReport(id: number) {
    return http.delete<SuccessResponse<void>>(`/api/v1/reports/${id}`);
  },
};

export default reportAPI;