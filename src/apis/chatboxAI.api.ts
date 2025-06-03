import http from "../utils/http";

export const API_URL = "https://trotot-backend-chatbot-service-1-0.onrender.com/chat"; 

export interface ChatbotRoom {
  id: number;
  title: string;
  price: number;
  area: number;
  roomType: string;
  imageUrls: string[];
  district: string;
  province: string;
}

export interface ChatbotResponse {
  response: {
    summary: string;
    raw_data?: {
      content: ChatbotRoom[];
      page: number;
      size: number;
      totalElements: number;
      totalPages: number;
      last: boolean;
    }
  }
}

const chatboxAI = {
    sendMessage(message: string) {
        return http.post<ChatbotResponse>(API_URL, { 
            message
        });
    }
}

export default chatboxAI;