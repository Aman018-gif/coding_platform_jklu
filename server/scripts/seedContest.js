/**
 * Seed script: creates JKLU_DAA_CONTEST_01 with sample problems and test cases.
 * Run from server folder: node scripts/seedContest.js
 * Ensure MongoDB is running and config.env is loaded (e.g. run after app has connected).
 */
import mongoose from "mongoose";
import { config } from "dotenv";
import { Contest } from "../models/contestModel.js";
import { Problem } from "../models/problemModel.js";

config({ path: "./config.env" });

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const DB_NAME = process.env.DB_NAME || "MERN_AUTHENTICATION";

async function seed() {
  await mongoose.connect(MONGO_URI.trim(), { dbName: DB_NAME });
  console.log("Connected to MongoDB");

  const now = new Date();
  const start = new Date(now);
  const end = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  let contest = await Contest.findOne({ name: "JKLU_DAA_CONTEST_01" });
  if (!contest) {
    contest = await Contest.create({
      name: "JKLU_DAA_CONTEST_01",
      slug: "jklu-daa-contest-01",
      start_time: start,
      end_time: end,
      is_active: true,
    });
    console.log("Created contest:", contest.name);
  }

  const problemsData = [
    {
      title: "Optimal Path Finding",
      slug: "optimal-path-finding",
      description: "Given a weighted directed graph with V nodes and E edges, find the shortest path between the source and destination nodes using Dijkstra's algorithm. The graph may contain cycles but no negative weights. You must return the total weight of the path. If no path exists, return -1.",
      difficulty: "MEDIUM",
      category: "GRAPH THEORY",
      time_limit: 2,
      memory_limit: 256,
      input_format: "First line: V and E. Next E lines: u, v, w (source, target, weight). Last line: start and end nodes.",
      constraints: "1 <= V <= 10^5\n1 <= E <= 2*10^5\n0 <= u,v < V\n1 <= w <= 10^9",
      contest_id: contest._id,
      order_index: 1,
      test_cases: [
        { input: "3 3\n0 1 5\n1 2 3\n0 2 10\n0 2", expected_output: "8", is_sample: true },
        { input: "2 1\n0 1 1\n0 1", expected_output: "1", is_sample: false },
      ],
    },
    {
      title: "The Longest Path",
      slug: "the-longest-path",
      description: "Find the maximum length of a sequence where each subsequent element is strictly greater than the previous one in a 2D matrix.",
      difficulty: "EASY",
      category: "DYNAMIC PROGRAMMING",
      time_limit: 1,
      memory_limit: 256,
      input_format: "First line: n, m. Next n lines: m space-separated integers.",
      constraints: "1 <= n,m <= 100",
      contest_id: contest._id,
      order_index: 2,
      test_cases: [
        { input: "2 2\n1 2\n3 4", expected_output: "3", is_sample: true },
      ],
    },
    {
      title: "Network Flow",
      slug: "network-flow",
      description: "Implement the Edmonds-Karp algorithm to find the maximum flow through a given network of nodes and weighted edges.",
      difficulty: "HARD",
      category: "GRAPH THEORY",
      time_limit: 2,
      memory_limit: 512,
      input_format: "First line: V, E, source, sink. Next E lines: u, v, capacity.",
      constraints: "2 <= V <= 100\n1 <= E <= 1000",
      contest_id: contest._id,
      order_index: 3,
      test_cases: [
        { input: "4 5\n0 1 10\n0 2 5\n1 2 15\n1 3 10\n2 3 10\n0 3", expected_output: "15", is_sample: true },
      ],
    },
  ];

  for (const p of problemsData) {
    const existing = await Problem.findOne({ slug: p.slug, contest_id: contest._id });
    if (!existing) {
      await Problem.create(p);
      console.log("Created problem:", p.title);
    }
  }

  await mongoose.disconnect();
  console.log("Seed done.");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
