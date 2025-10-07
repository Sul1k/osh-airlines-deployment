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
    origin: true, // Allow all origins in production (same domain)
    credentials: true,
  });

  // Serve static files from frontend build (only in production)
  if (process.env.NODE_ENV === 'production') {
    // Try multiple possible paths for Railway deployment
    const frontendPaths = [
      join(__dirname, '..', '..', 'frontend', 'build'),
      join(__dirname, '..', '..', '..', 'frontend', 'build'),
      join(process.cwd(), 'frontend', 'build'),
      join(process.cwd(), '..', 'frontend', 'build')
    ];
    
    for (const path of frontendPaths) {
      try {
        const fs = require('fs');
        if (fs.existsSync(path)) {
          app.useStaticAssets(path);
          logger.log(`📁 Serving static files from: ${path}`);
          break;
        }
      } catch (error) {
        // Continue to next path
      }
    }
  }
  
  // Global prefix for API routes only
  app.setGlobalPrefix('api/v1');
  
  // Serve frontend for all non-API routes (only in production)
  if (process.env.NODE_ENV === 'production') {
    app.get('*', (req: any, res: any) => {
      const frontendPaths = [
        join(__dirname, '..', '..', 'frontend', 'build', 'index.html'),
        join(__dirname, '..', '..', '..', 'frontend', 'build', 'index.html'),
        join(process.cwd(), 'frontend', 'build', 'index.html'),
        join(process.cwd(), '..', 'frontend', 'build', 'index.html')
      ];
      
      for (const path of frontendPaths) {
        try {
          const fs = require('fs');
          if (fs.existsSync(path)) {
            return res.sendFile(path);
          }
        } catch (error) {
          // Continue to next path
        }
      }
      
      res.status(404).send('Frontend not found');
    });
  }

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
