'use client';

import { useEffect, useState } from 'react';
import {
    createConnection,
    onReceiveMessage,
    sendMessage as sendMessageToServer,
    stopConnection
} from '@/services/signalr.service';

export default function SignalRClient() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        const connection = createConnection();

        connection
            .start()
            .then(() => {
                console.log('Connected to SignalR');
                onReceiveMessage((user, message) => {
                    setMessages((prev) => [...prev, `${user}: ${message}`]);
                });
            })
            .catch((err) => console.error('SignalR connection error:', err));

        return () => {
            stopConnection();
        };
    }, []);

    const handleSend = async () => {
        await sendMessageToServer('NextJSClient', input);
        setInput('');
    };

    return (
        <div className="p-4 max-w-xl mx-auto">
            <h2 className="text-xl font-bold mb-4">SignalR Chat</h2>
            <div className="flex gap-2">
                <input
                    className="border p-2 flex-1 rounded"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                />
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
                    onClick={handleSend}
                >
                    Gửi
                </button>
            </div>

            <ul className="mt-4 space-y-1 bg-white p-2 rounded shadow">
                {messages.map((msg, idx) => (
                    <li key={idx} className="text-sm">{msg}</li>
                ))}
            </ul>
        </div>
    );
}
