import { ContestLeaderboard } from "../models/leaderboardModel.js";
import { Contest } from "../models/contestModel.js";
import { Badge } from "../models/badgeModel.js";

/**
 * Called after a contest ends.
 * Reads the leaderboard for that contest, finds Top 5 users,
 * and creates weekly Badge documents for each.
 */
export const calculateWeeklyBadges = async (contestId) => {
  try {
    const contest = await Contest.findById(contestId).lean();
    if (!contest) {
      console.error(`[BadgeCalc] Contest ${contestId} not found.`);
      return;
    }

    // Get leaderboard sorted same way as getLeaderboard controller
    const rows = await ContestLeaderboard.find({ contest_id: contestId })
      .sort({ solved_count: -1, penalty_minutes: 1, last_solved_at: 1 })
      .lean();

    const top5 = rows.slice(0, 5);

    for (let i = 0; i < top5.length; i++) {
      const row = top5[i];
      const rank = i + 1;

      try {
        await Badge.create({
          user_id: row.user_id,
          type: "weekly",
          rank,
          contest_id: contestId,
          contest_name: contest.name,
        });
        console.log(`[BadgeCalc] Weekly badge rank ${rank} assigned to user ${row.user_id}`);
      } catch (err) {
        // Duplicate key = badge already assigned, skip silently
        if (err.code === 11000) {
          console.log(`[BadgeCalc] Weekly badge already exists for user ${row.user_id} in contest ${contestId}`);
        } else {
          console.error(`[BadgeCalc] Error assigning weekly badge:`, err);
        }
      }
    }

    console.log(`[BadgeCalc] Weekly badges done for contest: ${contest.name}`);
  } catch (err) {
    console.error("[BadgeCalc] calculateWeeklyBadges error:", err);
  }
};

/**
 * Called on the 1st of every month (for the PREVIOUS month).
 * Finds the user who appeared in Top 5 most frequently that month
 * and awards them a monthly badge.
 */
export const calculateMonthlyBadges = async (month, year) => {
  try {
    // Find all weekly badges issued in the given month+year
    const startDate = new Date(year, month - 1, 1); // month is 1-indexed
    const endDate = new Date(year, month, 1);       // exclusive

    const weeklyBadgesThisMonth = await Badge.find({
      type: "weekly",
      createdAt: { $gte: startDate, $lt: endDate },
    }).lean();

    if (weeklyBadgesThisMonth.length === 0) {
      console.log(`[BadgeCalc] No weekly badges found for ${month}/${year}, skipping monthly badge.`);
      return;
    }

    // Count Top 5 appearances per user
    const countMap = {};
    for (const badge of weeklyBadgesThisMonth) {
      const uid = badge.user_id.toString();
      countMap[uid] = (countMap[uid] || 0) + 1;
    }

    // Sort by count descending, pick the top user
    const sorted = Object.entries(countMap).sort((a, b) => b[1] - a[1]);
    const [topUserId, topCount] = sorted[0];

    try {
      await Badge.create({
        user_id: topUserId,
        type: "monthly",
        month,
        year,
        top5_count: topCount,
      });
      console.log(`[BadgeCalc] Monthly badge for ${month}/${year} assigned to user ${topUserId} (appeared ${topCount}x in Top 5)`);
    } catch (err) {
      if (err.code === 11000) {
        console.log(`[BadgeCalc] Monthly badge for ${month}/${year} already exists.`);
      } else {
        console.error("[BadgeCalc] Error assigning monthly badge:", err);
      }
    }
  } catch (err) {
    console.error("[BadgeCalc] calculateMonthlyBadges error:", err);
  }
};