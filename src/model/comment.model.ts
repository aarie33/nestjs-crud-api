export class CommentResponse {
  id: number;
  content: string;
  post_id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export class CreateCommentRequest {
  content: string;
  post_id: number;
}

export class UpdateCommentRequest {
  id: number;
  content: string;
}

export class SearchCommentRequest {
  post_id: number;
  search?: string;
  page: number;
  size: number;
}
