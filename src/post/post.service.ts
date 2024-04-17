import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaService } from '../common/prisma.service';
import { Post, User } from '@prisma/client';
import {
  PostResponse,
  CreatePostRequest,
  SearchPostRequest,
  UpdatePostRequest,
} from '../model/post.model';
import { ValidationService } from '../common/validation.service';
import { PostValidation } from './post.validation';
import { WebResponse } from '../model/web.model';

@Injectable()
export class PostService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) { }

  async create(user: User, request: CreatePostRequest): Promise<PostResponse> {
    this.logger.debug(
      `PostService.create(${JSON.stringify(user)}, ${JSON.stringify(request)})`,
    );
    const createRequest: CreatePostRequest = this.validationService.validate(
      PostValidation.CREATE,
      request,
    );

    const post = await this.prismaService.client.post.create({
      data: {
        ...createRequest,
        user_id: user.id,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return this.toPostResponse(post);
  }

  toPostResponse(post: Post): PostResponse {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      published: post.published,
      created_at: post.created_at,
      updated_at: post.updated_at,
      deleted_at: post.deleted_at,
    };
  }

  async checkPostMustExists(postId: number, userId?: number): Promise<Post> {
    const whereUser = userId ? { user_id: userId } : null;

    const post = await this.prismaService.client.post.findFirst({
      where: {
        ...whereUser,
        id: postId,
      },
    });

    if (!post) {
      throw new HttpException('Post is not found', 404);
    }

    return post;
  }

  async get(postId: number): Promise<PostResponse> {
    const post = await this.checkPostMustExists(postId);
    return this.toPostResponse(post);
  }

  async update(user: User, request: UpdatePostRequest): Promise<PostResponse> {
    const updateRequest = this.validationService.validate(
      PostValidation.UPDATE,
      request,
    );
    let post = await this.checkPostMustExists(updateRequest.id, user.id);

    post = await this.prismaService.client.post.update({
      where: {
        id: post.id,
        user_id: post.user_id,
      },
      data: {
        ...updateRequest,
        updated_at: new Date(),
      },
    });

    return this.toPostResponse(post);
  }

  async remove(user: User, postId: number): Promise<PostResponse> {
    await this.checkPostMustExists(postId, user.id);

    const post = await this.prismaService.client.post.delete({
      id: postId,
      user_id: user.id,
    });

    return this.toPostResponse(post);
  }

  async search(
    request: SearchPostRequest,
  ): Promise<WebResponse<PostResponse[]>> {
    const searchRequest: SearchPostRequest = this.validationService.validate(
      PostValidation.SEARCH,
      request,
    );

    const filters = [];

    if (searchRequest.search) {
      filters.push({
        OR: [
          {
            title: {
              contains: searchRequest.search,
            },
          },
          {
            content: {
              contains: searchRequest.search,
            },
          },
        ],
      });
    }

    const skip = (searchRequest.page - 1) * searchRequest.size;

    const posts = await this.prismaService.client.post.findMany({
      where: {
        AND: filters,
      },
      take: searchRequest.size,
      skip: skip,
    });

    const total = await this.prismaService.client.post.count({
      where: {
        AND: filters,
      },
    });

    return {
      data: posts.map((post) => this.toPostResponse(post)),
      paging: {
        current_page: searchRequest.page,
        size: searchRequest.size,
        total_page: Math.ceil(total / searchRequest.size),
      },
    };
  }
}
