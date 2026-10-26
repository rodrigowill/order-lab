import 'dotenv/config';
import { NestFactory } from "@nestjs/core";
import { WorkerModule } from "./worker.module.js";


async function bootstrap() {
    const app = await NestFactory.createApplicationContext(WorkerModule);
    await app.init();
    console.log('Worker Iniciado. Aguardando mensagens...');
}

void bootstrap();
