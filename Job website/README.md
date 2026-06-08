# 🎯 Job Portal Web Scraper - Complete Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [System Requirements](#system-requirements)
3. [Project Structure](#project-structure)
4. [Installation Steps](#installation-steps)
5. [Issues We Faced & Solutions](#issues-we-faced--solutions)
6. [How to Run the Scraper](#how-to-run-the-scraper)
7. [How It Behaves](#how-it-behaves)
8. [Website Features](#website-features)
9. [Troubleshooting](#troubleshooting)
10. [Adding New Job Sources](#adding-new-job-sources)

---

## 🎯 Overview

This is an automated job scraping system for a job portal website. It:
- Scrapes jobs from **LinkedIn**, **Naukri**, and **Indeed**
- Automatically sorts jobs by **nearest deadline first**
- Hides **expired jobs** automatically
- Preserves **manually added jobs** with specific dates
- Updates the website with fresh job listings

---

## 💻 System Requirements

### Required Software
- **Operating System**: Windows 10/11
- **Python**: Version 3.12.0 or higher
- **Browser**: Chrome or Edge (for Selenium WebDriver)
- **Internet Connection**: Required for web scraping

### Python Packages
- `selenium` >= 4.15.0
- `beautifulsoup4` >= 4.12.0
- `requests` >= 2.31.0

---

## 📁 Project Structure

```
Parent Folder/
├── index.html                    # Main job portal website
├── jobs.json                     # Job data file (auto-updated)
│
└── Job website/                  # Scraper folder
    ├── README.md                 # This documentation
    ├── scraper_with_examples.py  # Main scraper script
    └── requirements.txt          # Python dependencies
```

### File Locations (IMPORTANT!)
- **Website**: `../index.html` (parent folder)
- **Job Data**: `../jobs.json` (parent folder - same location as index.html)
- **Scraper**: `./scraper_with_examples.py` (Job website folder)

The scraper saves to `../jobs.json` so the website can read it directly.

---

## 🔧 Installation Steps

### Step 1: Install Python

1. **Download Python 3.12.0**:
   - Visit: https://www.python.org/downloads/
   - Download the **Windows installer (64-bit)** - look for `.exe` file
   - **DO NOT** download source code (`.tar.gz` or `.zip`)

2. **Run the Installer**:
   - Double-click the downloaded `.exe` file
   - ✅ **IMPORTANT**: Check "Add Python to PATH" at the bottom
   - Click "Install Now"
   - Wait for installation to complete

3. **Verify Installation**:
   ```bash
   # Open NEW Command Prompt or PowerShell
   python --version
   ```
   Should show: `Python 3.12.0`

### Step 2: Install Python Packages

1. **Navigate to Project Folder**:
   ```bash
   cd "C:\Users\ThirupathireddyBijja\Documents\GithubPersonal\Standalone-Projects\Job website"
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Verify Installation**:
   ```bash
   pip list
   ```
   Should show: selenium, beautifulsoup4, requests

### Step 3: Install Chrome/Edge Browser

- Chrome: https://www.google.com/chrome/
- Edge: Pre-installed on Windows 10/11

Selenium will automatically use the installed browser.

---

## 🐛 Issues We Faced & Solutions

### Issue 1: Python Not Found in PATH
**Problem**: After installing Python, terminal showed "python is not recognized"

**Cause**: Terminal was opened BEFORE Python installation, so it didn't have the updated PATH

**Solution**: 
1. Close ALL Command Prompt/PowerShell windows
2. Open a NEW terminal
3. Python will now be recognized

**How to Fix Manually** (if still not working):
1. Search "Environment Variables" in Windows
2. Click "Environment Variables" button
3. Under "System variables", find "Path"
4. Click "Edit"
5. Add: `C:\Users\YourUsername\AppData\Local\Programs\Python\Python312`
6. Add: `C:\Users\YourUsername\AppData\Local\Programs\Python\Python312\Scripts`
7. Click OK, restart terminal

### Issue 2: Downloaded Python Source Code Instead of Installer
**Problem**: Downloaded `.tar.gz` file instead of `.exe` installer

**Solution**: 
- Go back to python.org
- Look for "Windows installer (64-bit)" - it should be an `.exe` file
- Download and run the `.exe` file

### Issue 3: Scraper Found Jobs But Saved 0
**Problem**: 
```
Found 16 job cards on Indeed
✓ Saved 0 jobs to jobs.json
```

**Cause**: CSS selectors didn't match the website's HTML structure

**Solution**: 
- Updated selectors to try multiple patterns
- Added fallback selectors for title, company, and location
- Now successfully extracts job data

### Issue 4: Two jobs.json Files in Different Locations
**Problem**: Scraper created `jobs.json` in wrong folder, website couldn't find it

**Cause**: `JOBS_FILE = "jobs.json"` saved to current directory instead of parent

**Solution**: 
- Changed to `JOBS_FILE = "../jobs.json"`
- Deleted duplicate file in wrong location
- Now saves to parent folder where `index.html` is located

### Issue 5: Website Not Loading jobs.json (CORS Error)
**Problem**: Opening `index.html` directly in browser showed no jobs

**Cause**: Browsers block loading local JSON files due to CORS security policy

**Solutions**:
1. **Use GitHub Pages** (Recommended):
   - Push to GitHub
   - Enable GitHub Pages in repository settings
   - Access via: `https://username.github.io/repo/index.html`

2. **Use Local Server**:
   ```bash
   cd ..  # Go to parent folder
   python -m http.server 8000
   ```
   Then visit: `http://localhost:8000/index.html`

3. **Direct File** (May not work):
   - Just open `index.html` in browser
   - If jobs don't load, use option 1 or 2

---

## 🚀 How to Run the Scraper

### Quick Run
```bash
cd "C:\Users\ThirupathireddyBijja\Documents\GithubPersonal\Standalone-Projects\Job website"
python scraper_with_examples.py
```

### Expected Output
```
============================================================
7001 Creations Job Scraper
============================================================
Started at: 2026-06-08 16:47:47

Scraping LinkedIn: https://www.linkedin.com/jobs/...
Found 8 job cards on LinkedIn

--- DEBUG: First job card structure ---
Card classes: ['base-card']
Title elements found: [True, False, False]
Company elements found: [True, False, False]
--- END DEBUG ---

  ✓ Added: Software Engineer at Microsoft
  ✓ Added: Developer at Google
  ✓ Added: SDE at Amazon
  ✓ Added: Engineer at Meta
  ✓ Added: Developer at Netflix

Scraping Naukri: https://www.naukri.com/fresher-jobs
Found 12 job cards on Naukri
  ✓ Added: Java Developer at TCS
  ✓ Added: Python Developer at Infosys
  ✓ Added: Full Stack Developer at Wipro
  ✓ Added: Backend Engineer at HCL
  ✓ Added: Frontend Developer at Tech Mahindra

Scraping Indeed: https://in.indeed.com/jobs?...
Found 16 job cards on Indeed
  ✓ Added: Software Engineer at Chandan Tech Solutions
  ✓ Added: Software Engineer at NielsenIQ
  ✓ Added: Software Engineer at PayU
  ✓ Added: Software Engineer at OfficialHiring
  ✓ Added: Software Engineer II at Appian Corporation

Loaded 12 existing jobs

✓ Saved 27 jobs to ../jobs.json
  - Manual jobs preserved: 12
  - New scraped jobs: 15

✓ Completed at: 2026-06-08 16:48:49
```

### What Just Happened?
1. ✅ Scraped 5 jobs from LinkedIn
2. ✅ Scraped 5 jobs from Naukri
3. ✅ Scraped 5 jobs from Indeed
4. ✅ Loaded 12 existing manual jobs
5. ✅ Removed old "Apply ASAP" jobs
6. ✅ Saved 27 total jobs (12 manual + 15 new scraped)

---

## 🎭 How It Behaves

### 1. Loading Existing Jobs
```python
# Reads ../jobs.json
# Identifies two types:
# - Manual jobs: Have specific dates like "15 June 2026"
# - Scraped jobs: Have "Apply ASAP" or "Rolling – Apply ASAP"
```

### 2. Scraping Process
```python
# For each enabled website (LinkedIn, Naukri, Indeed):
#   1. Launch headless Chrome browser
#   2. Navigate to job search URL
#   3. Wait 5 seconds for page load
#   4. Parse HTML with BeautifulSoup
#   5. Find job cards using CSS selectors
#   6. Extract: title, company, location
#   7. Create job object with standard format
#   8. Add to jobs list
#   9. Close browser
```

### 3. Job Extraction Logic
```python
# Tries multiple CSS selector patterns:
# Title: h2.jobTitle OR a.jcs-JobTitle OR span[title]
# Company: span.companyName OR span[data-testid="company-name"]
# Location: div.companyLocation OR div[data-testid="text-location"]

# If title AND company found:
#   ✓ Add job
# Else:
#   ✗ Skip job (log reason)
```

### 4. Merging Strategy
```python
# Keep: All manual jobs (specific dates)
# Remove: Old scraped jobs ("Apply ASAP")
# Add: New scraped jobs (fresh "Apply ASAP")
# Result: manual_jobs + new_scraped_jobs
```

### 5. Saving to File
```python
# Saves to: ../jobs.json
# Format: JSON array of job objects
# Encoding: UTF-8 (supports special characters)
# Indentation: 2 spaces (human-readable)
```

### 6. Website Display
```javascript
// index.html loads jobs.json
// Parses "Last Date to Apply" field
// Sorts by nearest deadline first
// Filters out expired jobs
// Renders in UI with sorting
```

---

## 🌐 Website Features

### 1. Date Parsing
```javascript
function parseDate(dateString) {
  // Handles formats:
  // - "15 June 2026" → Date object
  // - "Apply ASAP" → Far future (2099-12-31)
  // - "Rolling – Apply ASAP" → Far future
  // - Invalid → Far future (safe fallback)
}
```

### 2. Expiration Check
```javascript
function isJobExpired(dateString) {
  // Compares with today's date
  // Returns true if deadline passed
  // Expired jobs are hidden from display
}
```

### 3. Sorting Algorithm
```javascript
function sortJobsByDeadline(jobs) {
  // Calculates days until deadline
  // Sorts ascending (nearest first)
  // "Apply ASAP" jobs appear at end
  // Result: [urgent jobs ... ASAP jobs]
}
```

### 4. Display Logic
```javascript
// 1. Load jobs from jobs.json
// 2. Filter out expired jobs
// 3. Sort by deadline (nearest first)
// 4. Render to UI
// 5. Update counts and badges
```

---

## 🔍 Troubleshooting

### Scraper Issues

**Problem**: `python: command not found`
- **Solution**: Install Python or add to PATH (see Issue 1)

**Problem**: `ModuleNotFoundError: No module named 'selenium'`
- **Solution**: Run `pip install -r requirements.txt`

**Problem**: Found X jobs but saved 0
- **Solution**: Website HTML changed, CSS selectors need updating
- **Check**: Debug output shows which selectors failed
- **Fix**: Update selectors in `scraper_with_examples.py`

**Problem**: Browser doesn't open
- **Solution**: Install Chrome or Edge browser
- **Alternative**: Update Selenium WebDriver

### Website Issues

**Problem**: Jobs not showing on website
- **Check 1**: Does `../jobs.json` exist and have data?
- **Check 2**: Using file:// protocol? Switch to local server or GitHub Pages
- **Check 3**: Browser cache? Press Ctrl+Shift+R to hard refresh

**Problem**: Old jobs still showing
- **Solution**: Run scraper again to update jobs.json
- **Alternative**: Manually edit jobs.json to remove old jobs

**Problem**: Jobs not sorted correctly
- **Check**: "Last Date to Apply" field format
- **Fix**: Ensure dates are in "DD Month YYYY" format

---

## ➕ Adding New Job Sources

### Step 1: Add to Configuration
```python
# In scraper_with_examples.py, line 27
SCRAPING_SOURCES = [
    # ... existing sources ...
    {
        "name": "YourSite",
        "enabled": True,
        "url": "https://example.com/jobs",
        "type": "selenium"
    }
]
```

### Step 2: Create Scraper Method
```python
def scrape_yoursite(self, url):
    """Scrape jobs from YourSite"""
    print(f"Scraping YourSite: {url}")
    driver = self.setup_driver()
    
    try:
        driver.get(url)
        time.sleep(5)
        
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        job_cards = soup.find_all('div', class_='job-card')  # Update selector
        
        print(f"Found {len(job_cards)} job cards on YourSite")
        
        for card in job_cards[:5]:
            try:
                title = card.find('h2', class_='title').text.strip()
                company = card.find('span', class_='company').text.strip()
                
                if title and company:
                    job = {
                        "id": self.job_id_counter,
                        "category": "off-campus",
                        "categoryLabel": "Off-Campus",
                        "title": title,
                        "company": company,
                        "badge": company[:2].upper(),
                        "location": "India",
                        "eligibility": "Check job details",
                        "Last Date to Apply": "Apply ASAP",
                        "description": f"Opportunity at {company}.",
                        "note": "Entry-level • Full-time",
                        "applyUrl": url,
                        "active": True
                    }
                    
                    self.jobs.append(job)
                    self.job_id_counter += 1
                    print(f"  ✓ Added: {job['title']} at {job['company']}")
                    
            except Exception as e:
                print(f"  ✗ Error: {e}")
                continue
                
    except Exception as e:
        print(f"Error scraping YourSite: {e}")
    finally:
        driver.quit()
```

### Step 3: Add to Run Method
```python
# In run() method, line 310
if source['name'] == 'YourSite':
    self.scrape_yoursite(source['url'])
```

### Step 4: Test
```bash
python scraper_with_examples.py
```

---

## 📊 Summary

### What We Built
- ✅ Automated job scraper for 3 websites
- ✅ Smart job sorting by deadline
- ✅ Automatic expiration handling
- ✅ Manual job preservation
- ✅ Clean, maintainable code

### Key Features
- 🔄 Auto-updates job listings
- 📅 Sorts by nearest deadline
- 🗑️ Hides expired jobs
- 💾 Preserves manual entries
- 🌐 Works with GitHub Pages

### Files to Keep
- `README.md` - This documentation
- `scraper_with_examples.py` - Main scraper
- `requirements.txt` - Dependencies
- `../index.html` - Website
- `../jobs.json` - Job data

---

## 🎉 You're All Set!

Run the scraper:
```bash
python scraper_with_examples.py
```

View the website:
```bash
cd ..
python -m http.server 8000
# Visit: http://localhost:8000/index.html
```

Or push to GitHub Pages for live hosting!

---

**Last Updated**: June 8, 2026  
**Version**: 1.0  
**Author**: 7001 Creations