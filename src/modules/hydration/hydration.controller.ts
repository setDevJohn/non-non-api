import { Controller, Get, Post, Delete, Body, Param, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HydrationService } from './hydration.service';
import { CreateHydrationDto } from './dto/create-hydration.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('hydration')
@Controller('hydration')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HydrationController {
  constructor(private hydrationService: HydrationService) {}

  @Post()
  @ApiOperation({ summary: 'Log water intake' })
  async create(@CurrentUser('id') userId: string, @Body() createHydrationDto: CreateHydrationDto) {
    try {
      return this.hydrationService.create(userId, createHydrationDto);
    } catch (error) {
      console.error('Error logging water intake:', error);
      throw new InternalServerErrorException('Failed to log water intake');
    }
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user hydration logs' })
  async getMyHydration(@CurrentUser('id') userId: string) {
    try {
      return this.hydrationService.getMyHydration(userId);
    } catch (error) {
      console.error('Error fetching hydration logs:', error);
      throw new InternalServerErrorException('Failed to fetch hydration logs');
    }
  }

  @Get('today')
  @ApiOperation({ summary: 'Get today hydration stats' })
  async getTodayHydration(@CurrentUser('id') userId: string) {
    try {
      return this.hydrationService.getTodayHydration(userId);
    } catch (error) {
      console.error('Error fetching today hydration stats:', error);
      throw new InternalServerErrorException('Failed to fetch today hydration stats');
    }
  }

  @Get('weekly')
  @ApiOperation({ summary: 'Get weekly hydration stats' })
  async getWeeklyHydration(@CurrentUser('id') userId: string) {
    try {
      return this.hydrationService.getWeeklyHydration(userId);
    } catch (error) {
      console.error('Error fetching weekly hydration stats:', error);
      throw new InternalServerErrorException('Failed to fetch weekly hydration stats');
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete hydration log' })
  async deleteLog(@Param('id') id: string, @CurrentUser('id') userId: string) {
    try {
      return this.hydrationService.deleteLog(id, userId);
    } catch (error) {
      console.error('Error deleting hydration log:', error);
      throw new InternalServerErrorException('Failed to delete hydration log');
    }
  }
}
