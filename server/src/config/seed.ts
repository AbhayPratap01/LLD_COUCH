import dotenv from "dotenv";
import { connectDatabase } from "./database.js";
import { seedProblems } from "./seedProblems.js";

dotenv.config();

async function seed(): Promise<void> {
  try {
    await connectDatabase();
    await seedProblems();

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();