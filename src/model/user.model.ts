export class RegisterUserRequest {
  email: string;
  password: string;
  name: string;
  avatar?: string;
}

export class UserResponse {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  token?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export class LoginUserRequest {
  email: string;
  password: string;
}

export class UpdateUserRequest {
  name?: string;
  password?: string;
  avatar?: string;
}
