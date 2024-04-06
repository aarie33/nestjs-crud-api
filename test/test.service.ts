import { PrismaService } from '../src/common/prisma.service';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Post, User } from '@prisma/client';

@Injectable()
export class TestService {
  constructor(private prismaService: PrismaService) {}

  async deleteAll() {
    await this.deletePost();
    await this.deleteUser();
  }

  async deleteUser() {
    await this.prismaService.user.deleteMany({
      where: {
        email: 'test',
      },
    });
  }

  async deletePost() {
    await this.prismaService.post.deleteMany({
      where: {
        OR: [
          {
            title: 'test',
          },
          {
            title: 'test updated',
          },
        ],
      },
    });
  }

  async getUser(): Promise<User> {
    return this.prismaService.user.findFirst({
      where: {
        email: 'test',
      },
    });
  }

  async createUser(): Promise<User> {
    return await this.prismaService.user.create({
      data: {
        email: 'test',
        name: 'test',
        password: await bcrypt.hash('test', 10),
        token: 'test',
      },
    });
  }

  async getPost(): Promise<Post> {
    return this.prismaService.post.findFirst({
      where: {
        title: 'test',
      },
    });
  }

  async createPost(user: User) {
    await this.prismaService.post.create({
      data: {
        title: 'test',
        content: 'test',
        published: true,
        user_id: user.id,
      },
    });
  }
}
