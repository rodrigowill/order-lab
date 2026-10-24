
import { InvalidOrderStepError, NotFoundError } from "../errors.js";
import { OrderStatus } from "./order-status.js";
import { OrderRepository } from "./order.repository.js";

export class ValidateOrderCommandUseCase {
    constructor(private readonly repository: OrderRepository) {}

    async execute(id: string, expectedStatus: OrderStatus): Promise<void> {
        const order = await this.repository.findById(id);
        if(!order){
            throw new NotFoundError(`Pedido ${id} não encontrado.`);
        }
    if (order.status !== expectedStatus) {
      throw new InvalidOrderStepError(id, order.status);
    }
    }
}
