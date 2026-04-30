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


    // Merge both
    cachedContests = cfContests
console.log(cachedContests)
    lastUpdated = new Date();

    console.log("✅ Total contests:", cachedContests.length);
  } catch (err) {
    console.error("❌ Error fetching contests:", err.message);
  }
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
