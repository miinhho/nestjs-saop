import type { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './app/app.module';

describe('SAOP (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/test (GET) - should return test message with AOP applied', () => {
    return request
      .default(app.getHttpServer())
      .get('/test')
      .expect(200)
      .expect('Test endpoint with AOP');
  });

  afterAll(async () => {
    await app.close();
  });
});
