import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { WebResponse } from '../model/web.model';
import { CommentService } from './comment.service';
import {
  CommentResponse,
  CreateCommentRequest,
  SearchCommentRequest,
  UpdateCommentRequest,
} from 'src/model/comment.model';

@Controller('/api/comments')
export class CommentController {
  constructor(private commentService: CommentService) { }

  @Post()
  @HttpCode(200)
  async create(
    @Body() request: CreateCommentRequest,
  ): Promise<WebResponse<CommentResponse>> {
    const result = await this.commentService.create(request);
    return {
      data: result,
    };
  }

  @Get('/:commentId')
  @HttpCode(200)
  async get(
    @Param('commentId', ParseIntPipe) commentId: number,
  ): Promise<WebResponse<CommentResponse>> {
    const result = await this.commentService.get(commentId);
    return {
      data: result,
    };
  }

  @Put('/:commentId')
  @HttpCode(200)
  async update(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() request: UpdateCommentRequest,
  ): Promise<WebResponse<CommentResponse>> {
    request.id = commentId;
    const result = await this.commentService.update(request);
    return {
      data: result,
    };
  }

  @Delete('/:commentId')
  @HttpCode(200)
  async remove(
    @Param('commentId', ParseIntPipe) commentId: number,
  ): Promise<WebResponse<boolean>> {
    await this.commentService.remove(commentId);
    return {
      data: true,
    };
  }

  @Get()
  @HttpCode(200)
  async search(
    @Query('post_id', new ParseIntPipe()) post_id: number,
    @Query('search') search?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ): Promise<WebResponse<CommentResponse[]>> {
    const request: SearchCommentRequest = {
      post_id: post_id,
      search: search,
      page: page || 1,
      size: size || 10,
    };
    return this.commentService.search(request);
  }
}
