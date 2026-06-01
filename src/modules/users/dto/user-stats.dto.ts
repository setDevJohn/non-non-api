import { ApiProperty } from '@nestjs/swagger';

export class UserStatsDto {
  @ApiProperty({ example: 15 })
  totalWorkouts: number;

  @ApiProperty({ example: 25 })
  totalPoints: number;

  @ApiProperty({ example: 5 })
  currentStreak: number;

  @ApiProperty({ example: 10 })
  longestStreak: number;

  @ApiProperty({ example: 3 })
  badgesEarned: number;

  @ApiProperty({ example: 120 })
  totalHydrationMl: number;

  @ApiProperty({ example: 5 })
  hydrationGoalsMet: number;
}
