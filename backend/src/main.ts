import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { Logger } from '@nestjs/common';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  // Security headers
  app.use(helmet());

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Enable CORS
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL || 'https://your-frontend.netlify.app'] 
      : ['http://localhost:5173', 'http://localhost:3002', 'http://localhost:3001', 'http://localhost:5051', 'http://localhost:5052'],
    credentials: true,
  });

  // Serve static files from frontend build (only in production)
  if (process.env.NODE_ENV === 'production') {
    app.useStaticAssets(join(__dirname, '..', '..', 'frontend', 'build'));
  }
  
  // Global prefix for API routes only
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT ?? 1010;
  await app.listen(port);
  
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`🌐 Frontend served at: http://localhost:${port}`);
  logger.log(`🔌 API available at: http://localhost:${port}/api/v1`);
  logger.log(`📊 Enhanced Error Handling: ENABLED`);
  logger.log(`🔒 Security Headers: ENABLED`);
  logger.log(`📝 Request Logging: ENABLED`);
  logger.log(`✅ Input Validation: ENABLED`);
}
bootstrap();
