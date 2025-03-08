export interface User {
  id: string;
  email: string;
  username: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  username: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
