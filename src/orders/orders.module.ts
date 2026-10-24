import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { PrismaOrderRepository } from '../adapters/prisma/prisma-order.repository.js';
import { RabbitOrderEventPublisher } from '../adapters/rabbit/rabbit-order-event-publisher.js';
import { OrderRepository } from '../domain/order.repository.js';
import { OrderEventPublisher } from '../domain/order-event-publisher.js';
import { CreateOrderUseCase } from '../domain/create-order.usecase.js';
import { AdvanceOrderStepUseCase } from '../domain/advance-order-step.usecase.js';

@Module({
  imports: [PrismaModule],
  controllers: [OrdersController],
  providers: [
    PrismaOrderRepository,
    RabbitOrderEventPublisher,
    { provide: OrderRepository, useExisting: PrismaOrderRepository },
    { provide: OrderEventPublisher, useExisting: RabbitOrderEventPublisher },
    CreateOrderUseCase,
    AdvanceOrderStepUseCase,
  ],
})
export class OrdersModule {}
