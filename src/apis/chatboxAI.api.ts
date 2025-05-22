import exp from "constants";
import http from "../utils/http";

export const API_URL = "https://trotot-rasa-chatbox.silenthero.xyz/webhooks/rest/webhook"; 
// body {
//   "sender": "user123",
//   "message": "Tìm phòng trọ dưới 5 tr"
// }

export interface ChatboxAIResponse {
    recipient_id: string;
    text: string;
}

const chatboxAI = {
    sendMessage(sender: string, message: string) {
        return http.post<ChatboxAIResponse[]>(API_URL, { 
            sender,
            message
        });
    }
}

export default chatboxAI;