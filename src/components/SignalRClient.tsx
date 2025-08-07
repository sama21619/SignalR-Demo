'use client';

import { useEffect, useRef, useState } from 'react';
import {
    createConnection,
    onReceiveMessage,
    sendMessage as sendMessageToServer,
    stopConnection
} from '@/services/signalr.service';

export default function SignalRClient() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{ user: string, message: string }[]>([]);
    const bottomRef = useRef<HTMLDivElement>(null);
    const username = 'PizzahutVN';

    useEffect(() => {
        const connection = createConnection();

        connection
            .start()
            .then(() => {
                console.log('Connected to SignalR');
                onReceiveMessage((user, message) => {
                    setMessages((prev) => [...prev, { user, message }]);
                });
            })
            .catch((err) => console.error('SignalR connection error:', err));

        return () => {
            stopConnection();
        };
    }, []);

    useEffect(() => {
        // Auto scroll to latest message
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        await sendMessageToServer(username, input.trim());
        setMessages((prev) => [...prev, { user: username, message: input.trim() }]);
        setInput('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className="bg-[#f3f2f1] min-h-screen flex items-center justify-center px-4">
            <div className="bg-white shadow-md rounded-lg w-full max-w-md flex flex-col h-[600px]">
                <div className="bg-[#6264a7] text-white text-lg font-semibold px-4 py-3 rounded-t-lg">
                    Microsoft Teams Chat
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {messages.map((msg, idx) => {
                        const isMe = msg.user === username;
                        return (
                            <div
                                key={idx}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`rounded-lg px-3 py-2 max-w-[70%] text-sm shadow ${isMe
                                        ? 'bg-[#e6f0ff] text-right text-black'
                                        : 'bg-[#f0f0f0] text-left text-black'
                                        }`}
                                >
                                    {!isMe && (
                                        <div className="text-xs font-semibold text-[#444] mb-1">
                                            {msg.user}
                                        </div>
                                    )}
                                    <div>{msg.message}</div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={bottomRef} />
                </div>

                <div className="flex gap-2 p-3 border-t">
                    <input
                        className="border rounded px-3 py-2 flex-1 text-sm text-black"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                    />
                    <button
                        className="bg-[#6264a7] hover:bg-[#4e5094] text-white text-sm px-4 py-2 rounded cursor-pointer"
                        onClick={handleSend}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
