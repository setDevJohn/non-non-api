import { Controller, Get, Post, Delete, Body, Param, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WorkoutsService } from './workouts.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('workouts')
@Controller('workouts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WorkoutsController {
  constructor(private workoutsService: WorkoutsService) {}

  @Post()
  @ApiOperation({ summary: 'Log a new workout' })
  async create(@CurrentUser('id') userId: string, @Body() createWorkoutDto: CreateWorkoutDto) {
    try {
      return this.workoutsService.create(userId, createWorkoutDto);
    } catch (error) {
      console.error('Error logging workout:', error);
      throw new InternalServerErrorException('Failed to log workout');
    }
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user workouts' })
  async getMyWorkouts(@CurrentUser('id') userId: string) {
    try {
      return this.workoutsService.getMyWorkouts(userId);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      throw new InternalServerErrorException('Failed to fetch workouts');
    }
  }

  @Get('me/weekly')
  @ApiOperation({ summary: 'Get current user weekly stats' })
  async getMyWeeklyStats(@CurrentUser('id') userId: string) {
    try {
      return this.workoutsService.getWeeklyStats(userId);
    } catch (error) {
      console.error('Error fetching weekly stats:', error);
      throw new InternalServerErrorException('Failed to fetch weekly stats');
    }
  }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Get workouts for an event' })
  async getEventWorkouts(@Param('eventId') eventId: string) {
    try {
      return this.workoutsService.getEventWorkouts(eventId);
    } catch (error) {
      console.error('Error fetching event workouts:', error);
      throw new InternalServerErrorException('Failed to fetch event workouts');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workout by ID' })
  async getWorkoutById(@Param('id') id: string) {
    try {
      return this.workoutsService.getWorkoutById(id);
    } catch (error) {
      console.error('Error fetching workout:', error);
      throw new InternalServerErrorException('Failed to fetch workout');
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete workout' })
  async deleteWorkout(@Param('id') id: string, @CurrentUser('id') userId: string) {
    try {
      return this.workoutsService.deleteWorkout(id, userId);
    } catch (error) {
      console.error('Error deleting workout:', error);
      throw new InternalServerErrorException('Failed to delete workout');
    }
  }
}
