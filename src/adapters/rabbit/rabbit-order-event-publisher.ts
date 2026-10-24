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

    async publishCommandAccept(orderId: string): Promise<void> {
        this.channel.sendToQueue('order.accept', Buffer.from(JSON.stringify({ orderId })));
    }

    async publishCommandPrepare(orderId: string): Promise<void> {
        this.channel.sendToQueue('order.prepare', Buffer.from(JSON.stringify({ orderId })));
    }

    async publishCommandDeliver(orderId: string): Promise<void> {
        this.channel.sendToQueue('order.deliver', Buffer.from(JSON.stringify({ orderId })));
    }

}