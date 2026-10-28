import { IsNotEmpty, IsNumber, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateOrderDto {
  @MaxLength(100)
  @IsString()
  @IsNotEmpty()
  name: string;

  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsPositive()
  @IsNumber()
  @IsNotEmpty()
  value: number;
}