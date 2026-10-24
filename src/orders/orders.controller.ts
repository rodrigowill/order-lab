import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { CreateOrderUseCase } from '../domain/create-order.usecase.js';
import { AdvanceOrderStepUseCase } from '../domain/advance-order-step.usecase.js';
import { OrderEventPublisher } from '../domain/order-event-publisher.js';
import { OrderRepository } from '../domain/order.repository.js';
import { randomUUID } from 'crypto';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly createOrder: CreateOrderUseCase,
    private readonly advanceOrderStep: AdvanceOrderStepUseCase,
    private readonly publisher: OrderEventPublisher,
    private readonly repository: OrderRepository,
  ) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.createOrder.execute({
      id: randomUUID(),
      name: createOrderDto.name,
      description: createOrderDto.description,
      value: Number(createOrderDto.value),
    });
  }

  @Get()
  findAll() {
    return this.repository.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.repository.findById(id);
  }

  @Post(':id/accept')
  @HttpCode(202)
  async accept(@Param('id') id: string) {
    await this.advanceOrderStep.execute(id);
    await this.publisher.publishCommandAccept(id);
    return { message: 'Comando de aceite publicado.' };
  }

  @Post(':id/prepare')
  @HttpCode(202)
  async prepare(@Param('id') id: string) {
    await this.advanceOrderStep.execute(id);
    await this.publisher.publishCommandPrepare(id);
    return { message: 'Comando de preparo publicado'};
  }

  @Post(':id/deliver')
  @HttpCode(202)
  async deliver(@Param('id') id: string) {
        await this.advanceOrderStep.execute(id);
    await this.publisher.publishCommandDeliver(id);
    return { message: 'Comando de entrega publicado'};
  }

}
