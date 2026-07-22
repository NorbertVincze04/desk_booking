import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/UserRepository.ts";
import { generateToken } from "../utils/jwt.utils.ts";
import { generateTempPasswordString } from "../utils/password.utils.ts";
import type { UserPayload } from "../types/user.types.ts";

export class AuthService {
  static async registerUser(
    fullName: string,
    email: string,
    password: string,
    secretKey: string,
  ): Promise<{ id: number; fullName: string; email: string; type: string }> {
    const existingUser = await UserRepository.existsByEmail(email);
    if (existingUser) {
      throw new Error("An account with that email already exists.");
    }

    const passwordHash = await bcrypt.hash(password, 10); // 2^n rounds of hashing, 10 is standard

    const user = await UserRepository.create(
      fullName,
      email,
      passwordHash,
      secretKey,
      "user",
    );

    return {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      type: user.type,
    };
  }

  static async loginUser(
    email: string,
    password: string,
  ): Promise<{
    id: number;
    fullName: string;
    email: string;
    type: string;
    token: string;
    isTempPassword: boolean;
  }> {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error("Email or password is incorrect.");
    }

    let isTempPassword = false;
    let passwordValid = false;

    if (user.temp_password_hash) {
      isTempPassword = await bcrypt.compare(password, user.temp_password_hash);
    }

    if (!isTempPassword) {
      passwordValid = await bcrypt.compare(password, user.password_hash);
    }

    if (!isTempPassword && !passwordValid) {
      throw new Error("Email or password is incorrect.");
    }

    if (isTempPassword) {
      await UserRepository.clearTempPassword(user.id);
    }

    const userPayload: UserPayload = {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      type: user.type,
    };

    const token = generateToken(userPayload);

    return {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      type: user.type,
      token,
      isTempPassword,
    };
  }

  static async resetPassword(
    email: string,
    newPassword: string,
  ): Promise<void> {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const userId = await UserRepository.updatePasswordHash(email, passwordHash);

    if (!userId) {
      throw new Error("User not found.");
    }
  }

  static async generateTempPassword(
    email: string,
    secretKey: string,
  ): Promise<string> {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error("Email or secret key is incorrect.");
    }

    if (user.secret_key !== secretKey) {
      throw new Error("Email or secret key is incorrect.");
    }

    const tempPassword = generateTempPasswordString();
    const tempPasswordHash = await bcrypt.hash(tempPassword, 10);

    await UserRepository.updateTempPasswordHash(user.id, tempPasswordHash);

    return tempPassword;
  }

  static async getAllUsers(): Promise<
    Array<{ id: number; fullName: string; email: string; type: string }>
  > {
    return UserRepository.getAllUsers();
  }
}
