export type OrderStatus = 'INCLUDED' | 'RECEIVED' | 'PREPARED' | 'DELIVERED';

export interface Order {
    id: string;
    name: string;
    description: string;
    value: number;
    status: OrderStatus;
}