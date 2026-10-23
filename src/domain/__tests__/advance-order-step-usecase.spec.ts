
import { AdvanceOrderStepUseCase } from "../advance-order-step.usecase";
import { Order } from "../order.entity";
import { OrderStatus } from "../order-status";
import { InMemoryOrderRepository } from "./in-memory-order.repository";



describe('AdvanceOrderStepUseCase', () => {
    
    it('avança o status do pedido e persiste', async () => {
        const repo = new InMemoryOrderRepository();
        const useCase = new AdvanceOrderStepUseCase(repo);
        await repo.save(new Order('id-1', 'X-Burguer', 'com extra cheese', 25, OrderStatus.INCLUDED));

        const result = await useCase.execute('id-1');

        expect(result.status).toBe(OrderStatus.RECEIVED);

        const saved = await repo.findById('id-1');
        expect(saved?.status).toBe(OrderStatus.RECEIVED);
    });

    it('lança erro para pedido inexistente', async () => {
        const usaCase = new AdvanceOrderStepUseCase(new InMemoryOrderRepository());
        await expect(usaCase.execute('nao-existe')).rejects.toThrow();
    });
    
    it('lança erro ao tentar avançar pedido já entregue', async () => {
        const repo = new InMemoryOrderRepository();
        const useCase = new AdvanceOrderStepUseCase(repo);
        const delivered = new Order('id-1', 'X', 'desc', 10, OrderStatus.DELIVERED);
        await repo.save(delivered);
        await expect(useCase.execute('id-1')).rejects.toThrow();
    });
});