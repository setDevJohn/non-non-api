import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEventStatusDto {
  @ApiProperty({ example: 'ready', enum: ['draft', 'waiting_confirmation', 'ready', 'active', 'finished', 'cancelled'] })
  @IsEnum(['draft', 'waiting_confirmation', 'ready', 'active', 'finished', 'cancelled'])
  status: string;
}
