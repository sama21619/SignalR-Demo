/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { getSignalRConnection } from '@/lib/signalrClient';
import { HubConnectionState } from '@microsoft/signalr';

export default function FinalizeSessionButton({ sessionCode, isFinalized, hasItems }: { sessionCode: string, isFinalized: boolean, hasItems: boolean }) {
    const [loading, setLoading] = useState(false);

    async function ensureConnected(conn: any) {
        if (conn.state === HubConnectionState.Connected) return;
        if (conn.state === HubConnectionState.Disconnected) {
            await conn.start();
            return;
        }
        if (conn.state === HubConnectionState.Connecting || conn.state === HubConnectionState.Reconnecting) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (conn.state !== HubConnectionState.Connected) {
                throw new Error('Không thể kết nối SignalR');
            }
        }
    }

    async function handleFinalize() {
        if (!confirm('Bạn có chắc muốn hoàn tất đơn hàng này?')) return;

        setLoading(true);
        try {
            const conn = getSignalRConnection();
            await ensureConnected(conn);
            await conn.invoke('FinalizeSession', sessionCode);
            // alert('✅ Đơn hàng đã được hoàn tất!');
        } catch (error) {
            console.error('Lỗi khi hoàn tất đơn:', error);
            alert('❌ Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleFinalize}
            disabled={!hasItems || loading || isFinalized}
            className="cursor-pointer fixed bottom-6 right-6 px-6 py-3 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 active:scale-95 transition-all flex items-center gap-2 disabled:cursor-not-allowed disabled:bg-green-600 disabled:opacity-70"
        >
            Hoàn tất đơn
        </button>
    );
}
