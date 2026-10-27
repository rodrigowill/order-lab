import { Injectable, OnModuleInit } from "@nestjs/common";
import { connect, ChannelModel, Channel } from 'amqplib';
import { AdvanceOrderStepUseCase } from "../domain/advance-order-step.usecase.js";
import { propagation, context } from '@opentelemetry/api';


@Injectable()
export class OrderStepConsumer implements OnModuleInit {
    private channel!: Channel;

    constructor(private readonly advanceOrderStep: AdvanceOrderStepUseCase) {}

    async onModuleInit() {
        const connection: ChannelModel = await connect(process.env.RABBITMQ_URL!);
        this.channel = await connection.createChannel();

        await this.channel.assertQueue('order.accept', {durable: true});
        await this.channel.assertQueue('order.prepare', {durable: true});
        await this.channel.assertQueue('order.deliver', {durable: true});

        this.channel.consume('order.accept', msg => this.handle(msg));
        this.channel.consume('order.prepare', msg => this.handle(msg));
        this.channel.consume('order.deliver', msg => this.handle(msg));
    }

    private async handle(msg: any) {
        if (!msg) return;
        try {
            const {orderId, otelCarrier} = JSON.parse(msg.content.toString());

            const parentContext = propagation.extract(context.active(), otelCarrier ?? {});

            await context.with(parentContext, async () => {
                await this.advanceOrderStep.execute(orderId);
                console.log(`Pedido ${orderId} avançado com sucesso`);
            });

            this.channel.ack(msg);
        } catch (error) {
            console.error('Erro ao processar mensagem: ', error);
            this.channel.nack(msg, false, false);
        }
    }

}