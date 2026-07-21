export interface UserPayload {
  id: number;
  fullName: string;
  email: string;
  type: "admin" | "user";
}

export interface User extends UserPayload {
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserRecord {
  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  temp_password_hash: string | null;
  secret_key: string;
  type: "admin" | "user";
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  payload?: any;
}

export interface LoginResponse {
  success: boolean;
  payload?: {
    id: number;
    fullName: string;
    email: string;
    type: string;
    token: string;
    isTempPassword: boolean;
  };
}
