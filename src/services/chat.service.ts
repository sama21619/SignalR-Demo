import axiosInstance from "./index";

export const fetchChatHistory = () => {
    return axiosInstance.get("/chat/history");
};

export const sendMessage = (user: string, message: string) => {
    return axiosInstance.post("/chat/send", { user, message });
};
