import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';

@Injectable()
export class WorkoutsService {
  constructor(private prisma: PrismaService) {}

  private calculatePoints(date: Date): number {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Monday (1): +2 points
    if (dayOfWeek === 1) return 2;
    
    // Tuesday-Thursday (2-4): +1 point
    if (dayOfWeek >= 2 && dayOfWeek <= 4) return 1;
    
    // Friday (5): +2 points
    if (dayOfWeek === 5) return 2;
    
    // Saturday-Sunday (0, 6): 0 points (recovery)
    return 0;
  }

  private async canDoWeekendRecovery(userId: string): Promise<boolean> {
    // Check if user is below average
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const allWorkouts = await this.prisma.workout.findMany({
      where: {
        workoutDate: {
          gte: startOfWeek,
        },
      },
    });

    // Calculate average points
    const userPoints = await this.prisma.workout.aggregate({
      where: {
        userId,
        workoutDate: {
          gte: startOfWeek,
        },
      },
      _sum: { pointsEarned: true },
    });

    const totalUsers = new Set(allWorkouts.map((w) => w.userId)).size;
    const totalPoints = allWorkouts.reduce((sum, w) => sum + w.pointsEarned, 0);
    const averagePoints = totalUsers > 0 ? totalPoints / totalUsers : 0;
    const userTotalPoints = userPoints._sum.pointsEarned || 0;

    // User must be below average
    if (userTotalPoints >= averagePoints) {
      return false;
    }

    // User must have trained at least 1x during the week
    const userWorkoutsThisWeek = await this.prisma.workout.count({
      where: {
        userId,
        workoutDate: {
          gte: startOfWeek,
        },
      },
    });

    return userWorkoutsThisWeek >= 1;
  }

  async create(userId: string, createWorkoutDto: CreateWorkoutDto) {
    const { workoutDate, eventId, ...rest } = createWorkoutDto;
    
    // Use provided date or current date
    const date = workoutDate ? new Date(workoutDate) : new Date();
    
    // Check if workout already exists for this date
    const existingWorkout = await this.prisma.workout.findFirst({
      where: {
        userId,
        workoutDate: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
      },
    });

    if (existingWorkout) {
      throw new BadRequestException('Workout already logged for this date');
    }

    // Calculate points based on day of week
    let pointsEarned = this.calculatePoints(date);

    // Weekend recovery: if it's weekend and user qualifies, give recovery points
    const dayOfWeek = date.getDay();
    if ((dayOfWeek === 0 || dayOfWeek === 6) && await this.canDoWeekendRecovery(userId)) {
      pointsEarned = 1; // Recovery points
    }

    // Create workout
    const workout = await this.prisma.workout.create({
      data: {
        ...rest,
        userId,
        eventId,
        pointsEarned,
        workoutDate: date,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
          },
        },
      },
    });

    // Create post for workout
    await this.prisma.post.create({
      data: {
        userId,
        eventId: eventId || null,
        type: 'workout',
        content: `Completed a ${workout.workoutType} workout for ${pointsEarned} points!`,
        imageUrl: workout.imageUrl,
      },
    });

    return workout;
  }

  async getMyWorkouts(userId: string) {
    const workouts = await this.prisma.workout.findMany({
      where: { userId },
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

    return workouts;
  }

  async getEventWorkouts(eventId: string) {
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

    return workouts;
  }

  async getWorkoutById(id: string) {
    const workout = await this.prisma.workout.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
          },
        },
        event: {
          include: {
            admins: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    photoUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!workout) {
      throw new NotFoundException('Workout not found');
    }

    return workout;
  }

  async deleteWorkout(id: string, userId: string) {
    const workout = await this.prisma.workout.findUnique({
      where: { id },
    });

    if (!workout) {
      throw new NotFoundException('Workout not found');
    }

    if (workout.userId !== userId) {
      throw new BadRequestException('You can only delete your own workouts');
    }

    await this.prisma.workout.delete({
      where: { id },
    });

    return { message: 'Workout deleted successfully' };
  }

  async getWeeklyStats(userId: string) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const workouts = await this.prisma.workout.findMany({
      where: {
        userId,
        workoutDate: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
    });

    const totalPoints = workouts.reduce((sum, w) => sum + w.pointsEarned, 0);
    const totalWorkouts = workouts.length;

    return {
      totalPoints,
      totalWorkouts,
      workouts,
    };
  }
}
