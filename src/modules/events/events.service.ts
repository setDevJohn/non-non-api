import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { InviteParticipantDto } from './dto/invite-participant.dto';
import { UpdateEventStatusDto } from './dto/update-event-status.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createEventDto: CreateEventDto) {
    const event = await this.prisma.event.create({
      data: {
        ...createEventDto,
        startDate: new Date(createEventDto.startDate),
        endDate: new Date(createEventDto.endDate),
        admins: {
          create: {
            userId,
          },
        },
      },
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
        participants: {
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
    });

    return event;
  }

  async findAll(userId: string) {
    const events = await this.prisma.event.findMany({
      where: {
        OR: [
          {
            admins: {
              some: { userId },
            },
          },
          {
            participants: {
              some: { userId },
            },
          },
        ],
      },
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
        participants: {
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
        _count: {
          select: {
            participants: true,
            workouts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return events;
  }

  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
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
        participants: {
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
        workouts: {
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
        },
        _count: {
          select: {
            participants: true,
            workouts: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  async inviteParticipants(eventId: string, userId: string, inviteDto: InviteParticipantDto) {
    // Check if user is admin
    const isAdmin = await this.prisma.eventAdmin.findFirst({
      where: {
        eventId,
        userId,
      },
    });

    if (!isAdmin) {
      throw new BadRequestException('Only admins can invite participants');
    }

    // Create participants
    const participants = await Promise.all(
      inviteDto.userIds.map((userId) =>
        this.prisma.eventParticipant.create({
          data: {
            eventId,
            userId,
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
        }),
      ),
    );

    // Update event status to waiting_confirmation
    await this.prisma.event.update({
      where: { id: eventId },
      data: { status: 'waiting_confirmation' },
    });

    return participants;
  }

  async confirmParticipation(eventId: string, userId: string) {
    const participant = await this.prisma.eventParticipant.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    const updated = await this.prisma.eventParticipant.update({
      where: {
        eventId_userId: {
          eventId,
          userId,
        },
      },
      data: { confirmed: true },
    });

    // Check if all participants confirmed
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        participants: true,
      },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    const allConfirmed = event.participants.every((p) => p.confirmed);

    if (allConfirmed) {
      await this.prisma.event.update({
        where: { id: eventId },
        data: { status: 'ready' },
      });
    }

    return updated;
  }

  async removeParticipant(eventId: string, userId: string, participantUserId: string) {
    // Check if user is admin
    const isAdmin = await this.prisma.eventAdmin.findFirst({
      where: {
        eventId,
        userId,
      },
    });

    if (!isAdmin) {
      throw new BadRequestException('Only admins can remove participants');
    }

    await this.prisma.eventParticipant.delete({
      where: {
        eventId_userId: {
          eventId,
          userId: participantUserId,
        },
      },
    });

    return { message: 'Participant removed successfully' };
  }

  async updateStatus(eventId: string, userId: string, updateStatusDto: UpdateEventStatusDto) {
    // Check if user is admin
    const isAdmin = await this.prisma.eventAdmin.findFirst({
      where: {
        eventId,
        userId,
      },
    });

    if (!isAdmin) {
      throw new BadRequestException('Only admins can update event status');
    }

    const event = await this.prisma.event.update({
      where: { id: eventId },
      data: { status: updateStatusDto.status },
    });

    return event;
  }

  async promoteAdmin(eventId: string, userId: string, participantUserId: string) {
    // Check if user is admin
    const isAdmin = await this.prisma.eventAdmin.findFirst({
      where: {
        eventId,
        userId,
      },
    });

    if (!isAdmin) {
      throw new BadRequestException('Only admins can promote other admins');
    }

    // Check if participant exists
    const participant = await this.prisma.eventParticipant.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: participantUserId,
        },
      },
    });

    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    // Check if already admin
    const alreadyAdmin = await this.prisma.eventAdmin.findFirst({
      where: {
        eventId,
        userId: participantUserId,
      },
    });

    if (alreadyAdmin) {
      throw new BadRequestException('User is already an admin');
    }

    const admin = await this.prisma.eventAdmin.create({
      data: {
        eventId,
        userId: participantUserId,
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

    return admin;
  }
}
