import { Controller, Get, Param, Query, UseGuards, Request, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RankingsService } from './rankings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('rankings')
@Controller('rankings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RankingsController {
  constructor(private rankingsService: RankingsService) {}

  @Get('weekly')
  @ApiOperation({ summary: 'Get weekly ranking' })
  async getWeeklyRanking(@Query('eventId') eventId?: string) {
    try {
      return this.rankingsService.getWeeklyRanking(eventId);
    } catch (error) {
      console.error('Error fetching weekly ranking:', error);
      throw new InternalServerErrorException('Failed to fetch weekly ranking');
    }
  }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Get event ranking' })
  async getEventRanking(@Param('eventId') eventId: string) {
    try {
      return this.rankingsService.getEventRanking(eventId);
    } catch (error) {
      console.error('Error fetching event ranking:', error);
      throw new InternalServerErrorException('Failed to fetch event ranking');
    }
  }

  @Get('position/me')
  @ApiOperation({ summary: 'Get current user position' })
  async getUserPosition(@Request() req: any, @Query('eventId') eventId?: string) {
    try {
      return this.rankingsService.getUserPosition(req.user.id, eventId);
    } catch (error) {
      console.error('Error fetching user position:', error);
      throw new InternalServerErrorException('Failed to fetch user position');
    }
  }
}
