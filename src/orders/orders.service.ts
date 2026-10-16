import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderDto } from './dto/update-order.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { OrderStatus } from '../generated/prisma/enums.js';

@Injectable()
export class OrdersService {

  constructor(private prismaService: PrismaService){}

  create(createOrderDto: CreateOrderDto) {
    return this.prismaService.order.create({
      data: {
        ...createOrderDto, status: OrderStatus.INCLUDED,
      }
    })
  }

  findAll() {
    return this.prismaService.order.findMany();
  }

  findOne(id: string) {
    return this.prismaService.order.findUnique({
      where: { id },
    });
  }

  update(id: string, updateOrderDto: UpdateOrderDto) {
    return this.prismaService.order.update({
      where: {id},
      data: updateOrderDto,
    });
  }

  remove(id: string) {
    return this.prismaService.order.delete({
      where: {id}
    });
  }
}
