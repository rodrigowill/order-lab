import { NEXT_STATUS, OrderStatus } from "./order-status.js";


export class Order {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly description: string,
        public readonly value: number,
        public readonly status: OrderStatus,
    ) {}

    advance(): Order {
        const next = NEXT_STATUS[this.status];
        if (next === null) {
            throw new Error(`Pedido ${this.id} já foi entregue e não pode avançar.`);
        }
        return new Order(this.id, this.name, this.description, this.value, next);
    }

    isDelivered(): boolean {
        return this.status === OrderStatus.DELIVERED
    }
}