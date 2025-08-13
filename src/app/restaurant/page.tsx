'use client';
import { useEffect, useState, useRef } from 'react';
import { getSignalRConnection } from '@/lib/signalrClient';
import { HubConnection, HubConnectionState } from '@microsoft/signalr';

export interface OrderItem {
    id: string;
    dishName: string;
    price: number;
    addedBy: string;
    status: number;
}

export interface Order {
    sessionCode: string;
    tableName: string;
    items: OrderItem[];
}

export function getStatusString(statusCode: number) {
    switch (statusCode) {
        case 0:
            return "Chờ duyệt";
        case 1:
            return "Đã xác nhận";
        case 2:
            return "Đang chuẩn bị";
        case 3:
            return "Sẵn sàng phục vụ";
        case 4:
            return "Đã phục vụ";
        default:
            return "Không rõ";
    }
}
export default function RestaurantPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const connRef = useRef<HubConnection | null>(null);


    useEffect(() => {
        const conn = getSignalRConnection();
        connRef.current = conn;

        // Hàm xử lý nhận đơn hàng mới
        const handleReceiveFinalizedOrder = (
            sessionCode: string,
            tableName: string,
            items: OrderItem[]
        ) => {
            setOrders((prev) => {
                const exists = prev.find((o) => o.sessionCode === sessionCode);
                if (exists) {
                    // Cập nhật đơn nếu đã có
                    return prev.map((o) =>
                        o.sessionCode === sessionCode ? { sessionCode, tableName, items } : o
                    );
                }
                // Thêm đơn mới
                return [...prev, { sessionCode, tableName, items }];
            });
        };

        // Xử lý đóng kết nối
        const handleClose = () => {
            setIsConnected(false);
            setIsJoining(false);
            console.warn('SignalR connection closed');
        };

        // Xử lý khi đang cố kết nối lại
        const handleReconnecting = (error?: Error) => {
            setIsConnected(false);
            console.warn('SignalR reconnecting...', error);
            // Bạn có thể show thông báo UI nếu muốn
        };

        // Xử lý khi kết nối lại thành công
        const handleReconnected = (connectionId?: string) => {
            setIsConnected(true);
            console.log('SignalR reconnected, connectionId:', connectionId);
        };

        // Đăng ký sự kiện trước khi start
        conn.on('ReceiveFinalizedOrder', handleReceiveFinalizedOrder);
        conn.onclose(handleClose);
        conn.onreconnecting(handleReconnecting);
        conn.onreconnected(handleReconnected);

        // Khởi động kết nối nếu chưa kết nối
        if (conn.state === HubConnectionState.Disconnected) {
            conn
                .start()
                .then(() => {
                    console.log('SignalR connected');
                })
                .catch((err) => {
                    console.error('SignalR start error:', err);
                    setIsConnected(false);
                });
        } else if (conn.state === HubConnectionState.Connected) {
            setIsConnected(true);
        }

        // Cleanup khi component unmount
        return () => {
            conn.off('ReceiveFinalizedOrder', handleReceiveFinalizedOrder);
            conn.onclose(() => { });
            conn.onreconnecting(() => { });
            conn.onreconnected(() => { });
        };
    }, []);

    async function updateDishStatus(sessionCode: string, itemId: string, newStatus: number) {
        if (!connRef.current) {
            alert('Chưa kết nối server');
            return;
        }
        const conn = connRef.current;

        if (conn.state !== HubConnectionState.Connected) {
            alert('Chưa kết nối server');
            return;
        }

        try {
            await conn.invoke('UpdateOrderItemStatus', sessionCode, itemId, newStatus);
            setOrders((prevOrders: Order[]) =>
                prevOrders.map(order => ({
                    ...order,
                    items: order.items.map(item =>
                        item.id === itemId ? { ...item, status: newStatus } as OrderItem : item
                    ),
                }))
            );
        } catch (error) {
            console.error('Lỗi cập nhật trạng thái món:', error);
        }
    }


    // Hàm join nhóm nhà hàng
    const handleJoinGroup = async () => {
        if (!connRef.current) return;
        if (isJoining) return;

        setIsJoining(true);
        try {
            if (connRef.current.state === HubConnectionState.Disconnected) {
                await connRef.current.start();
            }

            // Gọi invoke không tham số join nhóm
            await connRef.current.invoke('JoinRestaurantGroup');

            setIsConnected(true);
        } catch (error) {
            console.error('Lỗi join nhóm:', error);
            alert('Không thể tham gia nhóm, vui lòng thử lại.');
            setIsConnected(false);
        }
        setIsJoining(false);
    };



    return (
        <div className="min-h-screen bg-gradient-to-b from-red-50 via-red-100 to-white p-6 max-w-4xl mx-auto font-sans">
            <h1 className="text-3xl font-extrabold mb-8 text-red-700 drop-shadow-md flex items-center gap-2">
                🍕 Nhà hàng - Đơn hàng mới
            </h1>

            <button
                onClick={handleJoinGroup}
                disabled={isConnected || isJoining}
                className={`cursor-pointer mb-8 w-full sm:w-auto px-6 py-3 rounded-xl font-semibold transition
          ${isConnected
                        ? 'bg-gray-300 cursor-not-allowed text-gray-600 shadow-inner'
                        : 'bg-red-600 hover:bg-red-700 text-white shadow-md'
                    }
          ${isJoining ? 'opacity-75 cursor-wait' : ''}
        `}
            >
                {isJoining
                    ? 'Đang tham gia nhóm...'
                    : isConnected
                        ? 'Đã tham gia nhóm nhà hàng'
                        : 'Tham gia nhóm nhà hàng'}
            </button>

            {orders.length === 0 ? (
                <p className="text-gray-600 italic text-center mt-12">Chưa có đơn nào được gửi đến</p>
            ) : (
                <div className="space-y-8">
                    {orders.map((order) => (
                        <div
                            key={order.sessionCode}
                            className="bg-white rounded-2xl shadow-lg p-6 border border-red-200 hover:shadow-2xl transition-shadow"
                        >
                            <h3 className="text-xl font-bold mb-6 text-red-700 flex items-center gap-2">
                                🪑 Bàn: <span className="text-red-600">{order.tableName}</span>{' '}
                                <span className="text-gray-400 text-sm ml-2">(Mã: {order.sessionCode})</span>
                            </h3>
                            <ul className="divide-y divide-gray-200">
                                {order.items.map((item) => (
                                    <li
                                        key={item.id}
                                        className="flex justify-between py-4 items-center hover:bg-gray-100 rounded-lg px-4 transition-colors"
                                    >
                                        <div>
                                            <p className="font-semibold text-gray-900 text-lg">{item.dishName}</p>
                                            <p className="text-sm text-gray-500">
                                                Thêm bởi:{' '}
                                                <span className="font-semibold text-gray-700">{item.addedBy}</span>
                                            </p>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-1">
                                            <p className="text-gray-800 font-bold text-lg">
                                                {item.price.toLocaleString('vi-VN')}đ
                                            </p>
                                            <span
                                                className={`inline-block text-xs px-3 py-1 rounded-full font-semibold
                                                        ${Number(item.status) === 4
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }
                                                    `}
                                            >
                                                {getStatusString(Number(item.status))}
                                            </span>

                                            <select
                                                value={Number(item.status)}
                                                onChange={(e) => updateDishStatus(order.sessionCode, item.id, Number(e.target.value))}
                                                className="
                                                    mt-1
                                                    rounded-lg
                                                    border border-red-300
                                                    bg-white
                                                    px-4 py-2
                                                    text-sm font-medium
                                                    text-red-700
                                                    shadow-sm
                                                    focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500
                                                    transition
                                                    cursor-pointer
                                                    appearance-none
                                                "
                                            >
                                                <option value={0}>Chờ duyệt</option>
                                                <option value={1}>Đã xác nhận</option>
                                                <option value={2}>Đang chuẩn bị</option>
                                                <option value={3}>Sẵn sàng phục vụ</option>
                                                <option value={4}>Đã phục vụ</option>
                                            </select>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
