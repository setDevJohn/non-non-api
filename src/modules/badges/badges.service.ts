import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class BadgesService {
  constructor(private prisma: PrismaService) {}

  async getAllBadges() {
    const badges = await this.prisma.badge.findMany({
      orderBy: [
        { tier: 'asc' },
        { name: 'asc' },
      ],
    });

    return badges;
  }

  async getUserBadges(userId: string) {
    const userBadges = await this.prisma.userBadge.findMany({
      where: { userId },
      include: {
        badge: true,
      },
      orderBy: {
        earnedAt: 'desc',
      },
    });

    return userBadges;
  }

  async getBadgeById(id: string) {
    const badge = await this.prisma.badge.findUnique({
      where: { id },
    });

    if (!badge) {
      throw new NotFoundException('Badge not found');
    }

    return badge;
  }

  async updateBadgeProgress(userId: string, badgeId: string, progress: number) {
    const userBadge = await this.prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId,
        },
      },
    });

    if (!userBadge) {
      // Create new user badge
      const badge = await this.prisma.badge.findUnique({
        where: { id: badgeId },
      });

      if (!badge) {
        throw new NotFoundException('Badge not found');
      }

      const criteria = JSON.parse(badge.criteria);
      const requiredProgress = criteria.required || 100;

      const newUserBadge = await this.prisma.userBadge.create({
        data: {
          userId,
          badgeId,
          progress,
          earnedAt: progress >= requiredProgress ? new Date() : null,
        },
        include: {
          badge: true,
        },
      });

      return newUserBadge;
    }

    // Update existing user badge
    const badge = await this.prisma.badge.findUnique({
      where: { id: badgeId },
    });

    if (!badge) {
      throw new NotFoundException('Badge not found');
    }

    const criteria = JSON.parse(badge.criteria);
    const requiredProgress = criteria.required || 100;
    const wasEarned = userBadge.earnedAt !== null;
    const isEarned = progress >= requiredProgress;

    const updatedUserBadge = await this.prisma.userBadge.update({
      where: {
        userId_badgeId: {
          userId,
          badgeId,
        },
      },
      data: {
        progress,
        earnedAt: isEarned && !wasEarned ? new Date() : userBadge.earnedAt,
      },
      include: {
        badge: true,
      },
    });

    return updatedUserBadge;
  }

  async checkAndAwardBadges(userId: string) {
    // Get user stats
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const totalWorkouts = await this.prisma.workout.count({
      where: { userId },
    });

    const totalPoints = await this.prisma.workout.aggregate({
      where: { userId },
      _sum: { pointsEarned: true },
    });

    const hydrationGoalsMet = await this.prisma.hydrationLog.groupBy({
      by: ['loggedAt'],
      where: { userId },
      _sum: { amountMl: true },
    });

    const goalsMetCount = hydrationGoalsMet.filter(
      (log) => (log._sum.amountMl || 0) >= user.hydrationGoalMl,
    ).length;

    // Get all badges
    const badges = await this.prisma.badge.findMany();

    const awardedBadges = [];

    for (const badge of badges) {
      const criteria = JSON.parse(badge.criteria);
      let progress = 0;
      let shouldAward = false;

      // Check badge criteria
      if (badge.name.includes('Água')) {
        progress = Math.min((goalsMetCount / criteria.required) * 100, 100);
        shouldAward = goalsMetCount >= criteria.required;
      } else if (badge.name.includes('Treino')) {
        progress = Math.min((totalWorkouts / criteria.required) * 100, 100);
        shouldAward = totalWorkouts >= criteria.required;
      } else if (badge.name.includes('Pontos')) {
        progress = Math.min(((totalPoints._sum.pointsEarned || 0) / criteria.required) * 100, 100);
        shouldAward = (totalPoints._sum.pointsEarned || 0) >= criteria.required;
      }

      if (shouldAward) {
        const userBadge = await this.updateBadgeProgress(userId, badge.id, progress);
        if (userBadge.earnedAt) {
          awardedBadges.push(userBadge);
        }
      }
    }

    return awardedBadges;
  }
}
