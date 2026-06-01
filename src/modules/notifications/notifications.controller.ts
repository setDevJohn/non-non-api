import { Controller, Get, Post, Delete, Param, Query, UseGuards, Request, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user notifications' })
  async getUserNotifications(@Request() req: any, @Query('page') page = 1, @Query('limit') limit = 20) {
    try {
      return this.notificationsService.getUserNotifications(req.user.id, page, limit);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new InternalServerErrorException('Failed to fetch notifications');
    }
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id') id: string, @Request() req: any) {
    try {
      return this.notificationsService.markAsRead(id, req.user.id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new InternalServerErrorException('Failed to mark notification as read');
    }
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@Request() req: any) {
    try {
      return this.notificationsService.markAllAsRead(req.user.id);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new InternalServerErrorException('Failed to mark all notifications as read');
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  async deleteNotification(@Param('id') id: string, @Request() req: any) {
    try {
      return this.notificationsService.deleteNotification(id, req.user.id);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new InternalServerErrorException('Failed to delete notification');
    }
  }
}
