// data stored in JWT token, used to identify the user
export interface UserPayload {
  id: number;
  fullName: string;
  email: string;
  type: "admin" | "user";
}

// structure of a user record in the database.
export interface UserRecord {
  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  temp_password_hash: string | null;
  secret_key: string;
  type: "admin" | "user";
}
