import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async createNotification(userId: string, type: string, title: string, message: string, data?: any, senderId?: string) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        senderId,
        type,
        title,
        message,
        data: data ? JSON.stringify(data) : null,
      },
    });

    return notification;
  }

  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));

    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      skip,
      take: parseInt(String(limit)),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
          },
        },
      },
    });

    const total = await this.prisma.notification.count({ where: { userId } });
    const unreadCount = await this.prisma.notification.count({
      where: { userId, read: false },
    });

    return {
      notifications,
      total,
      unreadCount,
      page: parseInt(String(page)),
      totalPages: Math.ceil(total / parseInt(String(limit))),
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new Error('You can only mark your own notifications as read');
    }

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return updated;
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return { message: 'All notifications marked as read' };
  }

  async deleteNotification(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new Error('You can only delete your own notifications');
    }

    await this.prisma.notification.delete({
      where: { id: notificationId },
    });

    return { message: 'Notification deleted successfully' };
  }

  // Notification types helpers
  async sendWorkoutReminder(userId: string) {
    return this.createNotification(
      userId,
      'system',
      'Hora de treinar!',
      'Não esqueça de registrar seu treino de hoje.',
    );
  }

  async sendHydrationReminder(userId: string) {
    return this.createNotification(
      userId,
      'system',
      'Meta de água',
      'Você ainda não atingiu sua meta de água hoje.',
    );
  }

  async sendRecoveryAvailable(userId: string) {
    return this.createNotification(
      userId,
      'system',
      'Recuperação disponível',
      'Você ainda pode recuperar pontos neste fim de semana.',
    );
  }

  async sendSurpassedNotification(userId: string, senderId: string, eventName: string) {
    return this.createNotification(
      userId,
      'social',
      'Você foi ultrapassado!',
      'Alguém passou você no ranking do evento.',
      { eventName },
      senderId,
    );
  }

  async sendBelowAverageNotification(userId: string) {
    return this.createNotification(
      userId,
      'system',
      'Abaixo da média',
      'Você está abaixo da média. Treine mais para subir no ranking!',
    );
  }

  async sendEventInvite(userId: string, senderId: string, eventName: string) {
    return this.createNotification(
      userId,
      'event',
      'Convite para evento',
      `Você foi convidado para participar do evento: ${eventName}`,
      { eventName },
      senderId,
    );
  }

  async sendEventStarting(userId: string, eventName: string) {
    return this.createNotification(
      userId,
      'event',
      'Evento iniciando',
      `O evento ${eventName} está começando!`,
      { eventName },
    );
  }

  async sendEventFinished(userId: string, eventName: string) {
    return this.createNotification(
      userId,
      'event',
      'Evento finalizado',
      `O evento ${eventName} foi finalizado. Confira o ranking!`,
      { eventName },
    );
  }
}
