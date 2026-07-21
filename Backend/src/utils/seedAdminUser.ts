import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/UserRepository.ts";

export async function seedAdminUser(): Promise<void> {
  const adminEmail = "admin@gmail.com";
  const adminPassword = "Admin12!";
  const adminSecretKey = "Admin12!";

  const existingAdmin = await UserRepository.findByEmail(adminEmail);

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await UserRepository.create(
      "Admin User",
      adminEmail,
      passwordHash,
      adminSecretKey,
      "admin",
    );

    console.log("Admin user seeded.");
  }
}
