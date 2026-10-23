import { OrderStatus } from "../order-status";
import { Order } from "../order.entity";


describe('Order - máquina de estados', () => {
    const base = new Order('id-1', 'X-Burguer', 'completo e com cheddar', 25.9, OrderStatus.INCLUDED)

    it('avança de INCLUDED para RECEIVED', () => {
        const next = base.advance();
        expect(next.status).toBe(OrderStatus.RECEIVED);
    });

    it('percorre os quatro estados na ordem', () => {
        const delivered = base.advance().advance().advance();
        expect(delivered.status).toBe(OrderStatus.DELIVERED);
    });

    it('lança erro ao tentar avançar além de DELIVERED', () => {
        const delivered = base.advance().advance().advance();
        expect(() => delivered.advance()).toThrow();
    });

    it('cada advance() retorna uma nova instância', () => {
        const next = base.advance();
        expect(next).not.toBe(base);
        expect(base.status).toBe(OrderStatus.INCLUDED);
    });

});