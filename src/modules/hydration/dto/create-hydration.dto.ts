import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHydrationDto {
  @ApiProperty({ example: 250 })
  @IsNumber()
  amountMl: number;
}
