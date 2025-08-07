import * as signalR from '@microsoft/signalr';

const HUB_URL = 'https://chatapp-signalr-demo.azurewebsites.net/chathub';

let connection: signalR.HubConnection | null = null;

// Khởi tạo connection
export const createConnection = () => {
    connection = new signalR.HubConnectionBuilder()
        .withUrl(HUB_URL)
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

    return connection;
};

// Gửi tin nhắn
export const sendMessage = async (user: string, message: string) => {
    if (connection?.state === signalR.HubConnectionState.Connected) {
        await connection.invoke('SendMessage', user, message);
    }
};

// Lắng nghe tin nhắn mới
export const onReceiveMessage = (
    callback: (user: string, message: string) => void
) => {
    connection?.on('ReceiveMessage', callback);
};

// Dừng kết nối
export const stopConnection = async () => {
    await connection?.stop();
};
