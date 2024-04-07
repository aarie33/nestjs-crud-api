import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { TestService } from './test.service';
import { TestModule } from './test.module';

describe('UserController', () => {
  let app: INestApplication;
  let logger: Logger;
  let testService: TestService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    logger = app.get(WINSTON_MODULE_PROVIDER);
    testService = app.get(TestService);
  });

  describe('POST /api/posts', () => {
    beforeEach(async () => {
      await testService.deleteAll();

      await testService.createUser();
    });

    it('should be rejected if request is invalid', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/posts')
        .set('Authorization', 'test')
        .send({
          title: '',
          content: '',
        });

      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to create post', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/posts')
        .set('Authorization', 'test')
        .send({
          title: 'test',
          content: 'test',
        });

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.title).toBe('test');
      expect(response.body.data.content).toBe('test');
    });
  });

  describe('GET /api/posts/:postId', () => {
    beforeEach(async () => {
      await testService.deleteAll();

      const user = await testService.createUser();
      await testService.createPost(user);
    });

    it('should be rejected if post is not found', async () => {
      const post = await testService.getPost();
      const response = await request(app.getHttpServer())
        .get(`/api/posts/${post.id + 1}`)
        .set('Authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to get post', async () => {
      const post = await testService.getPost();
      const response = await request(app.getHttpServer())
        .get(`/api/posts/${post.id}`)
        .set('Authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.title).toBe('test');
      expect(response.body.data.content).toBe('test');
    });
  });

  describe('PUT /api/posts/:postId', () => {
    beforeEach(async () => {
      await testService.deleteAll();

      const user = await testService.createUser();
      await testService.createPost(user);
    });

    it('should be rejected if request is invalid', async () => {
      const post = await testService.getPost();
      const response = await request(app.getHttpServer())
        .put(`/api/posts/${post.id}`)
        .set('Authorization', 'test')
        .send({
          title: '',
          content: '',
        });

      logger.info(response.body);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should be rejected if post is not found', async () => {
      const post = await testService.getPost();
      const response = await request(app.getHttpServer())
        .put(`/api/posts/${post.id + 1}`)
        .set('Authorization', 'test')
        .send({
          title: 'test',
          content: 'test',
        });

      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to update post', async () => {
      const post = await testService.getPost();
      const response = await request(app.getHttpServer())
        .put(`/api/posts/${post.id}`)
        .set('Authorization', 'test')
        .send({
          title: 'test updated',
          content: 'test updated',
        });

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.title).toBe('test updated');
      expect(response.body.data.content).toBe('test updated');
    });
  });

  describe('DELETE /api/posts/:postId', () => {
    beforeEach(async () => {
      await testService.deleteAll();

      const user = await testService.createUser();
      await testService.createPost(user);
    });

    it('should be rejected if post is not found', async () => {
      const post = await testService.getPost();
      const response = await request(app.getHttpServer())
        .delete(`/api/posts/${post.id + 1}`)
        .set('Authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should be able to remove post', async () => {
      const post = await testService.getPost();
      const response = await request(app.getHttpServer())
        .delete(`/api/posts/${post.id}`)
        .set('Authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data).toBe(true);
    });
  });

  describe('GET /api/posts', () => {
    beforeEach(async () => {
      await testService.deleteAll();

      const user = await testService.createUser();
      await testService.createPost(user);
    });

    it('should be able to search posts', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/posts`)
        .set('Authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
    });

    it('should be able to search posts by title', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/posts`)
        .query({
          search: 'es',
        })
        .set('Authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
    });

    it('should be able to search posts by title not found', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/posts`)
        .query({
          search: 'wrong',
        })
        .set('Authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(0);
    });

    it('should be able to search posts by content', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/posts`)
        .query({
          search: 'es',
        })
        .set('Authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
    });

    it('should be able to search posts by content not found', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/posts`)
        .query({
          search: 'wrong',
        })
        .set('Authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(0);
    });

    it('should be able to search posts with page', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/posts`)
        .query({
          size: 1,
          page: 2,
        })
        .set('Authorization', 'test');

      logger.info(response.body);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(0);
      expect(response.body.paging.current_page).toBe(2);
      expect(response.body.paging.total_page).toBe(1);
      expect(response.body.paging.size).toBe(1);
    });
  });
});
