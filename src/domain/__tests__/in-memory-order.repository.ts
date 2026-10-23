import { Order } from "../order.entity";
import { OrderRepository } from "../order.repository";


export class InMemoryOrderRepository implements OrderRepository {
    private readonly store = new Map<string, Order>();
    
    async save(order: Order): Promise<void> {
        this.store.set(order.id, order);
    }

    async findById(id: string): Promise<Order | null> {
        return this.store.get(id) ?? null;
    }

    async findAll(): Promise<Order[]> {
        return Array.from(this.store.values());
    }
}