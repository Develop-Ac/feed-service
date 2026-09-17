import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import multipart from '@fastify/multipart';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Habilita o parsing de multipart/form-data usado nos uploads do feed e do
  // avatar. Substitui o multer, que só funciona com o adapter Express.
  await app.register(multipart);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  if (process.env.SWAGGER_ENABLED === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Feed Service')
      .setDescription('API do Feed e Eventos')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  // O Fastify escuta em 127.0.0.1 por padrão; o Express escutava em todas as
  // interfaces. O host explícito preserva o comportamento anterior (container).
  await app.listen(process.env.PORT || 8000, '0.0.0.0');
}
bootstrap();
