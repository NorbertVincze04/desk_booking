import { PORT } from "./config/config.ts";
import { createApp } from "./app.ts";
import { seedAdminUser } from "./utils/seedAdminUser.ts";

const app = createApp();

void seedAdminUser().catch((error) => {
  console.error("Failed to seed admin user:", error);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
