import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeedService } from './feed.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('feed')
@Controller('feed')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FeedController {
  constructor(private feedService: FeedService) {}

  @Get('global')
  @ApiOperation({ summary: 'Get global feed' })
  async getGlobalFeed(@Request() req: any, @Query('page') page = 1, @Query('limit') limit = 20) {
    try {
      return this.feedService.getGlobalFeed(req.user.id, page, limit);
    } catch (error) {
      console.error('Error fetching global feed:', error);
      throw new InternalServerErrorException('Failed to fetch global feed');
    }
  }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Get event feed' })
  async getEventFeed(
    @Param('eventId') eventId: string,
    @Request() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    try {
      return this.feedService.getEventFeed(eventId, req.user.id, page, limit);
    } catch (error) {
      console.error('Error fetching event feed:', error);
      throw new InternalServerErrorException('Failed to fetch event feed');
    }
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user feed' })
  async getUserFeed(
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    try {
      return this.feedService.getUserFeed(userId, page, limit);
    } catch (error) {
      console.error('Error fetching user feed:', error);
      throw new InternalServerErrorException('Failed to fetch user feed');
    }
  }

  @Post(':postId/like')
  @ApiOperation({ summary: 'Like or unlike a post' })
  async likePost(@Param('postId') postId: string, @Request() req: any) {
    try {
      return this.feedService.likePost(postId, req.user.id);
    } catch (error) {
      console.error('Error liking post:', error);
      throw new InternalServerErrorException('Failed to like post');
    }
  }

  @Post(':postId/comment')
  @ApiOperation({ summary: 'Comment on a post' })
  async commentOnPost(
    @Param('postId') postId: string,
    @Request() req: any,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    try {
      return this.feedService.commentOnPost(postId, req.user.id, createCommentDto.content);
    } catch (error) {
      console.error('Error commenting on post:', error);
      throw new InternalServerErrorException('Failed to comment on post');
    }
  }

  @Get(':postId/comments')
  @ApiOperation({ summary: 'Get post comments' })
  async getPostComments(
    @Param('postId') postId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    try {
      return this.feedService.getPostComments(postId, page, limit);
    } catch (error) {
      console.error('Error fetching post comments:', error);
      throw new InternalServerErrorException('Failed to fetch post comments');
    }
  }
}
