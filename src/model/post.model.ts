export class PostResponse {
  id: number;
  title: string;
  content: string;
  published?: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export class CreatePostRequest {
  title: string;
  content: string;
  published?: boolean;
}

export class UpdatePostRequest {
  id: number;
  title: string;
  content: string;
  published?: boolean;
}

export class SearchPostRequest {
  search?: string;
  page: number;
  size: number;
}
