export abstract class OrderEventPublisher {
    abstract publishCommandAccept(orderId: string): Promise<void>;
    abstract publishCommandPrepare(orderId: string): Promise<void>;
    abstract publishCommandDeliver(orderId: string): Promise<void>;
}