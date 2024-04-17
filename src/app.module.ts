import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [CommonModule, UserModule, PostModule, CommentModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
