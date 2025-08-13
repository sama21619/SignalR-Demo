/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { getSignalRConnection } from '@/lib/signalrClient';
import { HubConnectionState } from '@microsoft/signalr';

export default function CreateOrJoinSession({
    onSessionJoined
}: { onSessionJoined: (sessionCode: string, isHost: boolean) => void }) { // <- Thêm isHost
    const [tableCode, setTableCode] = useState('');
    const [joinCode, setJoinCode] = useState('');

    // --- Tạo bàn mới ---
    async function handleCreate() {
        const conn = getSignalRConnection();
        if (conn.state !== HubConnectionState.Connected) await conn.start();

        conn.on('ReceiveSessionCode', (code: string) => {
            onSessionJoined(code, true); // host = true
        });

        await conn.invoke('GenerateSessionCode', tableCode);
    }

    async function handleJoin() {
        const conn = getSignalRConnection();
        if (conn.state !== HubConnectionState.Connected) await conn.start();

        const trimmedCode = joinCode.trim(); // loại bỏ khoảng trắng đầu/cuối

        conn.on('ReceiveSessionInfo', (sessionInfo: any) => {
            console.log('Session info:', sessionInfo);
            onSessionJoined(trimmedCode, false); // guest = false
        });

        await conn.invoke('JoinSession', trimmedCode);
    }


    return (
        <div className="max-w-lg mx-auto bg-white shadow-lg rounded-xl p-6 space-y-6">
            <h2 className="text-2xl font-bold text-center text-gray-800">
                Tạo hoặc tham gia bàn
            </h2>

            {/* Tạo bàn mới */}
            <div className="p-4 border border-gray-200 rounded-lg space-y-3">
                <h3 className="text-lg font-semibold text-gray-700">Tạo bàn mới</h3>
                <input
                    value={tableCode}
                    onChange={e => setTableCode(e.target.value)}
                    placeholder="Nhập tên bàn..."
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-400 text-black"
                />
                <button
                    onClick={handleCreate}
                    disabled={!tableCode.trim()}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 cursor-pointer"
                >
                    Tạo bàn
                </button>
            </div>

            {/* Tham gia bàn */}
            <div className="p-4 border border-gray-200 rounded-lg space-y-3">
                <h3 className="text-lg font-semibold text-gray-700">Tham gia bàn</h3>
                <input
                    value={joinCode}
                    onChange={e => setJoinCode(e.target.value)}
                    placeholder="Nhập mã bàn..."
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-green-400 text-black"
                />
                <button
                    onClick={handleJoin}
                    disabled={!joinCode.trim()}
                    className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 cursor-pointer"
                >
                    Tham gia
                </button>
            </div>
        </div>
    );
}
