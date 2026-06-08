# Job Scraper Setup Guide

## Overview
This Python scraper automatically collects job listings from LinkedIn and other job websites, then updates the `jobs.json` file that your HTML portal reads from.

## Prerequisites

1. **Python 3.8 or higher** installed on your system
2. **Chrome or Edge browser** installed
3. **Internet connection** for scraping

## Installation Steps

### Step 1: Install Python Dependencies

Open a terminal/command prompt in the project directory and run:

```bash
pip install -r requirements.txt
```

This installs:
- `selenium` - For browser automation
- `beautifulsoup4` - For HTML parsing
- `requests` - For HTTP requests

### Step 2: Verify Installation

Check if Selenium is installed correctly:

```bash
python -c "import selenium; print(selenium.__version__)"
```

## Configuration

### Adding Job Sources

Edit `scraper.py` and modify the `SCRAPING_SOURCES` list:

```python
SCRAPING_SOURCES = [
    {
        "name": "LinkedIn",
        "enabled": True,
        "url": "https://www.linkedin.com/jobs/search/?keywords=software%20engineer&location=India&f_E=1%2C2",
        "type": "selenium"
    },
    {
        "name": "Naukri",
        "enabled": True,
        "url": "https://www.naukri.com/fresher-jobs",
        "type": "selenium"
    }
]
```

### Customizing Scraping Logic

For each new website, you need to:

1. Inspect the website's HTML structure
2. Find the CSS selectors for job listings
3. Update the `scrape_custom_site()` method with correct selectors

Example:
```python
# Find job cards (inspect the website to get correct selector)
job_listings = soup.find_all('div', class_='job-card')

# Extract job details
title = listing.find('h2', class_='job-title').text.strip()
company = listing.find('span', class_='company').text.strip()
```

## Usage

### Running the Scraper

```bash
python scraper.py
```

### What Happens:

1. **Loads existing jobs** from `jobs.json` (preserves manual entries)
2. **Scrapes enabled sources** (LinkedIn, etc.)
3. **Merges results**:
   - Keeps manual jobs with specific dates
   - Removes old scraped jobs (those with "Apply ASAP")
   - Adds newly scraped jobs
4. **Saves to jobs.json**

### Scheduling Automatic Runs

#### Windows (Task Scheduler):
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., Daily at 6 AM)
4. Action: Start a program
5. Program: `python`
6. Arguments: `C:\path\to\scraper.py`

#### Linux/Mac (Cron):
```bash
# Edit crontab
crontab -e

# Add line to run daily at 6 AM
0 6 * * * cd /path/to/project && python scraper.py
```

## Important Notes

### LinkedIn Scraping Limitations

⚠️ **LinkedIn has anti-scraping measures:**
- May block automated access
- Requires login for full access
- Rate limiting applies

**Recommended alternatives:**
1. Use LinkedIn's official API (requires approval)
2. Use RSS feeds if available
3. Manual curation for LinkedIn jobs

### Best Practices

1. **Be respectful**: Don't scrape too frequently (once per day is reasonable)
2. **Check robots.txt**: Respect website scraping policies
3. **Use delays**: The script includes `time.sleep()` to avoid hammering servers
4. **Monitor logs**: Check console output for errors
5. **Backup data**: Keep backups of `jobs.json`

### Legal Considerations

- Web scraping may violate terms of service
- Always check the website's terms and conditions
- Consider using official APIs when available
- For commercial use, consult legal advice

## Troubleshooting

### "selenium not found" error
```bash
pip install --upgrade selenium
```

### ChromeDriver issues
Selenium 4.6+ automatically manages ChromeDriver. If issues persist:
```bash
pip install --upgrade selenium
```

### No jobs scraped
1. Check if website structure changed (update selectors)
2. Verify internet connection
3. Check if website blocks automated access
4. Review console output for specific errors

### Jobs not appearing on website
1. Verify `jobs.json` was updated
2. Check browser console for JavaScript errors
3. Ensure HTML file is reading from correct path
4. Clear browser cache and reload

## Customization Examples

### Adding Naukri.com

```python
def scrape_naukri(self, url):
    driver = self.setup_driver()
    driver.get(url)
    time.sleep(3)
    
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    jobs = soup.find_all('article', class_='jobTuple')
    
    for job in jobs[:10]:
        title = job.find('a', class_='title').text.strip()
        company = job.find('a', class_='subTitle').text.strip()
        # ... extract other fields
```

### Adding Indeed.com

```python
def scrape_indeed(self, url):
    driver = self.setup_driver()
    driver.get(url)
    time.sleep(3)
    
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    jobs = soup.find_all('div', class_='job_seen_beacon')
    
    for job in jobs[:10]:
        title = job.find('h2', class_='jobTitle').text.strip()
        company = job.find('span', class_='companyName').text.strip()
        # ... extract other fields
```

## Support

For issues or questions:
1. Check the console output for error messages
2. Verify website selectors haven't changed
3. Review the script's comments for guidance
4. Test with a single source first before enabling multiple

## Future Enhancements

Potential improvements:
- Add proxy support for better scraping
- Implement job deduplication
- Add email notifications for new jobs
- Create a web dashboard for monitoring
- Support for more job websites
- Better error handling and retry logic