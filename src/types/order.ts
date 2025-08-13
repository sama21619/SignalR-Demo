// export type OrderItemStatus = 'Pending' | 'Preparing' | 'Served';

export interface OrderItem {
    id: string;
    dishName: string;
    price: number;
    addedBy: string;
    status: number;
}

export interface SessionInfo {
    tableName: string;
    items: OrderItem[];
    isFinalized: boolean;
    hostConnectionId: string;
}
export interface Order {
    sessionCode: string;
    tableName: string;
    items: OrderItem[];
};
