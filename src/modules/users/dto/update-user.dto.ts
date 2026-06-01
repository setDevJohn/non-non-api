import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'https://example.com/photo.jpg', required: false })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiProperty({ example: 175, required: false })
  @IsOptional()
  @IsNumber()
  heightCm?: number;

  @ApiProperty({ example: 75.5, required: false })
  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @ApiProperty({ example: '28ml', required: false })
  @IsOptional()
  @IsEnum(['28ml', '35ml'])
  hydrationMode?: string;

  @ApiProperty({ example: '1990-01-01', required: false })
  @IsOptional()
  @IsString()
  birthDate?: string;
}
