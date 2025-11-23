import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ✅ ENABLE CORS UNTUK FRONTEND
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  await app.listen(3001);
  console.log('🚀 Backend API running on: http://localhost:3001');
  console.log('✅ CORS enabled for frontend: http://localhost:3000');
}
bootstrap();
