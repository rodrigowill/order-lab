import { propagation, context } from '@opentelemetry/api';
import { Injectable, OnModuleInit } from "@nestjs/common";
import { connect, ChannelModel, Channel } from 'amqplib';
import { OrderEventPublisher } from "../../domain/order-event-publisher.js";

@Injectable()
export class RabbitOrderEventPublisher implements OrderEventPublisher, OnModuleInit {
    
    private channel: Channel;

    async onModuleInit() {
        const connection: ChannelModel = await connect(process.env.RABBITMQ_URL!);
        this.channel = await connection.createChannel();
        await this.channel.assertQueue('order.accept',  { durable: true });
        await this.channel.assertQueue('order.prepare', { durable: true });
        await this.channel.assertQueue('order.deliver', { durable: true });
    }

    private publish(queue: string, orderId: string) {
        const carrier: Record<string, string> = {};
        propagation.inject(context.active(), carrier);
        this.channel.sendToQueue(queue, Buffer.from(JSON.stringify({ orderId, otelCarrier: carrier })));
    }

    async publishCommandAccept(orderId: string): Promise<void> {
        this.publish('order.accept', orderId);
    }

    async publishCommandPrepare(orderId: string): Promise<void> {
        this.publish('order.prepare', orderId);
    }

    async publishCommandDeliver(orderId: string): Promise<void> {
        this.publish('order.deliver', orderId);

    }

}