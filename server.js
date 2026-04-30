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
        start: toIST(new Date(c.startTimeSeconds * 1000)),
        end: toIST(
          new Date(c.startTimeSeconds * 1000 + c.durationSeconds * 1000),
        ),
        url: `https://codeforces.com/contests/${c.id}`,
        description: "Codeforces Contest",
      }));

    // LeetCode (generated)
    const lcContests = generateLeetCodeContests();

    // Merge both
    cachedContests = [...cfContests, ...lcContests];

    lastUpdated = new Date();

    console.log("✅ Total contests:", cachedContests.length);
  } catch (err) {
    console.error("❌ Error fetching contests:", err.message);
  }
}

// Generate contests from Leetcode
function setTime(date, hour, minute) {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
}
function toIST(date) {
  return new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
}
function generateLeetCodeContests() {
  const contests = [];
  const now = new Date();

  const baseBiweekly = new Date("2024-01-06"); // known LC biweekly

  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(now.getDate() + i);

    const day = date.getDay();

    // 🟡 Weekly (Sunday)
    if (day === 0) {
      contests.push({
        id: `lc-weekly-${date.toISOString()}`,
        title: "[LC] Weekly Contest",
        start: setTime(date, 20, 0),
        end: setTime(date, 21, 30),
        url: "https://leetcode.com/contest/",
        description: "LeetCode Weekly Contest",
      });
    }

    // 🔵 Biweekly (Saturday alternate)
    if (day === 6) {
      const diffWeeks = Math.floor(
        (date - baseBiweekly) / (7 * 24 * 60 * 60 * 1000),
      );

      if (diffWeeks % 2 === 0) {
        contests.push({
          id: `lc-biweekly-${date.toISOString()}`,
          title: "[LC] Biweekly Contest",
          start: setTime(date, 20, 0),
          end: setTime(date, 21, 30),
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
      timezone: "Asia/Kolkata",
    });

    // 🔥 REQUIRED for Google Calendar URL subscription
    calendar.timezone({
      name: "Asia/Kolkata",
      generator: () => `
        BEGIN:VTIMEZONE
        TZID:Asia/Kolkata
        BEGIN:STANDARD
        DTSTART:19700101T000000
        TZOFFSETFROM:+0530
        TZOFFSETTO:+0530
        TZNAME:IST
        END:STANDARD
        END:VTIMEZONE
        `,
    });

    cachedContests.forEach((contest) => {
      calendar.createEvent({
        id: contest.id, // prevents duplicates
        start: contest.start,
        end: contest.end,
        timezone: "Asia/Kolkata",
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
