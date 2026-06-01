import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { InviteParticipantDto } from './dto/invite-participant.dto';
import { UpdateEventStatusDto } from './dto/update-event-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('events')
@Controller('events')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  async create(@CurrentUser('id') userId: string, @Body() createEventDto: CreateEventDto) {
    try {
      return this.eventsService.create(userId, createEventDto);
    } catch (error) {
      console.error('Error creating event:', error);
      throw new InternalServerErrorException('Failed to create event');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all events for current user' })
  async findAll(@CurrentUser('id') userId: string) {
    try {
      return this.eventsService.findAll(userId);
    } catch (error) {
      console.error('Error fetching events:', error);
      throw new InternalServerErrorException('Failed to fetch events');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  async findOne(@Param('id') id: string) {
    try {
      return this.eventsService.findOne(id);
    } catch (error) {
      console.error('Error fetching event:', error);
      throw new InternalServerErrorException('Failed to fetch event');
    }
  }

  @Post(':id/invite')
  @ApiOperation({ summary: 'Invite participants to event' })
  async inviteParticipants(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() inviteDto: InviteParticipantDto,
  ) {
    try {
      return this.eventsService.inviteParticipants(id, userId, inviteDto);
    } catch (error) {
      console.error('Error inviting participants:', error);
      throw new InternalServerErrorException('Failed to invite participants');
    }
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Confirm participation in event' })
  async confirmParticipation(@Param('id') id: string, @CurrentUser('id') userId: string) {
    try {
      return this.eventsService.confirmParticipation(id, userId);
    } catch (error) {
      console.error('Error confirming participation:', error);
      throw new InternalServerErrorException('Failed to confirm participation');
    }
  }

  @Delete(':id/participants/:participantId')
  @ApiOperation({ summary: 'Remove participant from event' })
  async removeParticipant(
    @Param('id') id: string,
    @Param('participantId') participantId: string,
    @CurrentUser('id') userId: string,
  ) {
    try {
      return this.eventsService.removeParticipant(id, userId, participantId);
    } catch (error) {
      console.error('Error removing participant:', error);
      throw new InternalServerErrorException('Failed to remove participant');
    }
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update event status' })
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateStatusDto: UpdateEventStatusDto,
  ) {
    try {
      return this.eventsService.updateStatus(id, userId, updateStatusDto);
    } catch (error) {
      console.error('Error updating event status:', error);
      throw new InternalServerErrorException('Failed to update event status');
    }
  }

  @Post(':id/promote')
  @ApiOperation({ summary: 'Promote participant to admin' })
  async promoteAdmin(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: { userId: string },
  ) {
    try {
      return this.eventsService.promoteAdmin(id, userId, body.userId);
    } catch (error) {
      console.error('Error promoting participant to admin:', error);
      throw new InternalServerErrorException('Failed to promote participant to admin');
    }
  }
}
