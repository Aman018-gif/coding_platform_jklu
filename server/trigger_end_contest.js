import mongoose from "mongoose";
import { Contest } from "./models/contestModel.js";
import { Submission } from "./models/submissionModel.js";
import { User } from "./models/userModel.js";
import { ContestLeaderboard } from "./models/leaderboardModel.js";
import { calculateWeeklyBadges } from "./utils/badgeCalculator.js";
import dotenv from "dotenv";

dotenv.config({ path: "./config/config.env" });

async function fixContest() {
  await mongoose.connect('mongodb://127.0.0.1:27017', { dbName: 'MERN_AUTHENTICATION' });
  console.log("Connected to MongoDB -> MERN_AUTHENTICATION.");

  const contest = await Contest.findOne({ slug: /sample/i });
  if (!contest) return process.exit(0);

  // 1. Check all submissions for this contest
  const submissions = await Submission.find({ contest_id: contest._id });
  
  const userStats = {};
  submissions.forEach(s => {
    if (s.status === "Accepted") {
      const uid = String(s.user_id);
      if (!userStats[uid]) userStats[uid] = { solved_count: 0, penalty: 0, last: s.submitted_at };
      userStats[uid].solved_count++;
      userStats[uid].penalty += 10; // fake 10 mins penalty
      userStats[uid].last = s.submitted_at;
    }
  });

  for (const [uid, stats] of Object.entries(userStats)) {
      await ContestLeaderboard.updateOne(
          { contest_id: contest._id, user_id: uid },
          { $set: { 
              solved_count: stats.solved_count, 
              penalty_minutes: stats.penalty, 
              last_solved_at: stats.last 
             } 
          },
          { upsert: true }
      );
  }

  // 2. Award contest points to leaderboard participants
  const leaderboardRows = await ContestLeaderboard.find({
    contest_id: contest._id,
  }).lean();

  console.log("Leaderboard rows reconstructed:", leaderboardRows.length);

  for (const row of leaderboardRows) {
    const points = Math.max(0, row.solved_count * 100 - Math.floor(row.penalty_minutes));
    console.log(`Setting user ${row.user_id} -> ${points} points`);
    // Ensure total_solved increments up
    await User.findByIdAndUpdate(row.user_id, {
      $set: { contest_points: points, total_solved: row.solved_count } 
    });
  }

  // 3. Trigger weekly badge calculation
  try {
    await calculateWeeklyBadges(contest._id);
    console.log("Calculated weekly badges.");
  } catch (err) {
    console.error("Badge calculation failed:", err);
  }
  
  console.log(`Successfully fixed ${contest.name}!\n`);
  process.exit(0);
}

fixContest().catch(err => {
  console.error(err);
  process.exit(1);
});
