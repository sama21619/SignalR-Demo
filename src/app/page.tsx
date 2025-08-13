'use client';

import { useState, useEffect } from 'react';
import CreateOrJoinSession from '@/components/CreateOrJoinSession';
import OrderList from '@/components/OrderList';
import AddOrderItemForm from '@/components/AddOrderItemForm';
import FinalizeSessionButton from '@/components/FinalizeSessionButton';
import { getSignalRConnection } from '@/lib/signalrClient';
import { OrderItem } from '@/types/order';
import { HubConnectionState } from '@microsoft/signalr';

export default function HomePage() {
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false); const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isSessionFinalized, setIsSessionFinalized] = useState<boolean>(false);

  useEffect(() => {
    if (!sessionCode) return;

    const conn = getSignalRConnection();

    async function startConnection() {
      try {
        if (conn.state === HubConnectionState.Disconnected) {
          await conn.start();
          console.log('SignalR connected for session', sessionCode);
        }
      } catch (error) {
        console.error('Failed to start SignalR connection:', error);
        alert('Lỗi kết nối realtime, vui lòng thử lại sau.');
      }
    }

    function handleReceiveOrderUpdate(items: OrderItem[]) {
      setOrderItems(items);
    }

    function handleSessionFinalized() {
      alert('✅ Đơn hàng đã hoàn tất!');
      setIsSessionFinalized(true);
    }

    function handleReconnecting(error: Error | undefined) {
      console.warn('SignalR reconnecting...', error);
      alert('Đang cố gắng kết nối lại...');
    }

    function handleReconnected(connectionId: string | undefined) {
      console.log('SignalR reconnected, id:', connectionId);
      alert('Đã kết nối lại thành công.');
    }

    function handleClosed(error: Error | undefined) {
      console.error('SignalR connection closed', error);
      alert('Mất kết nối realtime, vui lòng refresh trang.');
    }

    startConnection();

    conn.on('ReceiveOrderUpdate', handleReceiveOrderUpdate);
    conn.on('SessionFinalized', handleSessionFinalized);
    conn.onreconnecting(handleReconnecting);
    conn.onreconnected(handleReconnected);
    conn.onclose(handleClosed);

    return () => {
      conn.off('ReceiveOrderUpdate', handleReceiveOrderUpdate);
      conn.off('SessionFinalized', handleSessionFinalized);
      conn.onreconnecting(() => { });
      conn.onreconnected(() => { });
      conn.onclose(() => { });
    };
  }, [sessionCode]);

  const handleRemoveItem = async (itemId: string) => {
    if (!sessionCode) return;
    if (!confirm('Bạn có chắc muốn xóa món này?')) return;

    const conn = getSignalRConnection();
    try {
      await conn.invoke('RemoveOrderItem', sessionCode, itemId);
    } catch (error) {
      console.error('Lỗi xóa món:', error);
      alert('Không thể xóa món, vui lòng thử lại.');
    }
  };

  function handleSessionJoined(code: string, host: boolean) {
    setSessionCode(code);
    setIsHost(host);
  }

  if (!sessionCode) {
    return <CreateOrJoinSession onSessionJoined={handleSessionJoined} />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3 p-2">
        <p className="inline-flex items-center px-5 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white text-xl font-bold rounded-full shadow-lg border-2 border-yellow-400">
          🍕 Bàn {sessionCode} - {isHost ? 'Host' : 'Guest'}
        </p>
      </div>

      <OrderList
        items={orderItems}
        isFinalized={isSessionFinalized}
        onRemoveItem={handleRemoveItem}
      />

      {!isSessionFinalized && (
        <AddOrderItemForm sessionCode={sessionCode} addedBy="Sang" items={orderItems} setItems={setOrderItems} />
      )}

      {isHost && !isSessionFinalized && (
        <FinalizeSessionButton
          sessionCode={sessionCode}
          isFinalized={isSessionFinalized}
          hasItems={orderItems.length > 0}
        />
      )}
    </div>
  );
}
