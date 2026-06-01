import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { loggerMiddleware } from './common/middleware/logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // HTTP logger middleware
  app.use(loggerMiddleware);

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Gym Competition API')
    .setDescription('API for competitive fitness application\n\n## Modules\n- **Auth**: User authentication and registration\n- **Users**: User profile and statistics\n- **Events**: Event creation and management\n- **Workouts**: Workout logging and scoring\n- **Hydration**: Water intake tracking\n- **Feed**: Social feed with posts, likes, and comments\n- **Rankings**: Weekly and event rankings\n- **Badges**: Achievement system\n- **Notifications**: Push notifications and alerts\n- **Social**: Social interactions')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('events', 'Event management')
    .addTag('workouts', 'Workout logging')
    .addTag('hydration', 'Hydration tracking')
    .addTag('feed', 'Social feed')
    .addTag('rankings', 'Rankings and leaderboards')
    .addTag('badges', 'Achievement badges')
    .addTag('notifications', 'Push notifications')
    .addTag('social', 'Social interactions')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
