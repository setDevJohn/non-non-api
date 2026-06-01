import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EventsModule } from './modules/events/events.module';
import { WorkoutsModule } from './modules/workouts/workouts.module';
import { HydrationModule } from './modules/hydration/hydration.module';
import { FeedModule } from './modules/feed/feed.module';
import { RankingsModule } from './modules/rankings/rankings.module';
import { BadgesModule } from './modules/badges/badges.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SocialModule } from './modules/social/social.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    EventsModule,
    WorkoutsModule,
    HydrationModule,
    FeedModule,
    RankingsModule,
    BadgesModule,
    NotificationsModule,
    SocialModule,
    AdminModule,
  ],
})
export class AppModule {}
