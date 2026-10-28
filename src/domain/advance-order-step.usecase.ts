import { Injectable } from "@nestjs/common";
import { Order } from "./order.entity.js";
import { OrderRepository } from "./order.repository.js";
import { NotFoundError } from "./errors.js";

@Injectable()
export class AdvanceOrderStepUseCase {
    constructor(private readonly repository: OrderRepository){}

    async execute(id: string):Promise<Order> {
        const order = await this.repository.findById(id);
        if(!order){
            throw new NotFoundError(`Pedido ${id} não encontrado.`);
        }
        const advanced = order.advance();
        await this.repository.save(advanced);
        return advanced;
    }
}