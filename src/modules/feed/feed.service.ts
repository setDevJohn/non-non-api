import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}

  async getGlobalFeed(userId: string, page = 1, limit = 20) {
    try {
      const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));

      const posts = await this.prisma.post.findMany({
        skip,
        take: parseInt(String(limit)),
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              photoUrl: true,
            },
          },
          event: {
            select: {
              id: true,
              name: true,
            },
          },
          likes: {
            where: { userId },
            select: {
              id: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      });

      const total = await this.prisma.post.count();

      return {
        posts,
        total,
        page: parseInt(String(page)),
        totalPages: Math.ceil(total / parseInt(String(limit))),
      };
    } catch (error) {
      console.error('Error in getGlobalFeed service:', error);
      throw error;
    }
  }

  async getEventFeed(eventId: string, userId: string, page = 1, limit = 20) {
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));

    const posts = await this.prisma.post.findMany({
      where: { eventId },
      skip,
      take: parseInt(String(limit)),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
          },
        },
        likes: {
          where: { userId },
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    const total = await this.prisma.post.count({ where: { eventId } });

    return {
      posts,
      total,
      page: parseInt(String(page)),
      totalPages: Math.ceil(total / parseInt(String(limit))),
    };
  }

  async getUserFeed(userId: string, page = 1, limit = 20) {
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));

    const posts = await this.prisma.post.findMany({
      where: { userId },
      skip,
      take: parseInt(String(limit)),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    const total = await this.prisma.post.count({ where: { userId } });

    return {
      posts,
      total,
      page: parseInt(String(page)),
      totalPages: Math.ceil(total / parseInt(String(limit))),
    };
  }

  async likePost(postId: string, userId: string) {
    // Check if post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if already liked
    const existingLike = await this.prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await this.prisma.like.delete({
        where: {
          postId_userId: {
            postId,
            userId,
          },
        },
      });
      return { liked: false };
    } else {
      // Like
      await this.prisma.like.create({
        data: {
          postId,
          userId,
        },
      });
      return { liked: true };
    }
  }

  async commentOnPost(postId: string, userId: string, content: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = await this.prisma.comment.create({
      data: {
        postId,
        userId,
        content,
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

    return comment;
  }

  async getPostComments(postId: string, page = 1, limit = 20) {
    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));

    const comments = await this.prisma.comment.findMany({
      where: { postId },
      skip,
      take: parseInt(String(limit)),
      orderBy: {
        createdAt: 'desc',
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

    const total = await this.prisma.comment.count({ where: { postId } });

    return {
      comments,
      total,
      page: parseInt(String(page)),
      totalPages: Math.ceil(total / parseInt(String(limit))),
    };
  }
}
