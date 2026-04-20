import cron from "node-cron";
import { calculateMonthlyBadges } from "../utils/badgeCalculator.js";

/**
 * Runs at 00:05 on the 1st of every month.
 * Calculates badges for the PREVIOUS month.
 */
export const startBadgeCron = () => {
  cron.schedule("5 0 1 * *", async () => {
    const now = new Date();
    // Previous month (handle January → December of previous year)
    let month = now.getMonth(); // getMonth() is 0-indexed, so this gives previous month as 1-indexed
    let year = now.getFullYear();
    if (month === 0) {
      month = 12;
      year -= 1;
    }
    console.log(`[BadgeCron] Running monthly badge calculation for ${month}/${year}`);
    await calculateMonthlyBadges(month, year);
  });

  console.log("[BadgeCron] Monthly badge cron job scheduled.");
};