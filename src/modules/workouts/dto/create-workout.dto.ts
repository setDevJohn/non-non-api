import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkoutDto {
  @ApiProperty({ example: 'strength' })
  @IsString()
  workoutType: string;

  @ApiProperty({ example: 45 })
  @IsNumber()
  duration: number;

  @ApiProperty({ example: 'Great workout today', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 'https://example.com/workout.jpg', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: '2024-06-01T10:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  workoutDate?: string;

  @ApiProperty({ example: 'event-id-123', required: false })
  @IsOptional()
  @IsString()
  eventId?: string;
}
