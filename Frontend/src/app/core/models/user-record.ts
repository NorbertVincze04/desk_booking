export interface UserRecord {
  fullName: string;
  email: string;
  password: string;
  secretKey: string;
  type: string;
  token?: string;
  tempPassword?: string;
}
