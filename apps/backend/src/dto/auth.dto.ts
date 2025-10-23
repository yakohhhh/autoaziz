export class LoginDto {
  email: string;
  password: string;
}

export class AuthResponseDto {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'staff';
  };
}
