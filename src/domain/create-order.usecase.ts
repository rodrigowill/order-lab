import { OrderStatus } from "./order-status";
import { Order } from "./order.entity";
import { OrderRepository } from "./order.repository";


export interface CreateOrderInput {
    id: string;
    name: string;
    description: string;
    value: number;
}

export class CreateOrderUseCase {
    constructor(private readonly repository: OrderRepository){}

    async execute(input: CreateOrderInput): Promise<Order> {
        const order = new Order(
            input.id,
            input.name,
            input.description,
            input.value,
            OrderStatus.INCLUDED,
        );
        await this.repository.save(order);
        return order;
    }
}
