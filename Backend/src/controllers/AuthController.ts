import type { Request, Response } from "express";
import { AuthService } from "../services/AuthService.ts";
import {
  validateLoginRequest,
  validateRegisterRequest,
  validateResetPasswordRequest,
  validateTempPasswordRequest,
  type LoginRequest,
  type RegisterRequest,
  type ResetPasswordRequest,
  type TempPasswordRequest,
} from "../validators/auth.validator.ts";

export class AuthController {
  static async register(
    req: Request<{}, {}, RegisterRequest>,
    res: Response,
  ): Promise<Response> {
    try {
      const { valid, errors } = validateRegisterRequest(req.body);
      if (!valid) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors,
        });
      }

      const { fullName, email, password, secretKey } = req.body;

      const user = await AuthService.registerUser(
        fullName,
        email,
        password,
        secretKey,
      );

      return res.status(201).json({
        success: true,
        payload: user,
      });
    } catch (error: any) {
      console.error("Register failed:", error);

      if (error.message.includes("already exists")) {
        return res.status(409).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Register failed.",
      });
    }
  }

  static async login(
    req: Request<{}, {}, LoginRequest>,
    res: Response,
  ): Promise<Response> {
    try {
      const { valid, errors } = validateLoginRequest(req.body);
      if (!valid) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors,
        });
      }

      const { email, password } = req.body;

      const result = await AuthService.loginUser(email, password);

      return res.json({
        success: true,
        payload: result,
      });
    } catch (error: any) {
      console.error("Login failed:", error);

      return res.status(401).json({
        success: false,
        message: error.message || "Login failed.",
      });
    }
  }

  static async resetPassword(
    req: Request<{}, {}, ResetPasswordRequest>,
    res: Response,
  ): Promise<Response> {
    try {
      const { valid, errors } = validateResetPasswordRequest(req.body);
      if (!valid) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors,
        });
      }

      const { email, newPassword } = req.body;

      await AuthService.resetPassword(email, newPassword);

      return res.json({
        success: true,
        message: "Password reset successfully.",
      });
    } catch (error: any) {
      console.error("Reset password failed:", error);

      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Reset password failed.",
      });
    }
  }

  static async generateTempPassword(
    req: Request<{}, {}, TempPasswordRequest>,
    res: Response,
  ): Promise<Response> {
    try {
      const { valid, errors } = validateTempPasswordRequest(req.body);
      if (!valid) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors,
        });
      }

      const { email, secretKey } = req.body;

      const tempPassword = await AuthService.generateTempPassword(
        email,
        secretKey,
      );

      return res.json({
        success: true,
        payload: {
          tempPassword,
        },
      });
    } catch (error: any) {
      console.error("Generate temp password failed:", error);

      return res.status(401).json({
        success: false,
        message: error.message || "Generate temp password failed.",
      });
    }
  }

  static async getUsers(req: Request, res: Response): Promise<Response> {
    try {
      const users = await AuthService.getAllUsers();

      return res.json({
        success: true,
        payload: users,
      });
    } catch (error: any) {
      console.error("Load users failed:", error);

      return res.status(500).json({
        success: false,
        message: "Load users failed.",
      });
    }
  }
}
