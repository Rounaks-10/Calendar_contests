Contest Calendar Sync & Reminder System

Automatically sync upcoming coding contests to Google Calendar and get contest reminders before they start.


🚀 Overview

Contest Calendar Sync & Reminder System is a lightweight backend service that fetches upcoming programming contests from Codeforces, generates a standards-compliant iCalendar (ICS) feed, and allows users to subscribe directly from Google Calendar, Apple Calendar, or Outlook.

The service refreshes contest data automatically and supports reminder notifications before contest start time.

✨ Features
📅 Fetches upcoming contests from the Codeforces API
🔄 Auto-refreshes contest data every 12 hours
📥 Generates ICS calendar feeds
📱 Works with Google Calendar, Apple Calendar, Outlook
⏰ Adds pre-contest reminder notifications
⚡ Uses caching to reduce external API calls
❤️ Simple health-check endpoint for monitoring

🏗️ Backend Architecture

## Architecture

<p align="center">
  <img src="./assets/architecture.png" alt="ContestSync Architecture" width="900"/>
</p>

<p align="center">
  <i>Backend architecture of ContestSync showing contest fetching, caching, ICS generation, calendar synchronization, and reminder notifications.</i>
</p>

📅 Add to Google Calendar
Start the server.
Copy the feed URL:
http://localhost:5000/contests.ics
Open Google Calendar.
Go to Settings → Add calendar → From URL.
Paste the URL and click Add calendar.

Upcoming contests will appear automatically.
