import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class RankingsService {
  constructor(private prisma: PrismaService) {}

  async getWeeklyRanking(eventId?: string) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const whereClause: any = {
      workoutDate: {
        gte: startOfWeek,
        lte: endOfWeek,
      },
    };

    if (eventId) {
      whereClause.eventId = eventId;
    }

    const workouts = await this.prisma.workout.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
          },
        },
      },
      orderBy: {
        workoutDate: 'desc',
      },
    });

    // Calculate rankings
    const userPoints = new Map<string, number>();
    const userWorkoutCount = new Map<string, number>();
    const userHydrationGoalsMet = new Map<string, number>();

    for (const workout of workouts) {
      const userId = workout.userId;
      userPoints.set(userId, (userPoints.get(userId) || 0) + workout.pointsEarned);
      userWorkoutCount.set(userId, (userWorkoutCount.get(userId) || 0) + 1);
    }

    // Get hydration goals met for each user
    const users = Array.from(userPoints.keys());
    for (const userId of users) {
      const hydrationLogs = await this.prisma.hydrationLog.findMany({
        where: {
          userId,
          loggedAt: {
            gte: startOfWeek,
            lte: endOfWeek,
          },
        },
      });

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { hydrationGoalMl: true },
      });

      if (user) {
        const dailyTotals = new Map<string, number>();
        for (const log of hydrationLogs) {
          const date = new Date(log.loggedAt).toDateString();
          dailyTotals.set(date, (dailyTotals.get(date) || 0) + log.amountMl);
        }

        let goalsMet = 0;
        for (const [, amount] of dailyTotals) {
          if (amount >= user.hydrationGoalMl) {
            goalsMet++;
          }
        }
        userHydrationGoalsMet.set(userId, goalsMet);
      }
    }

    // Sort users by points (with tiebreakers)
    const rankings = Array.from(userPoints.entries())
      .map(([userId, points]) => ({
        userId,
        points,
        workoutCount: userWorkoutCount.get(userId) || 0,
        hydrationGoalsMet: userHydrationGoalsMet.get(userId) || 0,
      }))
      .sort((a, b) => {
        // Primary: points
        if (b.points !== a.points) return b.points - a.points;
        // Tiebreaker 1: more workouts
        if (b.workoutCount !== a.workoutCount) return b.workoutCount - a.workoutCount;
        // Tiebreaker 2: more hydration goals met
        if (b.hydrationGoalsMet !== a.hydrationGoalsMet) return b.hydrationGoalsMet - a.hydrationGoalsMet;
        return 0;
      })
      .map((item, index) => ({
        position: index + 1,
        userId: item.userId,
        points: item.points,
        workoutCount: item.workoutCount,
        hydrationGoalsMet: item.hydrationGoalsMet,
      }));

    // Get user details
    const rankingWithUsers = await Promise.all(
      rankings.map(async (ranking) => {
        const user = await this.prisma.user.findUnique({
          where: { id: ranking.userId },
          select: {
            id: true,
            name: true,
            photoUrl: true,
          },
        });
        return {
          ...ranking,
          user,
        };
      }),
    );

    return rankingWithUsers;
  }

  async getEventRanking(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const workouts = await this.prisma.workout.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
          },
        },
      },
      orderBy: {
        workoutDate: 'desc',
      },
    });

    // Calculate rankings
    const userPoints = new Map<string, number>();
    const userWorkoutCount = new Map<string, number>();

    for (const workout of workouts) {
      const userId = workout.userId;
      userPoints.set(userId, (userPoints.get(userId) || 0) + workout.pointsEarned);
      userWorkoutCount.set(userId, (userWorkoutCount.get(userId) || 0) + 1);
    }

    // Sort users by points (with tiebreakers)
    const rankings = Array.from(userPoints.entries())
      .map(([userId, points]) => ({
        userId,
        points,
        workoutCount: userWorkoutCount.get(userId) || 0,
      }))
      .sort((a, b) => {
        // Primary: points
        if (b.points !== a.points) return b.points - a.points;
        // Tiebreaker 1: more workouts
        if (b.workoutCount !== a.workoutCount) return b.workoutCount - a.workoutCount;
        return 0;
      })
      .map((item, index) => ({
        position: index + 1,
        userId: item.userId,
        points: item.points,
        workoutCount: item.workoutCount,
      }));

    // Get user details
    const rankingWithUsers = await Promise.all(
      rankings.map(async (ranking) => {
        const user = await this.prisma.user.findUnique({
          where: { id: ranking.userId },
          select: {
            id: true,
            name: true,
            photoUrl: true,
          },
        });
        return {
          ...ranking,
          user,
        };
      }),
    );

    return rankingWithUsers;
  }

  async getUserPosition(userId: string, eventId?: string) {
    const rankings = eventId
      ? await this.getEventRanking(eventId)
      : await this.getWeeklyRanking();

    const userRanking = rankings.find((r) => r.userId === userId);

    if (!userRanking) {
      return {
        position: null,
        points: 0,
      };
    }

    return {
      position: userRanking.position,
      points: userRanking.points,
    };
  }
}
