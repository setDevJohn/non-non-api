import { IsEmail, IsString, MinLength, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe', minLength: 2 })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 175, required: false })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiProperty({ example: 70, required: false })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiProperty({ example: '1990-01-01', required: false })
  @IsOptional()
  @IsString()
  birthDate?: string;

  @ApiProperty({ example: '35ml/kg', required: false, enum: ['28ml/kg', '35ml/kg'] })
  @IsOptional()
  @IsEnum(['28ml/kg', '35ml/kg'])
  hydrationOption?: '28ml/kg' | '35ml/kg';
}
