export enum OrderStatus {
    INCLUDED = 'INCLUDED',
    RECEIVED = 'RECEIVED',
    PREPARED = 'PREPARED',
    DELIVERED = 'DELIVERED',
}

export const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
    [OrderStatus.INCLUDED]:  OrderStatus.RECEIVED,
    [OrderStatus.RECEIVED]:  OrderStatus.PREPARED,
    [OrderStatus.PREPARED]:  OrderStatus.DELIVERED,
    [OrderStatus.DELIVERED]: null,
};
