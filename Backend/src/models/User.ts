import type { UserRecord } from "../types/user.types.ts";

export class UserModel implements UserRecord {
  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  temp_password_hash: string | null;
  secret_key: string;
  type: "admin" | "user";

  constructor(data: UserRecord) {
    this.id = data.id;
    this.full_name = data.full_name;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.temp_password_hash = data.temp_password_hash;
    this.secret_key = data.secret_key;
    this.type = data.type;
  }
}
