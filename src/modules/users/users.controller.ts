import { Controller, Get, Patch, Body, Param, UseGuards, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@CurrentUser('id') userId: string) {
    try {
      return this.usersService.getMe(userId);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new InternalServerErrorException('Failed to fetch user profile');
    }
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(@CurrentUser('id') userId: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      return this.usersService.updateMe(userId, updateUserDto);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new InternalServerErrorException('Failed to update user profile');
    }
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Get current user statistics' })
  async getMyStats(@CurrentUser('id') userId: string) {
    try {
      return this.usersService.getUserStats(userId);
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      throw new InternalServerErrorException('Failed to fetch user statistics');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async getUserById(@Param('id') id: string) {
    try {
      return this.usersService.getUserById(id);
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }
}
