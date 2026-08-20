import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import multipart from '@fastify/multipart';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { MinioService } from './../src/minio/minio.service';
import { AuthGuard } from './../src/auth/auth.guard';

const usuarioFake = {
  id: 'usuario-1',
  setor: 'ADMIN',
  sis_permissoes: [{ tela: '/feed', editar: true, deletar: true }],
};

describe('Migração Express -> Fastify (e2e)', () => {
  let app: NestFastifyApplication;
  const uploads: any[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn(),
        fed_posts: { create: jest.fn().mockResolvedValue({ id: 'post-1', midias: [] }) },
        sis_usuarios: { update: jest.fn().mockResolvedValue({}) },
      })
      .overrideProvider(MinioService)
      .useValue({
        uploadFile: jest.fn(async (arquivo: any, prefixo: string) => {
          uploads.push({ ...arquivo, prefixo });
          return { key: 'k', url: 'http://u/k', bucket: 'feed' };
        }),
        getPresignedGetUrl: jest.fn().mockResolvedValue(null),
      })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: (contexto: any) => {
          contexto.switchToHttp().getRequest().user = usuarioFake;
          return true;
        },
      })
      .compile();

    // Mesma sequência de bootstrap do src/main.ts
    app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.register(multipart);
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    const config = new DocumentBuilder().setTitle('Feed Service').setVersion('1.0').build();
    SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, config));

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('sobe e responde rota simples', async () => {
    const r = await app.inject({ method: 'GET', url: '/' });
    expect(r.statusCode).toBe(200);
    expect(r.body).toBe('Hello World!');
  });

  it('CORS habilitado', async () => {
    const r = await app.inject({ method: 'GET', url: '/', headers: { origin: 'http://x.dev' } });
    expect(r.headers['access-control-allow-origin']).toBe('*');
  });

  it('Swagger UI servida', async () => {
    const r = await app.inject({ method: 'GET', url: '/api' });
    expect([200, 301, 302]).toContain(r.statusCode);
  });

  it('upload de avatar (@UploadedFile) chega ao service', async () => {
    const form = new FormData();
    form.append('file', new Blob([Buffer.from('conteudo-avatar')], { type: 'image/png' }), 'foto.png');
    const r = await app.inject({ method: 'POST', url: '/users/me/avatar', payload: form });

    expect(r.statusCode).toBe(201);
    const enviado = uploads.at(-1);
    expect(enviado.originalname).toBe('foto.png');
    expect(enviado.mimetype).toBe('image/png');
    expect(enviado.buffer.toString()).toBe('conteudo-avatar');
    expect(enviado.prefixo).toBe('avatars/usuario-1/');
  });

  it('upload no feed (@UploadedFiles) + campos de texto no @Body()', async () => {
    const form = new FormData();
    form.append('conteudo', 'meu post');
    form.append('tipo', 'texto');
    form.append('files', new Blob([Buffer.from('img1')], { type: 'image/jpeg' }), 'a.jpg');
    form.append('files', new Blob([Buffer.from('img2')], { type: 'image/jpeg' }), 'b.jpg');

    const antes = uploads.length;
    const r = await app.inject({ method: 'POST', url: '/feed', payload: form });

    expect(r.statusCode).toBe(201);
    const novos = uploads.slice(antes);
    expect(novos.map((u) => u.originalname)).toEqual(['a.jpg', 'b.jpg']);
    expect(novos[0].prefixo).toBe('posts/');
  });

  it('limite de 5MB do avatar retorna 413', async () => {
    const form = new FormData();
    const grande = Buffer.alloc(6 * 1024 * 1024, 1);
    form.append('file', new Blob([grande], { type: 'image/png' }), 'grande.png');
    const r = await app.inject({ method: 'POST', url: '/users/me/avatar', payload: form });
    expect(r.statusCode).toBe(413);
  });

  it('rota JSON normal continua validando com ValidationPipe', async () => {
    const r = await app.inject({
      method: 'POST',
      url: '/events',
      payload: { titulo: '' },
    });
    expect(r.statusCode).toBe(400);
  });
});
