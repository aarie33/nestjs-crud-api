import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaService } from '../common/prisma.service';
import { Comment } from '@prisma/client';
import { ValidationService } from '../common/validation.service';
import { CommentValidation } from './comment.validation';
import { WebResponse } from '../model/web.model';
import {
  CommentResponse,
  CreateCommentRequest,
  SearchCommentRequest,
  UpdateCommentRequest,
} from 'src/model/comment.model';

@Injectable()
export class CommentService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) { }

  async create(request: CreateCommentRequest): Promise<CommentResponse> {
    this.logger.debug(`CommentService.create(${JSON.stringify(request)})`);
    const createRequest: CreateCommentRequest = this.validationService.validate(
      CommentValidation.CREATE,
      request,
    );

    const comment = await this.prismaService.client.comment.create({
      data: {
        ...createRequest,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return this.toCommentResponse(comment);
  }

  toCommentResponse(item: Comment): CommentResponse {
    return {
      id: item.id,
      content: item.content,
      post_id: item.post_id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      deleted_at: item.deleted_at,
    };
  }

  async checkCommentMustExists(id: number): Promise<Comment> {
    const comment = await this.prismaService.client.comment.findFirst({
      where: {
        id: id,
      },
    });

    if (!comment) {
      throw new HttpException('Comment is not found', 404);
    }

    return comment;
  }

  async get(commentId: number): Promise<CommentResponse> {
    const comment = await this.checkCommentMustExists(commentId);
    return this.toCommentResponse(comment);
  }

  async update(request: UpdateCommentRequest): Promise<CommentResponse> {
    const updateRequest = this.validationService.validate(
      CommentValidation.UPDATE,
      request,
    );
    let comment = await this.checkCommentMustExists(updateRequest.id);

    comment = await this.prismaService.client.comment.update({
      where: {
        id: comment.id,
      },
      data: {
        ...updateRequest,
        updated_at: new Date(),
      },
    });

    return this.toCommentResponse(comment);
  }

  async remove(postId: number): Promise<CommentResponse> {
    await this.checkCommentMustExists(postId);

    const comment = await this.prismaService.client.comment.delete({
      id: postId,
    });

    return this.toCommentResponse(comment);
  }

  async search(
    request: SearchCommentRequest,
  ): Promise<WebResponse<CommentResponse[]>> {
    const searchRequest: SearchCommentRequest = this.validationService.validate(
      CommentValidation.SEARCH,
      request,
    );

    const filters = [];

    if (searchRequest.search) {
      filters.push({
        OR: [
          {
            content: {
              contains: searchRequest.search,
            },
          },
        ],
      });
    }

    const skip = (searchRequest.page - 1) * searchRequest.size;

    const posts = await this.prismaService.client.comment.findMany({
      where: {
        post_id: request.post_id,
        AND: filters,
      },
      take: searchRequest.size,
      skip: skip,
    });

    const total = await this.prismaService.client.comment.count({
      where: {
        post_id: request.post_id,
        AND: filters,
      },
    });

    return {
      data: posts.map((item) => this.toCommentResponse(item)),
      paging: {
        current_page: searchRequest.page,
        size: searchRequest.size,
        total_page: Math.ceil(total / searchRequest.size),
      },
    };
  }
}
