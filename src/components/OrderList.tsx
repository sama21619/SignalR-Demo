'use client';

import { OrderItem } from '@/types/order';
import { getStatusString } from '@/app/restaurant/page';

interface OrderListProps {
    items: OrderItem[];
    isFinalized: boolean;
    onRemoveItem?: (itemId: string) => void;
}

export default function OrderList({ items, isFinalized, onRemoveItem }: OrderListProps) {
    return (
        <div className="bg-white shadow-lg p-6 border border-gray-100">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4 border-b pb-3">
                <span className="text-2xl">📋</span>
                <h3 className="text-xl font-bold text-gray-800">Danh sách món</h3>
            </div>

            {/* Empty State */}
            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-gray-500 py-10">
                    <p className="text-base italic">Chưa có món nào</p>
                </div>
            ) : (
                <ul className="space-y-4">
                    {items.map((item) => (
                        <li
                            key={item.id}
                            className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                            <div className="flex flex-col">
                                <p className="font-semibold text-gray-900 text-lg">{item.dishName}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Thêm bởi: <span className="font-medium text-gray-700">{item.addedBy}</span>
                                </p>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <p className="w-full text-red-600 font-bold text-lg">{item.price.toLocaleString()}đ</p>

                                <span
                                    className={`inline-block text-xs px-3 py-1 rounded-full font-semibold ${Number(item.status) === 4 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}
                                >
                                    {getStatusString(Number(item.status))}
                                </span>

                                {!isFinalized && onRemoveItem && (
                                    <button
                                        onClick={() => onRemoveItem(item.id)}
                                        className="px-3 w-full py-1 bg-red-500 text-white text-xs font-semibold rounded-full shadow hover:bg-red-600 hover:scale-105 transition-transform duration-150 active:scale-95 cursor-pointer"
                                    >
                                        Xóa món
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>

            )}
        </div>
    );
}
