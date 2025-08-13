'use client';

import { useEffect, useState } from 'react';
import { getSignalRConnection } from '@/lib/signalrClient';
import Image from 'next/image';
import { HubConnectionState } from '@microsoft/signalr';
import { OrderItem } from '@/types/order';

interface MenuItem {
    Product_ID: string;
    Product_Name_VN: string;
    Product_Name_EN: string;
    Sale_price: number;
    Product_Photo: string;
}

const menuItems: MenuItem[] = [
    {
        Product_ID: "PIZZA_015",
        Product_Name_VN: "Pizza Xúc Xích Gà Giòn",
        Product_Name_EN: "Kids Love",
        Sale_price: 199000,
        Product_Photo: "https://cdn.pizzahut.vn/images/WEB_V3/Products_MenuTool/Pizza Xúc Xích Gà Giòn._20250616143148L15.webp"
    },
    {
        Product_ID: "C02",
        Product_Name_VN: "Pizza Hải Sản Xốt Pesto",
        Product_Name_EN: "Seafood Pesto",
        Sale_price: 149000,
        Product_Photo: "https://cdn.pizzahut.vn/images/WEB_V3/Products_MenuTool/Pesto Hải Sản._20250317172201GL5.webp"
    },
    {
        Product_ID: "C12",
        Product_Name_VN: "Pizza Phô Mai Cao Cấp",
        Product_Name_EN: "Cheese Lover",
        Sale_price: 119000,
        Product_Photo: "https://cdn.pizzahut.vn/images/WEB_V3/Products_MenuTool/Cheese Lover with honey._20250317172143IO1.webp"
    },
    {
        Product_ID: "HA33",
        Product_Name_VN: "Khoai Tây Chiên",
        Product_Name_EN: "Crinkle-Cut French Fries",
        Sale_price: 59000,
        Product_Photo: "https://cdn.pizzahut.vn/images/WEB_V3/Products_MenuTool/HA33@@khoai_tay_chien.webp"
    },
    {
        Product_ID: "HA501",
        Product_Name_VN: "Bánh Cuộn Phô Mai",
        Product_Name_EN: "Cheesy Pops",
        Sale_price: 69000,
        Product_Photo: "https://cdn.pizzahut.vn/images/WEB_V3/Products_MenuTool/HA501@@banh_cuon_pho_mai_2023.webp"
    },
    {
        Product_ID: "B01",
        Product_Name_VN: "Pizza Hải Sản Nhiệt Đới",
        Product_Name_EN: "Seafood Lover",
        Sale_price: 139000,
        Product_Photo: "https://cdn.pizzahut.vn/images/WEB_V3/Products_MenuTool/Sea food lover._20250317172354KBY.webp"
    },
    {
        Product_ID: "FA17",
        Product_Name_VN: "Mì Ý Bò Bằm Xốt Cà Chua",
        Product_Name_EN: "Spaghetti Bolognese",
        Sale_price: 120000,
        Product_Photo: "https://cdn.pizzahut.vn/images/WEB_V3/Products_MenuTool/Bò bằm._2025041510054487K.webp"
    },
    {
        Product_ID: "C06",
        Product_Name_VN: "Pizza Pepperoni",
        Product_Name_EN: "Pepperoni",
        Sale_price: 119000,
        Product_Photo: "https://cdn.pizzahut.vn/images/WEB_V3/Products_MenuTool/Pepperoni._20250317172051O6C.webp"
    },
    {
        Product_ID: "IA11",
        Product_Name_VN: "Xà Lách Trộn Cá Ngừ Và Thịt Xông Khói",
        Product_Name_EN: "Tuna Bacon Salad",
        Sale_price: 79000,
        Product_Photo: "https://cdn.pizzahut.vn/images/WEB_V3/Products_MenuTool/IA11@@salad_ca_ngu.webp"
    }
];

// Hàm đảm bảo kết nối SignalR sẵn sàng
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ensureConnected(conn: any) {
    if (conn.state === HubConnectionState.Connected) return;

    if (conn.state === HubConnectionState.Disconnected) {
        await conn.start();
        return;
    }

    if (conn.state === HubConnectionState.Connecting || conn.state === HubConnectionState.Reconnecting) {
        // Đợi 1 giây rồi kiểm tra lại trạng thái
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (conn.state !== HubConnectionState.Connected) {
            throw new Error('Không thể kết nối SignalR');
        }
    }
}

export default function AddOrderItemForm({
    sessionCode,
    addedBy,
    items,
    setItems,
}: {
    sessionCode: string;
    addedBy: string;
    items: OrderItem[];
    setItems: (items: OrderItem[]) => void;
}) {
    const [search, setSearch] = useState('');
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [price, setPrice] = useState<number | ''>('');
    const [showOptions, setShowOptions] = useState(false);

    const filteredMenu = menuItems.filter(item =>
        item.Product_Name_VN.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const conn = getSignalRConnection();
        async function startConnection() {
            try {
                if (conn.state === HubConnectionState.Disconnected) {
                    await conn.start();
                    console.log('SignalR connected inside AddOrderItemForm');
                }
            } catch (error) {
                console.error('Failed to start SignalR in form:', error);
            }
        }

        function handleReceiveOrderUpdate(updatedItems: OrderItem[]) {
            setItems(updatedItems);
        }

        startConnection();
        conn.on('ReceiveOrderUpdate', handleReceiveOrderUpdate);

        return () => {
            conn.off('ReceiveOrderUpdate', handleReceiveOrderUpdate);
        };
    }, [sessionCode, setItems]);




    async function handleAdd() {
        if (!selectedItem || !price) return;
        const conn = getSignalRConnection();
        try {
            await ensureConnected(conn);
            console.log(sessionCode, selectedItem.Product_Name_VN, price, addedBy)

            await conn.invoke(
                'AddOrderItem',
                sessionCode,
                selectedItem.Product_Name_VN,
                Number(price),
                addedBy
            );

            localStorage.setItem('sessionCode', sessionCode);
            setSearch('');
            setSelectedItem(null);
            setPrice('');
        } catch (error) {
            console.error('Lỗi khi thêm món:', error);
            alert('Có lỗi xảy ra khi thêm món, vui lòng thử lại.');
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-6">
            <div className="bg-white shadow-2xl rounded-2xl p-8 border border-gray-200 max-w-2xl w-full">
                <h3 className="text-3xl font-extrabold mb-6 text-red-600 flex items-center gap-2">
                    🍕 Thêm món mới
                </h3>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <input
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setSelectedItem(null);
                                setPrice('');
                                setShowOptions(true);
                            }}
                            placeholder="🔍 Tìm món..."
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-red-500 text-black shadow-sm"
                        />

                        {search && filteredMenu.length > 0 && showOptions && (
                            <ul className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl mt-2 max-h-72 overflow-y-auto shadow-xl">
                                {filteredMenu.map(item => (
                                    <li
                                        key={item.Product_ID}
                                        onClick={() => {
                                            setSelectedItem(item);
                                            setSearch(item.Product_Name_VN);
                                            setPrice(item.Sale_price);
                                            setShowOptions(false);
                                        }}
                                        className="flex items-center gap-4 px-4 py-3 hover:bg-red-50 cursor-pointer transition-colors"
                                    >
                                        <Image
                                            src={item.Product_Photo}
                                            alt={item.Product_Name_VN}
                                            width={50}
                                            height={50}
                                            className="rounded-lg border object-cover"
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900">{item.Product_Name_VN}</span>
                                            <span className="text-gray-600 text-sm">{item.Sale_price.toLocaleString()}đ</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <input
                        type="number"
                        value={price}
                        disabled
                        placeholder="💰 Giá"
                        className="w-32 border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-red-500 text-black shadow-sm"
                    />

                    <button
                        onClick={handleAdd}
                        disabled={!selectedItem}
                        className="cursor-pointer bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl text-base font-semibold transition-all shadow-md hover:shadow-lg"
                    >
                        ➕ Thêm
                    </button>
                </div>

                {items?.length > 0 && (
                    <div className="mt-6">
                        <h4 className="font-bold text-lg text-gray-800 mb-4">📋 Món đã chọn</h4>
                        <ul className="space-y-3">
                            {items.map((item) => (
                                <li
                                    key={item.id}
                                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-sm transition"
                                >
                                    <div className="flex-1 flex flex-col justify-center">
                                        <p className="font-semibold text-gray-900 text-lg">{item.dishName}</p>
                                        <p className="mt-1 text-red-600 font-medium text-base">{item.price.toLocaleString()}₫</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}