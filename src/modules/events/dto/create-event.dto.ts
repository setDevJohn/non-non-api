import { IsString, IsOptional, IsDateString, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: 'Summer Fitness Challenge' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'A 30-day fitness challenge', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2024-06-01T00:00:00Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-06-30T23:59:59Z' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  entryFee?: number;
}
