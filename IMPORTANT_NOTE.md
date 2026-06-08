# IMPORTANT: Local File Limitations

## The Problem

When you open `index.html` directly in a browser (using `file://` protocol), browsers block loading `jobs.json` due to **CORS (Cross-Origin Resource Sharing)** security restrictions.

**Result:** The website falls back to embedded jobs data in the HTML file.

## Solutions

### Option 1: Use a Local Web Server (Recommended)

This allows `jobs.json` to load properly.

**Using Python:**
```bash
# Navigate to the directory with index.html
cd "C:/Users/ThirupathireddyBijja/Documents/GithubPersonal/Standalone-Projects"

# Start server (Python 3)
python -m http.server 8000

# Open browser to: http://localhost:8000/index.html
```

**Using Node.js:**
```bash
# Install http-server globally
npm install -g http-server

# Start server
http-server

# Open browser to: http://localhost:8080/index.html
```

**Using VS Code Extension:**
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

### Option 2: Add Jobs to Both Places (For Direct File Opening)

If you must open the HTML file directly:

1. **Add to `jobs.json`** (for when using a server)
2. **Also add to embedded data in `index.html`** (for direct file opening)

Find `const embeddedJobs = [` in `index.html` (around line 547) and add your job there too.

### Option 3: Deploy to a Web Server

Upload both `index.html` and `jobs.json` to any web hosting service:
- GitHub Pages
- Netlify
- Vercel
- Any web hosting

## Current Status

✅ **jobs.json** has 12 jobs (including the test Amazon job)
❌ **Embedded data in HTML** has 11 jobs (missing the test job)

## To See the Test Job

**Quick Fix - Add to Embedded Data:**

Open `index.html`, find line ~700 (before the closing `]` of `embeddedJobs`), and add:

```javascript
,
{
  "id": 12,
  "category": "off-campus",
  "categoryLabel": "Off-Campus",
  "title": "Software Development Engineer - TEST JOB",
  "company": "Amazon India",
  "badge": "AM",
  "CTC": "₹15-20 LPA",
  "location": "Hyderabad / Bengaluru",
  "Last Date to Apply": "20 June 2026 11:59 PM",
  "eligibility": "B.Tech/B.E in CS/IT (2024/2025/2026 batch)",
  "description": "Join Amazon as an SDE to work on cutting-edge technologies.",
  "note": "Entry-level • Full-time • Manually Added",
  "applyUrl": "https://www.amazon.jobs/en/search",
  "active": true
}
```

**OR use a local server (recommended)** to see jobs from `jobs.json` automatically.

## Recommendation for Production

For your actual job portal:
1. Host on a web server (GitHub Pages is free!)
2. Use the scraper to update `jobs.json`
3. Jobs will load dynamically without editing HTML

## Testing the Scraper

The scraper works correctly and will update `jobs.json`. To test:

```bash
# Install dependencies
pip install -r requirements.txt

# Run scraper
python scraper_with_examples.py

# Start local server to see results
python -m http.server 8000
```

Then open `http://localhost:8000/index.html` in your browser.