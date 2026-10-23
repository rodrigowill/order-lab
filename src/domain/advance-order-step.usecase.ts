import { Order } from "./order.entity";
import { OrderRepository } from "./order.repository";


export class AdvanceOrderStepUseCase {
    constructor(private readonly repository: OrderRepository){}

    async execute(id: string):Promise<Order> {
        const order = await this.repository.findById(id);
        if(!order){
            throw new Error(`Pedido ${id} não encontrado.`);
        }
        const advanced = order.advance();
        await this.repository.save(advanced);
        return advanced;
    }
}