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

  describe('Around Decorator', () => {
    it('/test (GET) - should return test message with around AOP applied', () => {
      return request
        .default(app.getHttpServer())
        .get('/test')
        .expect(200)
        .expect('Test endpoint with AOP');
    });
  });

  describe('Before Decorator', () => {
    it('/before (GET) - should return before message with before AOP applied', () => {
      return request
        .default(app.getHttpServer())
        .get('/before')
        .expect(200)
        .expect('Before message');
    });
  });

  describe('After Decorator', () => {
    it('/after (GET) - should return after message with after AOP applied', () => {
      return request.default(app.getHttpServer()).get('/after').expect(200).expect('After message');
    });
  });

  describe('AfterReturning Decorator', () => {
    it('/after-returning (GET) - should return after returning message with afterReturning AOP applied', () => {
      return request
        .default(app.getHttpServer())
        .get('/after-returning')
        .expect(200)
        .expect('After returning message');
    });
  });

  describe('AfterThrowing Decorator', () => {
    it('/after-throwing (GET) - should throw error with afterThrowing AOP applied', () => {
      return request.default(app.getHttpServer()).get('/after-throwing').expect(500);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
