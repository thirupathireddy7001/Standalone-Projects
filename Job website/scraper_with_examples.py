"""
Job Scraper for 7001 Creations Job Portal - WITH EXAMPLE WEBSITES
==========================================
This version includes examples for Naukri and Indeed scraping.

Requirements:
- pip install selenium beautifulsoup4 requests
- Chrome/Edge browser installed

Usage:
    python scraper_with_examples.py
"""

import json
import time
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup

# Configuration
JOBS_FILE = "../jobs.json"  # Parent directory where index.html is located

# ANSWER TO QUESTION 2: How to add another website
# Simply add a new entry to this list with the website details
# LinkedIn URL parameters reference:
#   keywords  — job title search term (use %20 for spaces)
#   location  — country or city
#   f_E       — experience level: 1=Internship, 2=Entry level, 3=Associate
#   f_TPR     — date posted: r86400=past 24h, r604800=past week, r2592000=past month
#
# Add or remove entries from LINKEDIN_SEARCH_URLS to control what gets scraped.
# Each entry is scraped separately so you can target different fresher/trainee roles.
LINKEDIN_SEARCH_URLS = [
    {
        "label": "Fresher / Entry-level Software Engineer",
        "url": "https://www.linkedin.com/jobs/search/?keywords=fresher%20software%20engineer&location=India&f_E=2",
    },
    {
        "label": "Graduate Engineer Trainee",
        "url": "https://www.linkedin.com/jobs/search/?keywords=graduate%20engineer%20trainee&location=India&f_E=1%2C2",
    },
    {
        "label": "Trainee / Junior Developer",
        "url": "https://www.linkedin.com/jobs/search/?keywords=trainee%20developer&location=India&f_E=1%2C2",
    },
    {
        "label": "Graduate Apprentice (NATS)",
        "url": "https://www.linkedin.com/jobs/search/?keywords=graduate%20apprentice%20trainee&location=India&f_E=1%2C2",
    },
    {
        "label": "Entry-level IT / Tech roles",
        "url": "https://www.linkedin.com/jobs/search/?keywords=entry%20level%20software%20engineer&location=India&f_E=2",
    },
]

SCRAPING_SOURCES = [
    {
        "name": "LinkedIn",
        "enabled": True,
        # urls: list of LINKEDIN_SEARCH_URLS defined above
        "urls": LINKEDIN_SEARCH_URLS,
        "type": "selenium"
    },
    {
        "name": "Naukri",
        "enabled": True,
        "url": "https://www.naukri.com/fresher-jobs",
        "type": "selenium"
    }
]

class JobScraper:
    def __init__(self):
        self.jobs = []
        self.job_id_counter = 1
        # Load existing jobs and initialize ID counter BEFORE scraping
        self._existing_jobs = self.load_existing_jobs()

    def setup_driver(self):
        """Setup Selenium WebDriver with Chrome"""
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        
        driver = webdriver.Chrome(options=chrome_options)
        return driver

    def _is_duplicate(self, title, company):
        """
        Check if a job with the same title+company already exists in either
        the preserved existing jobs or the newly scraped jobs from this run.
        """
        key = (title.strip().lower(), company.strip().lower())
        for job in self._existing_jobs:
            if (job.get('title', '').strip().lower(), job.get('company', '').strip().lower()) == key:
                return True
        for job in self.jobs:
            if (job.get('title', '').strip().lower(), job.get('company', '').strip().lower()) == key:
                return True
        return False

    def scrape_naukri(self, url):
        """
        Scrape fresher jobs from Naukri.com.
        Uses current Naukri HTML selectors (updated 2024+).
        """
        print(f"Scraping Naukri: {url}")
        driver = self.setup_driver()

        try:
            driver.get(url)
            time.sleep(4)  # Naukri loads slower than LinkedIn

            soup = BeautifulSoup(driver.page_source, 'html.parser')

            # Current Naukri job card selectors (2024+ layout)
            # Each job card is a <div class="srp-jobtuple-wrapper"> containing a <div class="row1">
            job_cards = soup.find_all('div', class_='srp-jobtuple-wrapper')

            # Fallback: older layout used article.jobTuple
            if not job_cards:
                job_cards = soup.find_all('article', class_='jobTuple')

            print(f"Found {len(job_cards)} job cards on Naukri")

            for card in job_cards[:15]:
                try:
                    # Current selectors
                    title_elem = (
                        card.find('a', class_='title') or           # old layout
                        card.find('a', attrs={'title': True}) or    # new layout — <a title="Job Title">
                        card.find('a', class_='naukri-job-title')
                    )
                    company_elem = (
                        card.find('a', class_='subTitle') or        # old layout
                        card.find('a', class_='comp-name') or       # new layout
                        card.find('span', class_='comp-name')
                    )
                    location_elem = (
                        card.find('li', class_='location') or       # old layout
                        card.find('span', class_='locWdth') or      # new layout
                        card.find('li', class_='fleft grey-text br2 placeHolderLi location')
                    )
                    experience_elem = (
                        card.find('li', class_='experience') or     # old layout
                        card.find('span', class_='expwdth') or      # new layout
                        card.find('li', class_='fleft grey-text br2 placeHolderLi experience')
                    )
                    desc_elem = (
                        card.find('div', class_='job-description') or
                        card.find('div', class_='job-desc') or
                        card.find('span', class_='job-desc')
                    )

                    if not (title_elem and company_elem):
                        continue

                    title_text   = title_elem.get_text(strip=True) or title_elem.get('title', '').strip()
                    company_text = company_elem.get_text(strip=True)

                    if not title_text or not company_text:
                        continue

                    if self._is_duplicate(title_text, company_text):
                        print(f"  [=] Skipped duplicate: {title_text} at {company_text}")
                        continue

                    # Extract per-job URL
                    job_url = title_elem.get('href') or url
                    if job_url and not job_url.startswith('http'):
                        job_url = 'https://www.naukri.com' + job_url

                    location    = location_elem.get_text(strip=True) if location_elem else "India"
                    eligibility = experience_elem.get_text(strip=True) if experience_elem else "Check job details"
                    description = desc_elem.get_text(strip=True) if desc_elem else f"Opportunity at {company_text}."
                    if len(description) > 200:
                        description = description[:197] + "..."

                    job = {
                        "id": self.job_id_counter,
                        "category": "off-campus",
                        "categoryLabel": "Off-Campus",
                        "title": title_text,
                        "company": company_text,
                        "badge": company_text[:2].upper(),
                        "location": location,
                        "eligibility": eligibility,
                        "Last Date to Apply": "Apply ASAP",
                        "description": description,
                        "note": "Entry-level • Full-time",
                        "applyUrl": job_url,
                        "active": True
                    }

                    self.jobs.append(job)
                    self.job_id_counter += 1
                    print(f"  [+] Added: {job['title']} at {job['company']}")

                except Exception as e:
                    print(f"  [!] Error: {e}")
                    continue

        except Exception as e:
            print(f"Error scraping Naukri: {e}")
        finally:
            driver.quit()

    def scrape_indeed(self, url):
        """
        EXAMPLE: Scrape jobs from Indeed India
        """
        print(f"Scraping Indeed: {url}")
        driver = self.setup_driver()
        
        try:
            driver.get(url)
            time.sleep(5)
            
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            job_cards = soup.find_all('div', class_='job_seen_beacon')
            
            print(f"Found {len(job_cards)} job cards on Indeed")
            
            if len(job_cards) > 0:
                print("\n--- DEBUG: First job card structure ---")
                first_card = job_cards[0]
                print(f"Card classes: {first_card.get('class')}")
                title_options = [
                    first_card.find('h2', class_='jobTitle'),
                    first_card.find('a', class_='jcs-JobTitle'),
                    first_card.find('span', attrs={'title': True})
                ]
                print(f"Title elements found: {[bool(t) for t in title_options]}")
                company_options = [
                    first_card.find('span', class_='companyName'),
                    first_card.find('span', {'data-testid': 'company-name'}),
                    first_card.find('span', class_='css-63koeb')
                ]
                print(f"Company elements found: {[bool(c) for c in company_options]}")
                print("--- END DEBUG ---\n")
            
            for card in job_cards[:15]:
                try:
                    title_elem = (card.find('h2', class_='jobTitle') or
                                 card.find('a', class_='jcs-JobTitle') or
                                 card.find('span', attrs={'title': True}))
                    
                    company_elem = (card.find('span', class_='companyName') or
                                   card.find('span', {'data-testid': 'company-name'}) or
                                   card.find('span', class_='css-63koeb'))
                    
                    location_elem = (card.find('div', class_='companyLocation') or
                                    card.find('div', {'data-testid': 'text-location'}))
                    
                    snippet_elem = (card.find('div', class_='job-snippet') or
                                   card.find('div', {'data-testid': 'job-snippet'}) or
                                   card.find('div', class_='jobCardShelfContainer'))
                    
                    salary_elem = (card.find('div', class_='salary-snippet') or
                                  card.find('span', class_='salary-snippet-container'))

                    # Extract the individual job link from the card anchor
                    link_elem = (card.find('a', class_='jcs-JobTitle') or
                                 card.find('a', id=lambda x: x and x.startswith('job_')))
                    job_url = link_elem.get('href') if link_elem else None
                    if job_url and job_url.startswith('/'):
                        job_url = 'https://in.indeed.com' + job_url
                    if not job_url:
                        job_url = url  # fallback only if no per-job link found

                    # Get title text
                    if title_elem:
                        title_text = title_elem.get_text(strip=True)
                        if not title_text and title_elem.find('span'):
                            title_text = title_elem.find('span').get_text(strip=True)
                    else:
                        title_text = None
                    
                    company_text = company_elem.get_text(strip=True) if company_elem else None
                    location_text = location_elem.get_text(strip=True) if location_elem else "India"
                    description = snippet_elem.get_text(strip=True) if snippet_elem else f"Opportunity at {company_text}."
                    if len(description) > 200:
                        description = description[:197] + "..."
                    salary_text = salary_elem.get_text(strip=True) if salary_elem else None
                    
                    if not (title_text and company_text):
                        print(f"  [!] Skipped: Missing title or company (title={bool(title_text)}, company={bool(company_text)})")
                        continue

                    if self._is_duplicate(title_text, company_text):
                        print(f"  [=] Skipped duplicate: {title_text} at {company_text}")
                        continue

                    job = {
                        "id": self.job_id_counter,
                        "category": "off-campus",
                        "categoryLabel": "Off-Campus",
                        "title": title_text,
                        "company": company_text,
                        "badge": company_text[:2].upper(),
                        "location": location_text,
                        "eligibility": "Check job details",
                        "Last Date to Apply": "Apply ASAP",
                        "description": description,
                        "note": "Entry-level • Full-time",
                        "applyUrl": job_url,
                        "active": True
                    }
                    
                    if salary_text:
                        job["CTC"] = salary_text
                    
                    self.jobs.append(job)
                    self.job_id_counter += 1
                    print(f"  [+] Added: {job['title']} at {job['company']}")
                        
                except Exception as e:
                    print(f"  [!] Error extracting job: {e}")
                    continue
                    
        except Exception as e:
            print(f"Error scraping Indeed: {e}")
        finally:
            driver.quit()

    def load_existing_jobs(self):
        """Load existing jobs from jobs.json and set the ID counter."""
        try:
            with open(JOBS_FILE, 'r', encoding='utf-8') as f:
                existing_jobs = json.load(f)
                print(f"Loaded {len(existing_jobs)} existing jobs")
                
                if existing_jobs:
                    max_id = max(job.get('id', 0) for job in existing_jobs)
                    self.job_id_counter = max_id + 1
                
                return existing_jobs
        except FileNotFoundError:
            print("No existing jobs.json found")
            return []
        except Exception as e:
            print(f"Error loading jobs: {e}")
            return []

    def save_jobs(self):
        """
        Save scraped jobs to jobs.json.

        Strategy:
        - Keep ALL jobs (manual or scraped) that have specific dates (active deadlines).
        - Replace ONLY jobs with generic dates like "Apply ASAP", "Rolling", "Open now".
        - Deduplicate new scraped jobs against each other and existing jobs by title+company.
        """
        # Define generic date patterns that indicate auto-scraped jobs
        generic_date_patterns = [
            'apply asap',
            'rolling',
            'open now',
            'apply soon',
            'seats fill quickly'
        ]
        
        # Keep jobs with specific dates (manually curated / real deadlines)
        jobs_with_dates = [
            job for job in self._existing_jobs
            if not any(pattern in job.get('Last Date to Apply', '').lower()
                      for pattern in generic_date_patterns)
        ]
        
        # Combine: preserved jobs + newly scraped jobs (already deduplicated via _is_duplicate)
        all_jobs = jobs_with_dates + self.jobs
        
        try:
            with open(JOBS_FILE, 'w', encoding='utf-8') as f:
                json.dump(all_jobs, f, indent=2, ensure_ascii=False)
            print(f"\n[SUCCESS] Saved {len(all_jobs)} jobs to {JOBS_FILE}")
            print(f"  - Jobs with active dates preserved: {len(jobs_with_dates)}")
            print(f"  - New scraped jobs added: {len(self.jobs)}")
            print(f"  - Total jobs in file: {len(all_jobs)}")
        except Exception as e:
            print(f"Error saving jobs: {e}")

    def _scrape_linkedin_url(self, driver, search_url, label):
        """
        Scrape a single LinkedIn search URL using an already-open driver.
        Returns number of jobs added from this URL.
        """
        print(f"\n  Searching: {label}")
        print(f"  URL: {search_url}")

        driver.get(search_url)
        time.sleep(5)  # wait for LinkedIn JS to render cards

        soup = BeautifulSoup(driver.page_source, 'html.parser')
        job_cards = soup.find_all('div', class_='base-card')
        print(f"  Found {len(job_cards)} cards — processing up to 15")

        added = 0
        for card in job_cards[:15]:
            try:
                title_elem   = card.find('h3', class_='base-search-card__title')
                company_elem = card.find('h4', class_='base-search-card__subtitle')
                location_elem = card.find('span', class_='job-search-card__location')
                desc_elem    = card.find('p', class_='base-search-card__snippet')
                time_elem    = card.find('time', class_='job-search-card__listdate')

                # Per-job direct link
                link_elem = card.find('a', class_='base-card__full-link')
                job_url = link_elem.get('href') if link_elem else search_url

                if not (title_elem and company_elem):
                    continue

                title_text   = title_elem.get_text(strip=True)
                company_text = company_elem.get_text(strip=True)

                if self._is_duplicate(title_text, company_text):
                    print(f"    [=] Duplicate skipped: {title_text} @ {company_text}")
                    continue

                description = desc_elem.get_text(strip=True) if desc_elem else f"Opportunity at {company_text}."
                if len(description) > 200:
                    description = description[:197] + "..."

                posted_time = time_elem.get('datetime') if time_elem else None

                job = {
                    "id": self.job_id_counter,
                    "category": "off-campus",
                    "categoryLabel": "Off-Campus",
                    "title": title_text,
                    "company": company_text,
                    "badge": company_text[:2].upper(),
                    "location": location_elem.get_text(strip=True) if location_elem else "India",
                    "eligibility": "Check job details",
                    "Last Date to Apply": "Apply ASAP",
                    "description": description,
                    "note": "Entry-level • Full-time",
                    "applyUrl": job_url,
                    "active": True
                }

                if posted_time:
                    job["Posted"] = posted_time

                self.jobs.append(job)
                self.job_id_counter += 1
                added += 1
                print(f"    [+] {title_text} @ {company_text}")

            except Exception as e:
                print(f"    [!] Error: {e}")
                continue

        return added

    def scrape_linkedin(self, search_entries):
        """
        Scrape multiple LinkedIn search URLs in a single browser session.
        search_entries: list of dicts with 'label' and 'url' keys.
        """
        print(f"\nLinkedIn — scraping {len(search_entries)} search(es)")
        driver = self.setup_driver()
        total_added = 0

        try:
            for entry in search_entries:
                try:
                    count = self._scrape_linkedin_url(driver, entry['url'], entry['label'])
                    total_added += count
                    time.sleep(3)  # polite delay between searches
                except Exception as e:
                    print(f"  [!] Error on '{entry['label']}': {e}")
                    continue
        finally:
            driver.quit()

        print(f"\nLinkedIn total added: {total_added} jobs")

    def run(self):
        """Main scraping workflow"""
        print("=" * 60)
        print("7001 Creations Job Scraper")
        print("=" * 60)
        print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        
        for source in SCRAPING_SOURCES:
            if not source.get('enabled', False):
                print(f"Skipping {source['name']} (disabled)")
                continue
            
            try:
                if source['name'] == 'LinkedIn':
                    self.scrape_linkedin(source['urls'])
                elif source['name'] == 'Naukri':
                    self.scrape_naukri(source['url'])
                elif source['name'] == 'Indeed':
                    self.scrape_indeed(source['url'])
                
                time.sleep(2)
                
            except Exception as e:
                print(f"Error with {source['name']}: {e}")
                continue
        
        self.save_jobs()
        
        print(f"\n[COMPLETE] Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)

if __name__ == "__main__":
    scraper = JobScraper()
    scraper.run()

# Made with Bob
