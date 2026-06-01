import { Controller, Get, Post, Param, UseGuards, Request, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BadgesService } from './badges.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('badges')
@Controller('badges')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BadgesController {
  constructor(private badgesService: BadgesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available badges' })
  async getAllBadges() {
    try {
      return this.badgesService.getAllBadges();
    } catch (error) {
      console.error('Error fetching badges:', error);
      throw new InternalServerErrorException('Failed to fetch badges');
    }
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user badges' })
  async getUserBadges(@Request() req: any) {
    try {
      return this.badgesService.getUserBadges(req.user.id);
    } catch (error) {
      console.error('Error fetching user badges:', error);
      throw new InternalServerErrorException('Failed to fetch user badges');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get badge by ID' })
  async getBadgeById(@Param('id') id: string) {
    try {
      return this.badgesService.getBadgeById(id);
    } catch (error) {
      console.error('Error fetching badge:', error);
      throw new InternalServerErrorException('Failed to fetch badge');
    }
  }

  @Post('check/:userId')
  @ApiOperation({ summary: 'Check and award badges for user' })
  async checkAndAwardBadges(@Param('userId') userId: string) {
    try {
      return this.badgesService.checkAndAwardBadges(userId);
    } catch (error) {
      console.error('Error checking and awarding badges:', error);
      throw new InternalServerErrorException('Failed to check and award badges');
    }
  }
}
