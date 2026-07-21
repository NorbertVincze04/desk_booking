import { PORT } from "./config.ts";
import { createApp } from "./app.ts";
import { seedAdminUser } from "./seedAdminUser.ts";

const app = createApp();

void seedAdminUser().catch((error) => {
  console.error("Failed to seed admin user:", error);
});

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
