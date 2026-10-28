import { Module } from '@nestjs/common';
import { OrdersModule } from './api/orders.module.js';

@Module({
  imports: [OrdersModule],
})

export class AppModule {}