/**
 * One-time script: promotes a user to Admin by email.
 * Usage (run from server/ folder):
 *   node scripts/makeAdmin.js your@email.com
 */
import mongoose from "mongoose";
import { config } from "dotenv";
import { User } from "../models/userModel.js";

config({ path: "./config.env" });

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/makeAdmin.js <email>");
  process.exit(1);
}

await mongoose.connect(process.env.DATABASE_URI);

const user = await User.findOneAndUpdate(
  { email, accountVerified: true },
  { role: "Admin" },
  { new: true }
);

if (!user) {
  console.error(`No verified account found for "${email}". Register and verify the account first.`);
} else {
  console.log(`✓ ${user.name} (${user.email}) is now Admin.`);
}

await mongoose.disconnect();
