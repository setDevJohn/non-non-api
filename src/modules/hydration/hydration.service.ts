import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateHydrationDto } from './dto/create-hydration.dto';

@Injectable()
export class HydrationService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createHydrationDto: CreateHydrationDto) {
    const { amountMl } = createHydrationDto;

    const hydrationLog = await this.prisma.hydrationLog.create({
      data: {
        userId,
        amountMl,
      },
    });

    // Check if user reached hydration goal and award points
    await this.checkAndAwardHydrationPoints(userId);

    return hydrationLog;
  }

  private async checkAndAwardHydrationPoints(userId: string) {
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

    const totalMl = todayHydration._sum.amountMl || 0;

    // Get user's hydration goal
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { hydrationGoalMl: true },
    });

    const goal = user?.hydrationGoalMl || 2000;

    // Check if goal is met
    if (totalMl >= goal) {
      // Check if points already awarded today for hydration
      const todayWorkouts = await this.prisma.workout.findMany({
        where: {
          userId,
          workoutDate: {
            gte: today,
            lt: tomorrow,
          },
        },
      });

      const hasHydrationPoints = todayWorkouts.some((w) => w.pointsEarned > 0);

      if (!hasHydrationPoints) {
        // Award 1 point for meeting hydration goal
        // We'll create a special workout entry for hydration points
        await this.prisma.workout.create({
          data: {
            userId,
            workoutType: 'hydration_goal',
            duration: 0,
            pointsEarned: 1,
            workoutDate: new Date(),
            notes: 'Meta de água atingida',
          },
        });

        // Create post for hydration achievement
        await this.prisma.post.create({
          data: {
            userId,
            type: 'hydration',
            content: 'Atingiu a meta de água hoje! +1 ponto',
          },
        });
      }
    }
  }

  async getMyHydration(userId: string) {
    const logs = await this.prisma.hydrationLog.findMany({
      where: { userId },
      orderBy: {
        loggedAt: 'desc',
      },
      take: 100,
    });

    return logs;
  }

  async getTodayHydration(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const logs = await this.prisma.hydrationLog.findMany({
      where: {
        userId,
        loggedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: {
        loggedAt: 'desc',
      },
    });

    const totalMl = logs.reduce((sum, log) => sum + log.amountMl, 0);

    // Get user's hydration goal
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { hydrationGoalMl: true },
    });

    const goal = user?.hydrationGoalMl || 2000;
    const percentage = Math.min(Math.round((totalMl / goal) * 100), 100);
    const goalMet = totalMl >= goal;

    return {
      totalMl,
      goal,
      percentage,
      goalMet,
      logs,
    };
  }

  async deleteLog(id: string, userId: string) {
    const log = await this.prisma.hydrationLog.findUnique({
      where: { id },
    });

    if (!log) {
      throw new Error('Hydration log not found');
    }

    if (log.userId !== userId) {
      throw new Error('You can only delete your own logs');
    }

    await this.prisma.hydrationLog.delete({
      where: { id },
    });

    return { message: 'Hydration log deleted successfully' };
  }

  async getWeeklyHydration(userId: string) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const logs = await this.prisma.hydrationLog.findMany({
      where: {
        userId,
        loggedAt: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
      orderBy: {
        loggedAt: 'desc',
      },
    });

    const totalMl = logs.reduce((sum, log) => sum + log.amountMl, 0);

    // Group by day
    const dailyTotals: Record<string, number> = {};
    logs.forEach((log) => {
      const date = new Date(log.loggedAt).toDateString();
      dailyTotals[date] = (dailyTotals[date] || 0) + log.amountMl;
    });

    return {
      totalMl,
      dailyTotals,
      logs,
    };
  }
}
