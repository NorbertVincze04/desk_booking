import { PORT } from "./config/config.ts";
import { createApp } from "./app.ts";
import { seedAdminUser } from "./utils/seedAdminUser.ts";
import { Tunnel } from "./tunnel.ts";
import { BookingService } from "./services/BookingService.ts";

// call function from app.ts to create app
const app = createApp();

const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

async function cleanupPastBookings() {
  try {
    const count = await BookingService.deletePastBookings();
    if (count > 0) {
      console.log(`Cleanup: deleted ${count} past booking(s)`);
    }
  } catch (error) {
    console.error("Cleanup: failed to delete past bookings:", error);
  }
}

// Initialize tunnel and start server
async function startServer() {
  try {
    // Open tunnel first to ensure database connectivity
    const tunnel = new Tunnel();
    console.log("Opening database tunnel...");
    await tunnel.open();
    console.log("Tunnel opened successfully");

    // create admin user if not exists
    try {
      await seedAdminUser();
      console.log("Admin user seeding complete");
    } catch (error) {
      console.error("Failed to seed admin user:", error);
    }

    // Run initial cleanup then schedule daily repeats
    await cleanupPastBookings();
    setInterval(cleanupPastBookings, CLEANUP_INTERVAL_MS);

    // start server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
