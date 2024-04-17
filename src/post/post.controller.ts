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
import { PostService } from './post.service';
import { Auth } from '../common/auth.decorator';
import { User } from '@prisma/client';
import {
  PostResponse,
  CreatePostRequest,
  SearchPostRequest,
  UpdatePostRequest,
} from '../model/post.model';
import { WebResponse } from '../model/web.model';

@Controller('/api/posts')
export class PostController {
  constructor(private postService: PostService) { }

  @Post()
  @HttpCode(200)
  async create(
    @Auth() user: User,
    @Body() request: CreatePostRequest,
  ): Promise<WebResponse<PostResponse>> {
    const result = await this.postService.create(user, request);
    return {
      data: result,
    };
  }

  @Get('/:postId')
  @HttpCode(200)
  async get(
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<WebResponse<PostResponse>> {
    const result = await this.postService.get(postId);
    return {
      data: result,
    };
  }

  @Put('/:postId')
  @HttpCode(200)
  async update(
    @Auth() user: User,
    @Param('postId', ParseIntPipe) postId: number,
    @Body() request: UpdatePostRequest,
  ): Promise<WebResponse<PostResponse>> {
    request.id = postId;
    const result = await this.postService.update(user, request);
    return {
      data: result,
    };
  }

  @Delete('/:postId')
  @HttpCode(200)
  async remove(
    @Auth() user: User,
    @Param('postId', ParseIntPipe) postId: number,
  ): Promise<WebResponse<boolean>> {
    await this.postService.remove(user, postId);
    return {
      data: true,
    };
  }

  @Get()
  @HttpCode(200)
  async search(
    @Query('search') search?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ): Promise<WebResponse<PostResponse[]>> {
    const request: SearchPostRequest = {
      search: search,
      page: page || 1,
      size: size || 10,
    };
    return this.postService.search(request);
  }
}
