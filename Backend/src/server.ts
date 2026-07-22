import { PORT } from "./config/config.ts";
import { createApp } from "./app.ts";
import { seedAdminUser } from "./utils/seedAdminUser.ts";

// call function from app.ts to create app
const app = createApp();

// create admin user if not exists
void seedAdminUser().catch((error) => {
  console.error("Failed to seed admin user:", error);
});

// start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
