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
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup

# Configuration
JOBS_FILE = "../jobs.json"  # Parent directory where index.html is located

# ANSWER TO QUESTION 2: How to add another website
# Simply add a new entry to this list with the website details
SCRAPING_SOURCES = [
    {
        "name": "LinkedIn",
        "enabled": True,  # Now enabled
        "url": "https://www.linkedin.com/jobs/search/?keywords=software%20engineer&location=India&f_E=1%2C2",
        "type": "selenium"
    },
    {
        "name": "Naukri",  # EXAMPLE: Naukri.com added
        "enabled": True,
        "url": "https://www.naukri.com/fresher-jobs",
        "type": "selenium"
    },
    {
        "name": "Indeed",  # EXAMPLE: Indeed.com added
        "enabled": True,
        "url": "https://in.indeed.com/jobs?q=software+engineer&l=India&explvl=entry_level",
        "type": "selenium"
    }
]

class JobScraper:
    def __init__(self):
        self.jobs = []
        self.job_id_counter = 1
        
    def setup_driver(self):
        """Setup Selenium WebDriver with Chrome"""
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        
        driver = webdriver.Chrome(options=chrome_options)
        return driver
    
    def scrape_naukri(self, url):
        """
        EXAMPLE: Scrape jobs from Naukri.com
        """
        print(f"Scraping Naukri: {url}")
        driver = self.setup_driver()
        
        try:
            driver.get(url)
            time.sleep(3)
            
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            job_cards = soup.find_all('article', class_='jobTuple')
            
            print(f"Found {len(job_cards)} job cards on Naukri")
            
            for card in job_cards[:5]:  # Limit to 5 jobs for demo
                try:
                    title_elem = card.find('a', class_='title')
                    company_elem = card.find('a', class_='subTitle')
                    
                    if title_elem and company_elem:
                        job = {
                            "id": self.job_id_counter,
                            "category": "off-campus",
                            "categoryLabel": "Off-Campus",
                            "title": title_elem.text.strip(),
                            "company": company_elem.text.strip(),
                            "badge": company_elem.text.strip()[:2].upper(),
                            "location": "India",
                            "eligibility": "Check job details",
                            "Last Date to Apply": "Apply ASAP",
                            "description": f"Opportunity at {company_elem.text.strip()}.",
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
            time.sleep(5)  # Increased wait time
            
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            job_cards = soup.find_all('div', class_='job_seen_beacon')
            
            print(f"Found {len(job_cards)} job cards on Indeed")
            
            # Debug: Print first card's HTML structure if no jobs extracted
            if len(job_cards) > 0:
                print("\n--- DEBUG: First job card structure ---")
                first_card = job_cards[0]
                print(f"Card classes: {first_card.get('class')}")
                
                # Check for title elements
                title_options = [
                    first_card.find('h2', class_='jobTitle'),
                    first_card.find('a', class_='jcs-JobTitle'),
                    first_card.find('span', attrs={'title': True})
                ]
                print(f"Title elements found: {[bool(t) for t in title_options]}")
                
                # Check for company elements
                company_options = [
                    first_card.find('span', class_='companyName'),
                    first_card.find('span', {'data-testid': 'company-name'}),
                    first_card.find('span', class_='css-63koeb')
                ]
                print(f"Company elements found: {[bool(c) for c in company_options]}")
                print("--- END DEBUG ---\n")
            
            for card in job_cards[:5]:  # Limit to 5 jobs for demo
                try:
                    # Try multiple selector patterns for title
                    title_elem = (card.find('h2', class_='jobTitle') or
                                 card.find('a', class_='jcs-JobTitle') or
                                 card.find('span', attrs={'title': True}))
                    
                    # Try multiple selector patterns for company
                    company_elem = (card.find('span', class_='companyName') or
                                   card.find('span', {'data-testid': 'company-name'}) or
                                   card.find('span', class_='css-63koeb'))
                    
                    # Extract location if available
                    location_elem = (card.find('div', class_='companyLocation') or
                                    card.find('div', {'data-testid': 'text-location'}))
                    
                    # Get title text
                    if title_elem:
                        # Handle both direct text and nested spans
                        title_text = title_elem.get_text(strip=True)
                        if not title_text and title_elem.find('span'):
                            title_text = title_elem.find('span').get_text(strip=True)
                    else:
                        title_text = None
                    
                    # Get company text
                    company_text = company_elem.get_text(strip=True) if company_elem else None
                    
                    # Get location text
                    location_text = location_elem.get_text(strip=True) if location_elem else "India"
                    
                    if title_text and company_text:
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
                            "description": f"Opportunity at {company_text}.",
                            "note": "Entry-level • Full-time",
                            "applyUrl": url,
                            "active": True
                        }
                        
                        self.jobs.append(job)
                        self.job_id_counter += 1
                        print(f"  ✓ Added: {job['title']} at {job['company']}")
                    else:
                        print(f"  ✗ Skipped: Missing title or company (title={bool(title_text)}, company={bool(company_text)})")
                        
                except Exception as e:
                    print(f"  ✗ Error extracting job: {e}")
                    continue
                    
        except Exception as e:
            print(f"Error scraping Indeed: {e}")
        finally:
            driver.quit()
    
    def load_existing_jobs(self):
        """Load existing jobs from jobs.json"""
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
        """Save scraped jobs to jobs.json"""
        existing_jobs = self.load_existing_jobs()
        
        # Keep manual jobs (those with specific dates)
        manual_jobs = [job for job in existing_jobs 
                      if job.get('Last Date to Apply', '').lower() not in ['apply asap', 'rolling – apply asap', 'open now']]
        
        all_jobs = manual_jobs + self.jobs
        
        try:
            with open(JOBS_FILE, 'w', encoding='utf-8') as f:
                json.dump(all_jobs, f, indent=2, ensure_ascii=False)
            print(f"\n✓ Saved {len(all_jobs)} jobs to {JOBS_FILE}")
            print(f"  - Manual jobs preserved: {len(manual_jobs)}")
            print(f"  - New scraped jobs: {len(self.jobs)}")
        except Exception as e:
            print(f"Error saving jobs: {e}")
    
    def scrape_linkedin(self, url):
        """
        Scrape jobs from LinkedIn
        Note: LinkedIn requires login, so this is a basic implementation
        """
        print(f"Scraping LinkedIn: {url}")
        driver = self.setup_driver()
        
        try:
            driver.get(url)
            time.sleep(5)  # Wait for page load
            
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            job_cards = soup.find_all('div', class_='base-card')
            
            print(f"Found {len(job_cards)} job cards on LinkedIn")
            
            for card in job_cards[:5]:  # Limit to 5 jobs
                try:
                    title_elem = card.find('h3', class_='base-search-card__title')
                    company_elem = card.find('h4', class_='base-search-card__subtitle')
                    location_elem = card.find('span', class_='job-search-card__location')
                    
                    if title_elem and company_elem:
                        job = {
                            "id": self.job_id_counter,
                            "category": "off-campus",
                            "categoryLabel": "Off-Campus",
                            "title": title_elem.get_text(strip=True),
                            "company": company_elem.get_text(strip=True),
                            "badge": company_elem.get_text(strip=True)[:2].upper(),
                            "location": location_elem.get_text(strip=True) if location_elem else "India",
                            "eligibility": "Check job details",
                            "Last Date to Apply": "Apply ASAP",
                            "description": f"Opportunity at {company_elem.get_text(strip=True)}.",
                            "note": "Entry-level • Full-time",
                            "applyUrl": url,
                            "active": True
                        }
                        
                        self.jobs.append(job)
                        self.job_id_counter += 1
                        print(f"  ✓ Added: {job['title']} at {job['company']}")
                        
                except Exception as e:
                    print(f"  ✗ Error extracting job: {e}")
                    continue
                    
        except Exception as e:
            print(f"Error scraping LinkedIn: {e}")
        finally:
            driver.quit()
    
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
                    self.scrape_linkedin(source['url'])
                elif source['name'] == 'Naukri':
                    self.scrape_naukri(source['url'])
                elif source['name'] == 'Indeed':
                    self.scrape_indeed(source['url'])
                
                time.sleep(2)
                
            except Exception as e:
                print(f"Error with {source['name']}: {e}")
                continue
        
        self.save_jobs()
        
        print(f"\n✓ Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)

if __name__ == "__main__":
    scraper = JobScraper()
    scraper.run()

# Made with Bob
