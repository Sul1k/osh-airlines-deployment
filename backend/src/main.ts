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

  // Serve static files from frontend build
  const frontendPaths = [
    join(__dirname, '..', '..', 'frontend', 'build'),
    join(__dirname, '..', '..', '..', 'frontend', 'build'),
    join(process.cwd(), 'frontend', 'build'),
    join(process.cwd(), '..', 'frontend', 'build'),
    join(__dirname, '..', '..', '..', '..', 'frontend', 'build'),
    join(process.cwd(), '..', '..', 'frontend', 'build')
  ];
  
  let staticPathFound = false;
  for (const path of frontendPaths) {
    try {
      const fs = require('fs');
      if (fs.existsSync(path)) {
        app.useStaticAssets(path);
        logger.log(`📁 Serving static files from: ${path}`);
        
        // Log the contents of the directory for debugging
        try {
          const files = fs.readdirSync(path);
          logger.log(`📁 Files in ${path}:`, files);
          
          // Check if assets directory exists
          const assetsPath = join(path, 'assets');
          if (fs.existsSync(assetsPath)) {
            const assetFiles = fs.readdirSync(assetsPath);
            logger.log(`📁 Assets in ${assetsPath}:`, assetFiles);
          } else {
            logger.warn(`⚠️ Assets directory not found at: ${assetsPath}`);
          }
        } catch (dirError) {
          logger.warn(`⚠️ Could not read directory contents: ${dirError.message}`);
        }
        
        staticPathFound = true;
        break;
      }
    } catch (error) {
      // Continue to next path
    }
  }
  
  if (!staticPathFound) {
    logger.error('❌ No frontend build directory found!');
    logger.error('Searched paths:', frontendPaths);
  }
  
  // Global prefix for API routes only
  app.setGlobalPrefix('api/v1');
  
  // Serve frontend for all non-API routes (SPA fallback)
  app.use((req: any, res: any, next: any) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    // Skip asset requests - let Express static middleware handle them
    if (req.path.startsWith('/assets/') || req.path.includes('.')) {
      return next();
    }
    
    // For all other routes, serve index.html (SPA routing)
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

  const port = process.env.PORT ?? 1010;
  
  try {
    await app.listen(port);
    
    logger.log(`🚀 Application is running on: http://localhost:${port}`);
    logger.log(`🌐 Frontend served at: http://localhost:${port}`);
    logger.log(`🔌 API available at: http://localhost:${port}/api/v1`);
    logger.log(`📊 Enhanced Error Handling: ENABLED`);
    logger.log(`🔒 Security Headers: ENABLED`);
    logger.log(`📝 Request Logging: ENABLED`);
    logger.log(`✅ Input Validation: ENABLED`);
    logger.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.log(`📁 Working Directory: ${process.cwd()}`);
  } catch (error) {
    logger.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}
bootstrap();
