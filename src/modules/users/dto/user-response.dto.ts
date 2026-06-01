import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'https://example.com/photo.jpg', required: false })
  photoUrl?: string;

  @ApiProperty({ example: 175, required: false })
  heightCm?: number;

  @ApiProperty({ example: 75.5, required: false })
  weightKg?: number;

  @ApiProperty({ example: '28ml' })
  hydrationMode: string;

  @ApiProperty({ example: 2100 })
  hydrationGoalMl: number;

  @ApiProperty({ example: '1990-01-01T00:00:00Z', required: false })
  birthDate?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
