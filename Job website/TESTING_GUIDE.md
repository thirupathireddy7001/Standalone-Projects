# Testing Guide - Job Portal Dynamic Features

## Question 1: How to Check This Functionality?

### A. Test Job Sorting by Deadline

1. **Open the website** in your browser (already opened at `../index.html`)

2. **Check browser console** (Press F12 → Console tab)
   - You should see: `✓ Loaded X jobs from jobs.json`
   - This confirms jobs are loading from the JSON file

3. **Verify sorting order:**
   - Jobs with "10 June 2026" deadline should appear FIRST
   - Jobs with "15 June 2026" should come next
   - Jobs with "31 July 2026" should follow
   - Jobs with "Apply ASAP" should appear LAST

4. **Test expiration logic:**
   - Currently all jobs are active (dates are in future)
   - To test expiration, edit a job's date to past (e.g., "1 January 2026")
   - Refresh page - that job should disappear

### B. Test Dynamic Loading from JSON

**Step 1:** Open browser console (F12)

**Step 2:** Check the console message:
```
✓ Loaded 11 jobs from jobs.json
```

**Step 3:** Verify jobs are from JSON (not embedded):
- The page should show all 11 jobs from jobs.json
- If jobs.json is missing, it falls back to embedded data

### C. Test the Scraper (Without Running It)

Since LinkedIn requires authentication and has anti-scraping measures, we'll test with a simpler approach:

**Option 1: Dry Run Test**
```bash
# This will show what the scraper would do
python scraper.py
```

**Expected Output:**
```
============================================================
7001 Creations Job Scraper
============================================================
Started at: 2026-06-08 15:30:00

Scraping LinkedIn: https://www.linkedin.com/jobs/search/...
Found X job cards
  ✓ Added: Job Title at Company Name
  ...

✓ Successfully saved X jobs to jobs.json
  - Manual jobs preserved: 11
  - New scraped jobs: X

✓ Scraping completed at: 2026-06-08 15:30:30
============================================================
```

---

## Question 2: How to Add Another Website as Reference?

### Example: Adding Naukri.com

**Step 1:** Open `scraper.py` in your editor

**Step 2:** Find the `SCRAPING_SOURCES` list (around line 18)

**Step 3:** Add your new source:

```python
SCRAPING_SOURCES = [
    {
        "name": "LinkedIn",
        "enabled": True,
        "url": "https://www.linkedin.com/jobs/search/?keywords=software%20engineer&location=India&f_E=1%2C2",
        "type": "selenium"
    },
    # ADD THIS NEW ENTRY:
    {
        "name": "Naukri",
        "enabled": True,
        "url": "https://www.naukri.com/fresher-jobs",
        "type": "selenium"
    }
]
```

**Step 4:** Add scraping logic for Naukri

Find the `run()` method (around line 227) and add:

```python
def run(self):
    # ... existing code ...
    
    for source in SCRAPING_SOURCES:
        if not source.get('enabled', False):
            continue
        
        try:
            if source['name'] == 'LinkedIn':
                self.scrape_linkedin(source['url'])
            elif source['name'] == 'Naukri':  # ADD THIS
                self.scrape_naukri(source['url'])
            else:
                self.scrape_custom_site(source['url'], source['name'])
```

**Step 5:** Create the scraping method:

```python
def scrape_naukri(self, url):
    """Scrape jobs from Naukri.com"""
    print(f"Scraping Naukri: {url}")
    driver = self.setup_driver()
    
    try:
        driver.get(url)
        time.sleep(3)
        
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        
        # Naukri-specific selectors (inspect the website to get these)
        job_cards = soup.find_all('article', class_='jobTuple')
        
        for card in job_cards[:10]:
            try:
                title = card.find('a', class_='title').text.strip()
                company = card.find('a', class_='subTitle').text.strip()
                location = card.find('li', class_='location').text.strip()
                
                job = {
                    "id": self.job_id_counter,
                    "category": "off-campus",
                    "categoryLabel": "Off-Campus",
                    "title": title,
                    "company": company,
                    "badge": company[:2].upper(),
                    "location": location,
                    "eligibility": "Check job details",
                    "Last Date to Apply": "Apply ASAP",
                    "description": f"Opportunity at {company}. Visit link for details.",
                    "note": "Entry-level • Full-time",
                    "applyUrl": card.find('a', class_='title')['href'],
                    "active": True
                }
                
                self.jobs.append(job)
                self.job_id_counter += 1
                print(f"  ✓ Added: {job['title']} at {job['company']}")
                
            except Exception as e:
                print(f"  ✗ Error parsing job: {e}")
                continue
                
    except Exception as e:
        print(f"Error scraping Naukri: {e}")
    finally:
        driver.quit()
```

**Step 6:** Run the scraper:
```bash
python scraper.py
```

### Important Notes for Adding Websites:

1. **Inspect the website first:**
   - Right-click on a job listing → Inspect
   - Find the CSS classes/IDs for job cards
   - Update the selectors in your scraping method

2. **Respect robots.txt:**
   - Check `https://website.com/robots.txt`
   - Follow their scraping policies

3. **Use delays:**
   - Don't scrape too frequently
   - Add `time.sleep(2)` between requests

---

## Question 3: How to Add a Job Manually?

### Method 1: Edit jobs.json Directly (Recommended)

**Step 1:** Open `jobs.json` in your editor

**Step 2:** Add a new job entry at the end (before the closing `]`):

```json
{
  "id": 12,
  "category": "off-campus",
  "categoryLabel": "Off-Campus",
  "title": "Software Development Engineer",
  "company": "Amazon",
  "badge": "AM",
  "CTC": "₹15-20 LPA",
  "location": "Hyderabad",
  "Last Date to Apply": "20 June 2026 11:59 PM",
  "eligibility": "B.Tech/B.E in CS/IT (2024/2025/2026 batch)",
  "description": "Join Amazon as an SDE to work on cutting-edge technologies, building scalable systems that impact millions of customers worldwide.",
  "note": "Entry-level • Full-time",
  "applyUrl": "https://www.amazon.jobs/en/search",
  "active": true
}
```

**Step 3:** Save the file

**Step 4:** Refresh your browser (F5)

**Step 5:** Verify:
- The new job should appear in the list
- It should be sorted by deadline (20 June 2026)
- Check browser console for any errors

### Method 2: Edit HTML Embedded Data (Fallback Only)

**Only use this if jobs.json fails to load**

**Step 1:** Open `index.html`

**Step 2:** Find `const embeddedJobs = [` (around line 548)

**Step 3:** Add your job entry there

**Step 4:** Save and refresh

---

## Complete Testing Checklist

### ✅ Sorting Test
- [ ] Jobs with nearest deadlines appear first
- [ ] "Apply ASAP" jobs appear last
- [ ] Order changes when filter is applied

### ✅ Expiration Test
- [ ] Add a job with past date (e.g., "1 January 2026")
- [ ] Refresh page
- [ ] Verify expired job doesn't appear

### ✅ Dynamic Loading Test
- [ ] Browser console shows "Loaded X jobs from jobs.json"
- [ ] Jobs match those in jobs.json file
- [ ] Fallback works if jobs.json is renamed/deleted

### ✅ Manual Addition Test
- [ ] Add job to jobs.json
- [ ] Refresh browser
- [ ] New job appears in correct sorted position

### ✅ Scraper Test (Optional)
- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Run: `python scraper.py`
- [ ] Check console output for success/errors
- [ ] Verify jobs.json was updated

---

## Troubleshooting

### Jobs not loading from JSON
**Check:**
1. Browser console for errors (F12)
2. File path is correct (jobs.json in same directory as index.html)
3. JSON syntax is valid (use JSONLint.com)

### Scraper not working
**Check:**
1. Python dependencies installed: `pip list`
2. Chrome/Edge browser installed
3. Internet connection active
4. Website selectors haven't changed

### Jobs not sorting correctly
**Check:**
1. "Last Date to Apply" field format matches: "DD Month YYYY HH:MM AM/PM"
2. Browser console for JavaScript errors
3. Date is in future (not expired)

---

## Quick Commands Reference

```bash
# Install dependencies
pip install -r requirements.txt

# Run scraper
python scraper.py

# Open website
start index.html  # Windows
open index.html   # Mac
xdg-open index.html  # Linux

# Check Python version
python --version

# List installed packages
pip list