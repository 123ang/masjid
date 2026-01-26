import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Serve static files for uploaded logos
  // In development: dist/uploads/logos
  // In production: uploads/logos
  const uploadsPath = process.env.NODE_ENV === 'production' 
    ? join(__dirname, '..', '..', 'uploads', 'logos')
    : join(__dirname, '..', '..', 'uploads', 'logos');
  
  app.useStaticAssets(uploadsPath, {
    prefix: '/api/uploads/logos/',
  });
  
  console.log(`📁 Serving static files from: ${uploadsPath}`);

  // Enable CORS with dynamic origin for multi-tenant subdomains
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Static allowed origins for development
      const staticAllowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3008',
        'http://frontend:3008',
      ];

      if (staticAllowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Dynamic pattern matching for i-masjid.my domain and subdomains
      // Matches: https://i-masjid.my, https://www.i-masjid.my, https://*.i-masjid.my
      const iMasjidPattern = /^https?:\/\/([a-z0-9-]+\.)?i-masjid\.my$/;
      if (iMasjidPattern.test(origin)) {
        return callback(null, true);
      }

      // Also allow taskinsight.my domain (legacy)
      const taskinsightPattern = /^https?:\/\/([a-z0-9-]+\.)?taskinsight\.my$/;
      if (taskinsightPattern.test(origin)) {
        return callback(null, true);
      }

      // Block other origins
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Slug'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}/api`);
  console.log(`📦 Multi-tenant mode enabled for *.i-masjid.my`);
}
bootstrap();
