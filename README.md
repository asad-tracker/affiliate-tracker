\# Affiliate Tracker



A production-ready affiliate tracking system built with Node.js, Express, PostgreSQL, and Redis.

Similar to Voluum — tracks clicks, conversions, and revenue across campaigns and traffic sources.



\## Features



\- Click tracking with unique click\_id generation

\- Weighted campaign path selection (lander or direct to offer)

\- Postback handler with duplicate conversion protection

\- Google Ads CSV export (exact format for upload)

\- Keyword and campaign performance reports

\- Bot detection and click deduplication

\- Rate limiting on tracking endpoints

\- Redis caching (optional)

\- Input validation and SQL injection protection

\- Daily automated CSV export via cron job



\## Tech Stack



\- Node.js + Express

\- PostgreSQL 14+

\- Redis (optional)

\- node-cron (scheduled exports)



\## Project Structure

