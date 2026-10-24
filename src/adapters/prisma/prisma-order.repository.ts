import { Injectable } from "@nestjs/common";
import { OrderRepository } from "../../domain/order.repository.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { Order } from "../../domain/order.entity.js";
import { OrderStatus } from "../../domain/order-status.js";


@Injectable()
export class PrismaOrderRepository implements OrderRepository {
    
    constructor(private readonly prisma: PrismaService) {}
    
    async save(order: Order): Promise<void> {
        await this.prisma.order.upsert({
            where: {id: order.id},
            create: {
                id: order.id,
                name: order.name,
                description: order.description,
                value: order.value,
                status: order.status,
            },
            update: {
                status: order.status,
            },
        });
    }

    async findById(id: string): Promise<Order | null> {
        const row = await this.prisma.order.findUnique({where: {id}});
        if (!row) return null;
        return new Order(row.id, row.name, row.description, Number(row.value), row.status as OrderStatus);
    }

    async findAll(): Promise<Order[]> {
        const rows = await this.prisma.order.findMany();
        return rows.map(row => 
            new Order(row.id, row.name, row.description, Number(row.value), row.status as OrderStatus)
        );
    }

}