import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderDto } from './dto/update-order.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { OrderStatus } from '../generated/prisma/enums.js';
import { NotFoundError } from '../errors.js';
import { Prisma } from '../generated/prisma/client.js';


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

  async findOne(id: string) {
    try {
      return await this.prismaService.order.findUniqueOrThrow({
      where: { id },
    });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'){
        throw new NotFoundError(`Pedido com ID ${id} não encontrado`);
      }
      throw error;
    }
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    try {
      return await this.prismaService.order.update({
        where: {id},
        data: updateOrderDto,
      });
        } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'){
        throw new NotFoundError(`Pedido com ID ${id} não encontrado`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prismaService.order.delete({
        where: {id}
      });
        } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'){
        throw new NotFoundError(`Pedido com ID ${id} não encontrado`);
      }
      throw error;
    }
  }
}
