<h1 align="center">Contest Calendar Sync & Reminder System</h1>

<p align="center">
  Automatically sync upcoming coding contests to <b>Google Calendar</b> and get <b>contest reminders before they start</b>.
</p>

<hr>

<h2>🚀 Overview</h2>

<p>
<b>Contest Calendar Sync & Reminder System</b> is a lightweight backend service that fetches upcoming programming contests from <b>Codeforces</b>, generates a standards-compliant <b>iCalendar (ICS) feed</b>, and allows users to subscribe directly from <b>Google Calendar</b>, <b>Apple Calendar</b>, or <b>Outlook</b>.
</p>

<p>
The service refreshes contest data automatically and supports reminder notifications before contest start time.
</p>

<hr>

<h2>✨ Features</h2>

<ul>
  <li>📅 Fetches upcoming contests from the <b>Codeforces API</b></li>
  <li>🔄 Auto-refreshes contest data every <b>12 hours</b></li>
  <li>📥 Generates <b>ICS calendar feeds</b></li>
  <li>📱 Works with <b>Google Calendar, Apple Calendar, Outlook</b></li>
  <li>⏰ Adds <b>pre-contest reminder notifications</b></li>
  <li>⚡ Uses caching to reduce external API calls</li>
  <li>❤️ Simple health-check endpoint for monitoring</li>
</ul>

<hr>

<h2>🏗️ Backend Architecture</h2>

<p align="center">
  <img src="./Architecture.png" alt="ContestSync Architecture" width="900"/>
</p>

<p align="center">
  <i>Backend architecture of ContestSync showing contest fetching, caching, ICS generation, calendar synchronization, and reminder notifications.</i>
</p>

<hr>

<h2>📅 Add to Google Calendar</h2>

<ol>
  <li>Start the server.</li>
  <li>Copy the feed URL:</li>
</ol>

<pre><code>https://calendar-contests.onrender.com/contests.ics</code></pre>
<pre><code>https://leetcode-calendar.onrender.com/contests.ics</code></pre>
<ol start="3">
  <li>Open <b>Google Calendar</b>.</li>
  <li>Go to <b>Settings → Add calendar → From URL</b>.</li>
  <li>Paste the URL and click <b>Add calendar</b>.</li>
</ol>

<p>Upcoming contests will appear automatically.</p>

<hr>

<h2>🛠️ Tech Stack</h2>

<ul>
  <li>Node.js</li>
  <li>Express.js</li>
  <li>Axios</li>
  <li>ical-generator</li>
  <li>node-cron</li>
  <li>Google Calendar (ICS)</li>
  <li>CORS</li>
</ul>

<hr>

<h2>▶️ Run Locally</h2>

<pre><code class="language-bash">npm install
npm start</code></pre>

<p>Server will run at:</p>

<pre><code>http://localhost:5000</code></pre>

<hr>

<h2>📌 API Endpoints</h2>

<h3>Health Check</h3>

<pre><code class="language-http">GET /</code></pre>

<h3>Calendar Feed</h3>

<pre><code class="language-http">GET /contests.ics</code></pre>

<p>Returns a valid <b>ICS calendar file</b>.</p>



<p align="center">
  ⭐ If you found this project useful, please <b>star the repository</b>.
</p>
