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
  ) {}

  async create(user: User, request: CreatePostRequest): Promise<PostResponse> {
    this.logger.debug(
      `PostService.create(${JSON.stringify(user)}, ${JSON.stringify(request)})`,
    );
    const createRequest: CreatePostRequest = this.validationService.validate(
      PostValidation.CREATE,
      request,
    );

    const post = await this.prismaService.post.create({
      data: {
        ...createRequest,
        user_id: user.id,
      },
    });

    return this.toPostResponse(post);
  }

  toPostResponse(post: Post): PostResponse {
    return {
      title: post.title,
      content: post.content,
      published: post.published,
      id: post.id,
    };
  }

  async checkPostMustExists(userId: number, postId: number): Promise<Post> {
    const post = await this.prismaService.post.findFirst({
      where: {
        user_id: userId,
        id: postId,
      },
    });

    if (!post) {
      throw new HttpException('Post is not found', 404);
    }

    return post;
  }

  async get(user: User, postId: number): Promise<PostResponse> {
    const post = await this.checkPostMustExists(user.id, postId);
    return this.toPostResponse(post);
  }

  async update(user: User, request: UpdatePostRequest): Promise<PostResponse> {
    const updateRequest = this.validationService.validate(
      PostValidation.UPDATE,
      request,
    );
    let post = await this.checkPostMustExists(user.id, updateRequest.id);

    post = await this.prismaService.post.update({
      where: {
        id: post.id,
        user_id: post.user_id,
      },
      data: updateRequest,
    });

    return this.toPostResponse(post);
  }

  async remove(user: User, postId: number): Promise<PostResponse> {
    await this.checkPostMustExists(user.id, postId);

    const post = await this.prismaService.post.delete({
      where: {
        id: postId,
        user_id: user.id,
      },
    });

    return this.toPostResponse(post);
  }

  async search(
    user: User,
    request: SearchPostRequest,
  ): Promise<WebResponse<PostResponse[]>> {
    const searchRequest: SearchPostRequest = this.validationService.validate(
      PostValidation.SEARCH,
      request,
    );

    const filters = [];

    if (searchRequest.title) {
      // add title filter
      filters.push({
        title: {
          contains: searchRequest.title,
        },
      });
    }

    if (searchRequest.content) {
      // add content filter
      filters.push({
        content: {
          contains: searchRequest.content,
        },
      });
    }

    const skip = (searchRequest.page - 1) * searchRequest.size;

    const posts = await this.prismaService.post.findMany({
      where: {
        user_id: user.id,
        AND: filters,
      },
      take: searchRequest.size,
      skip: skip,
    });

    const total = await this.prismaService.post.count({
      where: {
        user_id: user.id,
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