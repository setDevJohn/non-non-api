import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserStatsDto } from './dto/user-stats.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        photoUrl: true,
        heightCm: true,
        weightKg: true,
        hydrationMode: true,
        hydrationGoalMl: true,
        birthDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateMe(userId: string, updateUserDto: UpdateUserDto) {
    const { weightKg, hydrationMode, birthDate, ...rest } = updateUserDto;

    // Recalculate hydration goal if weight changed
    let hydrationGoalMl = undefined;
    if (weightKg) {
      const mode = hydrationMode || '28ml';
      const multiplier = mode === '35ml' ? 35 : 28;
      hydrationGoalMl = Math.round(weightKg * multiplier);
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...rest,
        weightKg,
        hydrationMode,
        hydrationGoalMl,
        birthDate: birthDate ? new Date(birthDate) : undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        photoUrl: true,
        heightCm: true,
        weightKg: true,
        hydrationMode: true,
        hydrationGoalMl: true,
        birthDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        photoUrl: true,
        heightCm: true,
        weightKg: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUserStats(userId: string): Promise<UserStatsDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get total workouts
    const totalWorkouts = await this.prisma.workout.count({
      where: { userId },
    });

    // Get total points
    const workouts = await this.prisma.workout.findMany({
      where: { userId },
      select: { pointsEarned: true },
    });
    const totalPoints = workouts.reduce((sum, w) => sum + w.pointsEarned, 0);

    // Get badges count
    const badgesEarned = await this.prisma.userBadge.count({
      where: { userId, earnedAt: { not: null } },
    });

    // Get hydration stats for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayHydration = await this.prisma.hydrationLog.aggregate({
      where: {
        userId,
        loggedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      _sum: { amountMl: true },
    });

    const totalHydrationMl = todayHydration._sum.amountMl || 0;

    // Calculate streaks
    const streakData = await this.calculateStreaks(userId);

    return {
      totalWorkouts,
      totalPoints,
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      badgesEarned,
      totalHydrationMl,
      hydrationGoalsMet: totalHydrationMl >= user.hydrationGoalMl ? 1 : 0,
    };
  }

  private async calculateStreaks(userId: string) {
    const workouts = await this.prisma.workout.findMany({
      where: { userId },
      orderBy: { workoutDate: 'desc' },
      select: { workoutDate: true },
    });

    if (workouts.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    let currentStreak = 1;
    let longestStreak = 1;
    let tempStreak = 1;

    for (let i = 0; i < workouts.length - 1; i++) {
      const current = new Date(workouts[i].workoutDate);
      const next = new Date(workouts[i + 1].workoutDate);
      const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }

    // Calculate current streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastWorkout = new Date(workouts[0].workoutDate);
    const daysSinceLastWorkout = Math.floor((today.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceLastWorkout > 1) {
      currentStreak = 0;
    } else {
      currentStreak = 1;
      for (let i = 0; i < workouts.length - 1; i++) {
        const current = new Date(workouts[i].workoutDate);
        const next = new Date(workouts[i + 1].workoutDate);
        const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return { currentStreak, longestStreak };
  }
}
