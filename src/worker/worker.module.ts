import { Module } from "@nestjs/common";
import { PrismaModule } from "../adapters/prisma/prisma.module.js";
import { PrismaOrderRepository } from "../adapters/prisma/prisma-order.repository.js";
import { OrderRepository } from "../domain/order.repository.js";
import { AdvanceOrderStepUseCase } from "../domain/advance-order-step.usecase.js";
import { OrderStepConsumer } from "./order-step.consumer.js";

@Module({
    imports: [PrismaModule],
    providers: [
        PrismaOrderRepository,
        {provide: OrderRepository, useExisting: PrismaOrderRepository},
        {
            provide: AdvanceOrderStepUseCase,
            useFactory: (repo: OrderRepository) => new AdvanceOrderStepUseCase(repo),
            inject: [OrderRepository],
        },
        OrderStepConsumer,
    ],
})
export class WorkerModule {}
