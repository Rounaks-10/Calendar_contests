import express from "express";
import axios from "axios";
import ical from "ical-generator";
import cron from "node-cron";
import cors from "cors";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

// In-memory cache (replace with DB for scale)
let cachedContests = [];
let lastUpdated = null;

//  Fetch contests from Codeforces
async function fetchContests() {
  try {
    // Codeforces
    const { data } = await axios.get("https://codeforces.com/api/contest.list");

    const cfContests = data.result
      .filter((c) => c.phase === "BEFORE")
      .map((c) => ({
        id: `cf-${c.id}`,
        title: "[CF] " + c.name,
        start: new Date(c.startTimeSeconds * 1000),
        end: new Date(c.startTimeSeconds * 1000 + c.durationSeconds * 1000),
        url: `https://codeforces.com/contests/${c.id}`,
        description: "Codeforces Contest",
      }));

    // LeetCode (generated)
    const lcContests = generateLeetCodeContests();

    // Merge both
    cachedContests = [...cfContests, ...lcContests];
    console.log(cachedContests)

    lastUpdated = new Date();

    console.log("✅ Total contests:", cachedContests.length);
  } catch (err) {
    console.error("❌ Error fetching contests:", err.message);
  }
}

// Generate contests from Leetcode
function setTimeUTC(date, hour, minute) {
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    hour,
    minute,
    0,
    0
  ));
}

function generateLeetCodeContests() {
  const contests = [];
  const now = new Date();

  const baseBiweekly = new Date(Date.UTC(2024, 0, 6)); // Jan = 0

  for (let i = 0; i < 30; i++) {
    const date = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + i
    ));

    const day = date.getUTCDay();

    // 🟡 Weekly (Sunday)
    if (day === 0) {
      contests.push({
        id: `lc-weekly-${date.toISOString()}`,
        title: "[LC] Weekly Contest",
        start: setTimeUTC(date, 20, 0),
        end: setTimeUTC(date, 21, 30),
        url: "https://leetcode.com/contest/",
        description: "LeetCode Weekly Contest",
      });
    }

    // 🔵 Biweekly (Saturday alternate)
    if (day === 6) {
      const diffWeeks = Math.floor(
        (date - baseBiweekly) / (7 * 24 * 60 * 60 * 1000)
      );

      if (diffWeeks % 2 === 0) {
        contests.push({
          id: `lc-biweekly-${date.toISOString()}`,
          title: "[LC] Biweekly Contest",
          start: setTimeUTC(date, 20, 0),
          end: setTimeUTC(date, 21, 30),
          url: "https://leetcode.com/contest/",
          description: "LeetCode Biweekly Contest",
        });
      }
    }
  }

  return contests;
}

// Run initially
fetchContests();

// Update every day
cron.schedule("0 */12 * * *", fetchContests);

// ICS Feed Route
app.get("/contests.ics", (req, res) => {
  try {
    const calendar = ical({
      name: "Coding Contests",
    });

    cachedContests.forEach((contest) => {
      calendar.createEvent({
        id: contest.id, // prevents duplicates
        start: contest.start,
        end: contest.end,
        summary: contest.title,
        description: contest.description,
        url: contest.url,
        alarms: [
          {
            type: "display",
            trigger: 30 * 60, // 30 minutes before
          },
        ],
      });
    });

    res.setHeader("Content-Type", "text/calendar");
    res.send(calendar.toString());
  } catch (err) {
    console.error("ICS Error:", err.stack || err);
    res.status(500).send("Error generating calendar");
  }
});

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "running",
    contests: cachedContests.length,
    lastUpdated,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
