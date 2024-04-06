export class RegisterUserRequest {
  email: string;
  password: string;
  name: string;
  avatar?: string;
}

export class UserResponse {
  email: string;
  name: string;
  avatar?: string;
  token?: string;
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
