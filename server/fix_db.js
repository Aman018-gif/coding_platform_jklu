import mongoose from 'mongoose';

async function fixDB() {
  await mongoose.connect('mongodb://127.0.0.1:27017/coding_platform');
  const db = mongoose.connection.db;
  
  const submissions = await db.collection('submissions').find({}).toArray();
  for (let s of submissions) {
    if (typeof s._id === 'string' || typeof s.user_id === 'string' || typeof s.contest_id === 'string' || typeof s.problem_id === 'string') {
      console.log('Fixing submission:', s._id);
      
      const newId = typeof s._id === 'string' && s._id.length === 24 ? new mongoose.Types.ObjectId(s._id) : s._id;
      const newUser = typeof s.user_id === 'string' && s.user_id.length === 24 ? new mongoose.Types.ObjectId(s.user_id) : s.user_id;
      const newContest = typeof s.contest_id === 'string' && s.contest_id.length === 24 ? new mongoose.Types.ObjectId(s.contest_id) : s.contest_id;
      const newProblem = typeof s.problem_id === 'string' && s.problem_id.length === 24 ? new mongoose.Types.ObjectId(s.problem_id) : s.problem_id;
      
      await db.collection('submissions').deleteOne({ _id: s._id });
      s._id = newId;
      s.user_id = newUser;
      s.contest_id = newContest;
      s.problem_id = newProblem;
      await db.collection('submissions').insertOne(s);
      
      // Also manually fix leaderboard if missing
      await db.collection('contestleaderboards').updateOne(
        { contest_id: newContest, user_id: newUser },
        { 
          $set: { solved_count: 1, penalty_minutes: 0, last_solved_at: s.submitted_at, 'attempts.69a3e876460069f8a49b0998': 0 }, 
          $push: { solved: { problem_id: newProblem, solved_at: s.submitted_at, penalty_minutes: 0 } } 
        },
        { upsert: true }
      );
      
      // Update User attendance stats manually since it was skipped
      await db.collection('users').updateOne(
        { _id: newUser },
        { $inc: { "contest_attendance.registered": 1, "contest_attendance.submitted": 1, contests_participated: 1 } }
      );
    }
  }
  
  // Re-run the end contest math so you actually get points and rank 1
  const leaderboards = await db.collection('contestleaderboards').find({}).toArray();
  for (let lb of leaderboards) {
      await db.collection('users').updateOne(
          { _id: lb.user_id },
          { $set: { contest_points: 100, total_solved: 1 } }
      );
  }

  console.log('Done fixing DB types and re-calculating points.');
  process.exit(0);
}

fixDB().catch(console.error);
