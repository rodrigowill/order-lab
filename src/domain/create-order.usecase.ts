import { Injectable } from "@nestjs/common";
import { OrderStatus } from "./order-status.js";
import { Order } from "./order.entity.js";
import { OrderRepository } from "./order.repository.js";


export interface CreateOrderInput {
    id: string;
    name: string;
    description: string;
    value: number;
}
@Injectable()
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
