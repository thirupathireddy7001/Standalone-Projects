# Using Job Portal with GitHub Pages - Perfect Solution! 🎉

## Great News!

Since you're already using **GitHub Pages**, you don't need a local server for production! GitHub Pages serves your files properly, so `jobs.json` will load automatically.

---

## How It Works with GitHub Pages

### ✅ What Works Automatically:

1. **Dynamic Job Loading** - `jobs.json` loads perfectly
2. **Job Sorting** - By deadline, nearest first
3. **Expired Jobs** - Automatically hidden
4. **Manual Job Addition** - Just edit `jobs.json` and push to GitHub

### 📋 Workflow:

```
Edit jobs.json locally → Commit → Push to GitHub → Live on GitHub Pages!
```

---

## Adding Jobs to Your Live Site

### Method 1: Edit Directly on GitHub (Easiest)

1. Go to your GitHub repository
2. Click on `jobs.json`
3. Click the pencil icon (Edit)
4. Add your new job:
   ```json
   ,
   {
     "id": 13,
     "category": "off-campus",
     "categoryLabel": "Off-Campus",
     "title": "Your Job Title",
     "company": "Company Name",
     "badge": "CN",
     "location": "Location",
     "Last Date to Apply": "25 June 2026 11:59 PM",
     "eligibility": "Requirements here",
     "description": "Job description here",
     "note": "Entry-level • Full-time",
     "applyUrl": "https://apply-link.com",
     "active": true
   }
   ```
5. Scroll down, add commit message
6. Click "Commit changes"
7. **Wait 1-2 minutes** for GitHub Pages to update
8. Refresh your live site - new job appears!

### Method 2: Edit Locally and Push

1. Edit `jobs.json` on your computer
2. Open terminal/command prompt
3. Run:
   ```bash
   cd "C:\Users\ThirupathireddyBijja\Documents\GithubPersonal\Standalone-Projects"
   git add jobs.json
   git commit -m "Added new job"
   git push
   ```
4. Wait 1-2 minutes for GitHub Pages to update
5. Refresh your live site

---

## Using the Scraper with GitHub Pages

### Workflow:

1. **Run scraper locally:**
   ```bash
   python scraper_with_examples.py
   ```

2. **Scraper updates `jobs.json`** with new jobs

3. **Push to GitHub:**
   ```bash
   git add jobs.json
   git commit -m "Updated jobs from scraper"
   git push
   ```

4. **GitHub Pages updates automatically** (1-2 minutes)

5. **Live site shows new jobs!**

---

## Testing Locally Before Pushing

### Why Test Locally?

- See changes immediately
- Verify sorting works
- Check for errors
- Test before going live

### How to Test:

**Option A: Python Server (Recommended)**
```bash
cd "C:\Users\ThirupathireddyBijja\Documents\GithubPersonal\Standalone-Projects"
python -m http.server 8000
```
Open: `http://localhost:8000/index.html`

**Option B: VS Code Live Server**
1. Install "Live Server" extension
2. Right-click `index.html`
3. "Open with Live Server"

---

## Current Setup Status

✅ **GitHub Pages** - Your production environment
✅ **jobs.json** - 12 jobs including test job
✅ **Sorting** - By deadline (nearest first)
✅ **Expiration** - Auto-hides expired jobs
✅ **Scraper** - Ready to add jobs from websites

---

## Recommended Workflow

### For Manual Job Addition:

```
1. Edit jobs.json (locally or on GitHub)
2. Test locally (optional but recommended)
3. Push to GitHub
4. Live in 1-2 minutes!
```

### For Automated Scraping:

```
1. Run: python scraper_with_examples.py
2. Review jobs.json changes
3. git add jobs.json
4. git commit -m "Scraped new jobs"
5. git push
6. Live in 1-2 minutes!
```

---

## Scheduling Automatic Updates

### Option 1: GitHub Actions (Recommended)

Create `.github/workflows/scrape-jobs.yml`:

```yaml
name: Scrape Jobs Daily

on:
  schedule:
    - cron: '0 6 * * *'  # Run at 6 AM daily
  workflow_dispatch:  # Allow manual trigger

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.x'
      
      - name: Install dependencies
        run: pip install -r requirements.txt
      
      - name: Run scraper
        run: python scraper_with_examples.py
      
      - name: Commit and push if changed
        run: |
          git config --global user.name 'GitHub Action'
          git config --global user.email 'action@github.com'
          git add jobs.json
          git diff --quiet && git diff --staged --quiet || (git commit -m "Auto-update jobs" && git push)
```

This will:
- Run scraper daily at 6 AM
- Update jobs.json automatically
- Push to GitHub Pages
- No manual intervention needed!

### Option 2: Local Scheduled Task

Use Windows Task Scheduler to run scraper daily, then auto-push to GitHub.

---

## Important Notes

### ✅ Advantages of GitHub Pages:

- No CORS issues
- Free hosting
- Automatic HTTPS
- Fast CDN delivery
- Easy updates via git

### ⚠️ Limitations:

- 1-2 minute delay for updates
- Can't run Python scraper directly on GitHub Pages
- Need to push changes to see them live

### 💡 Best Practice:

1. **Test locally** with Python server
2. **Verify everything works**
3. **Push to GitHub**
4. **Goes live automatically**

---

## Quick Commands Reference

```bash
# Test locally
python -m http.server 8000
# Open: http://localhost:8000/index.html

# Run scraper
python scraper_with_examples.py

# Push to GitHub Pages
git add jobs.json
git commit -m "Updated jobs"
git push

# Check GitHub Pages status
# Go to: Settings → Pages in your repo
```

---

## Summary

🎉 **You're all set!** Your GitHub Pages setup is perfect for this job portal.

**To add jobs:**
1. Edit `jobs.json` (locally or on GitHub)
2. Push to GitHub
3. Wait 1-2 minutes
4. Live!

**To test locally first:**
1. Run `python -m http.server 8000`
2. Open `http://localhost:8000/index.html`
3. Verify changes
4. Push to GitHub

No challenges - GitHub Pages is the ideal solution! 🚀