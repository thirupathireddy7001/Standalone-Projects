# Job Scraper Behavior Documentation

## Overview
The scraper has been updated to intelligently preserve jobs with active dates while replacing generic "Apply ASAP" jobs on each run. It now fetches at least 15 jobs per source and extracts detailed information including location, eligibility, descriptions, and more.

## How It Works

### Job Preservation Logic
The scraper now follows this strategy:

1. **Jobs with Specific Dates (PRESERVED)**
   - Any job with a specific deadline date (e.g., "10 June 2026 12:00 AM", "31 July 2026 11:59 PM")
   - These jobs are kept regardless of whether they were manually added or previously scraped
   - They remain in the file until their deadline passes (handled by the frontend)

2. **Jobs with Generic Dates (REPLACED)**
   - Jobs with patterns like:
     - "Apply ASAP"
     - "Rolling"
     - "Open now"
     - "Apply soon"
     - "Seats fill quickly"
   - These are removed and replaced with fresh scraped jobs on each run

### Example Behavior

**Before running scraper:**
```json
[
  {"title": "Job A", "Last Date to Apply": "15 June 2026"},  // Preserved
  {"title": "Job B", "Last Date to Apply": "Apply ASAP"},    // Replaced
  {"title": "Job C", "Last Date to Apply": "31 July 2026"}   // Preserved
]
```

**After running scraper:**
```json
[
  {"title": "Job A", "Last Date to Apply": "15 June 2026"},  // Still there
  {"title": "Job C", "Last Date to Apply": "31 July 2026"},  // Still there
  {"title": "New Job 1", "Last Date to Apply": "Apply ASAP"}, // Fresh
  {"title": "New Job 2", "Last Date to Apply": "Apply ASAP"}  // Fresh
]
```

## Benefits

1. **Manual Jobs Protected**: Jobs you manually add with specific dates won't be deleted
2. **Fresh Content**: Generic jobs are always up-to-date from the latest scrape
3. **Flexible**: Works whether jobs are added manually or through the script
4. **No Duplicates**: Old "Apply ASAP" jobs are removed before adding new ones

## Usage

Simply run the scraper as usual:
```bash
python "Job website/scraper_with_examples.py"
```

The scraper will automatically:
- Load existing jobs
- Identify which ones have active dates
- Preserve those jobs
- Replace generic date jobs with fresh scraped data
- Save the combined result

## Output Example
```
[SUCCESS] Saved 16 jobs to ../jobs.json
  - Jobs with active dates preserved: 6
  - New scraped jobs added: 10
  - Total jobs in file: 16