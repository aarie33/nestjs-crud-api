export class PostResponse {
  id: number;
  title: string;
  content: string;
  published?: boolean;
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
  title?: string;
  content?: string;
  page: number;
  size: number;
}
