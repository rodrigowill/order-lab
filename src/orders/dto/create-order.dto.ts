import { Decimal } from "@prisma/client/runtime/client";

export class CreateOrderDto {
    name: string;
    description: string;
    price: Decimal;
    status: string;
}
