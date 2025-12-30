"""
Financial Ombudsman Service (FOS) Decision Scraper

Scrapes all published ombudsman decisions from:
https://www.financial-ombudsman.org.uk/decisions-case-studies/ombudsman-decisions

These decisions are public records published since April 2013.
We use them to train our AI on successful complaint patterns.
"""

import asyncio
import aiohttp
import json
import os
import time
from datetime import datetime
from dataclasses import dataclass, asdict
from typing import Optional, List
import re
from bs4 import BeautifulSoup
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class FOSDecision:
    """Represents a single FOS ombudsman decision"""
    reference: str
    date: str
    product_category: str
    product_type: str
    outcome: str  # 'upheld', 'not upheld', 'partially upheld'
    summary: str
    full_text: str
    url: str
    business_name: Optional[str] = None
    complaint_type: Optional[str] = None
    compensation_amount: Optional[float] = None
    scraped_at: str = None
    
    def __post_init__(self):
        if self.scraped_at is None:
            self.scraped_at = datetime.utcnow().isoformat()


class FOSScraper:
    """
    Scraper for Financial Ombudsman Service decisions.
    
    The FOS publishes all final ombudsman decisions in a searchable database.
    This scraper extracts:
    - Decision reference numbers
    - Product categories (credit cards, motor finance, etc.)
    - Outcomes (upheld/not upheld)
    - Full decision text
    - Key reasoning
    """
    
    BASE_URL = "https://www.financial-ombudsman.org.uk"
    SEARCH_URL = f"{BASE_URL}/decisions-case-studies/ombudsman-decisions"
    
    # Product categories we care about
    TARGET_CATEGORIES = [
        "credit-cards",
        "hire-purchase",
        "conditional-sale",
        "guarantor-loans",
        "logbook-loans", 
        "payday-loans",
        "personal-loans",
        "pawnbroking",
        "credit-broking",
        "debt-collection",
        "debt-counselling",
        "store-cards"
    ]
    
    def __init__(self, output_dir: str = "data"):
        self.output_dir = output_dir
        self.session = None
        self.decisions = []
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        os.makedirs(f"{output_dir}/raw", exist_ok=True)
        os.makedirs(f"{output_dir}/processed", exist_ok=True)
        
    async def create_session(self):
        """Create aiohttp session with appropriate headers"""
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-GB,en;q=0.5",
        }
        timeout = aiohttp.ClientTimeout(total=30)
        self.session = aiohttp.ClientSession(headers=headers, timeout=timeout)
        
    async def close_session(self):
        """Close the aiohttp session"""
        if self.session:
            await self.session.close()
    
    async def fetch_page(self, url: str, retries: int = 3) -> Optional[str]:
        """Fetch a page with retry logic"""
        for attempt in range(retries):
            try:
                async with self.session.get(url) as response:
                    if response.status == 200:
                        return await response.text()
                    elif response.status == 429:  # Rate limited
                        wait_time = 60 * (attempt + 1)
                        logger.warning(f"Rate limited, waiting {wait_time}s...")
                        await asyncio.sleep(wait_time)
                    else:
                        logger.error(f"HTTP {response.status} for {url}")
            except Exception as e:
                logger.error(f"Error fetching {url}: {e}")
                await asyncio.sleep(5 * (attempt + 1))
        return None
    
    async def get_search_results_page(self, category: str, page: int = 1) -> List[str]:
        """
        Get decision URLs from a search results page.
        
        The FOS search allows filtering by product category and pagination.
        """
        # Build search URL with filters
        # The FOS uses query parameters for filtering
        search_url = f"{self.SEARCH_URL}?product={category}&page={page}"
        
        logger.info(f"Fetching search results: {category}, page {page}")
        
        html = await self.fetch_page(search_url)
        if not html:
            return []
        
        soup = BeautifulSoup(html, 'html.parser')
        
        # Find all decision links
        # FOS decision links follow pattern: /decisions-case-studies/ombudsman-decisions/DRN-XXXXXXX
        decision_links = []
        for link in soup.find_all('a', href=True):
            href = link['href']
            if '/ombudsman-decisions/DRN' in href or re.match(r'.*DRN-?\d+.*', href):
                full_url = href if href.startswith('http') else f"{self.BASE_URL}{href}"
                if full_url not in decision_links:
                    decision_links.append(full_url)
        
        return decision_links
    
    async def scrape_decision(self, url: str) -> Optional[FOSDecision]:
        """
        Scrape a single FOS decision page.
        
        Each decision page contains:
        - Reference number (DRN-XXXXXXX)
        - Date
        - Product category
        - Outcome
        - Full decision text with reasoning
        """
        html = await self.fetch_page(url)
        if not html:
            return None
        
        soup = BeautifulSoup(html, 'html.parser')
        
        try:
            # Extract reference number from URL or page
            reference_match = re.search(r'DRN-?(\d+)', url)
            reference = f"DRN-{reference_match.group(1)}" if reference_match else None
            
            if not reference:
                # Try to find in page content
                ref_elem = soup.find(string=re.compile(r'DRN-?\d+'))
                if ref_elem:
                    ref_match = re.search(r'DRN-?(\d+)', str(ref_elem))
                    reference = f"DRN-{ref_match.group(1)}" if ref_match else "UNKNOWN"
            
            # Extract date
            date_elem = soup.find('time') or soup.find(class_=re.compile('date', re.I))
            date = date_elem.get_text(strip=True) if date_elem else None
            
            # Extract product category
            product_elem = soup.find(string=re.compile(r'Product:', re.I))
            product_category = ""
            product_type = ""
            if product_elem:
                product_text = product_elem.find_next(string=True)
                if product_text:
                    product_category = product_text.strip()
            
            # Look for product in metadata or breadcrumbs
            breadcrumbs = soup.find(class_=re.compile('breadcrumb', re.I))
            if breadcrumbs:
                crumb_text = breadcrumbs.get_text()
                for cat in self.TARGET_CATEGORIES:
                    if cat.replace('-', ' ') in crumb_text.lower():
                        product_type = cat
                        break
            
            # Extract outcome
            outcome = "unknown"
            outcome_patterns = [
                (r'upheld', 'upheld'),
                (r'not upheld', 'not upheld'),
                (r'partially upheld', 'partially upheld'),
                (r'complaint is upheld', 'upheld'),
                (r'complaint is not upheld', 'not upheld'),
                (r'uphold this complaint', 'upheld'),
                (r'do not uphold', 'not upheld'),
            ]
            
            page_text = soup.get_text().lower()
            for pattern, result in outcome_patterns:
                if re.search(pattern, page_text):
                    outcome = result
                    break
            
            # Extract summary (usually in first paragraph or summary section)
            summary = ""
            summary_elem = soup.find(class_=re.compile('summary', re.I)) or soup.find('article')
            if summary_elem:
                first_para = summary_elem.find('p')
                if first_para:
                    summary = first_para.get_text(strip=True)[:500]
            
            # Extract full decision text
            main_content = soup.find('main') or soup.find('article') or soup.find(class_=re.compile('content', re.I))
            full_text = ""
            if main_content:
                # Remove script and style elements
                for element in main_content.find_all(['script', 'style', 'nav', 'header', 'footer']):
                    element.decompose()
                full_text = main_content.get_text(separator='\n', strip=True)
            
            # Try to extract compensation amount if mentioned
            compensation = None
            comp_match = re.search(r'£([\d,]+(?:\.\d{2})?)', full_text)
            if comp_match:
                try:
                    compensation = float(comp_match.group(1).replace(',', ''))
                except ValueError:
                    pass
            
            return FOSDecision(
                reference=reference,
                date=date,
                product_category=product_category,
                product_type=product_type,
                outcome=outcome,
                summary=summary,
                full_text=full_text,
                url=url,
                compensation_amount=compensation
            )
            
        except Exception as e:
            logger.error(f"Error parsing decision {url}: {e}")
            return None
    
    async def scrape_category(self, category: str, max_pages: int = 100):
        """Scrape all decisions for a product category"""
        logger.info(f"Starting scrape for category: {category}")
        
        page = 1
        category_decisions = []
        consecutive_empty = 0
        
        while page <= max_pages and consecutive_empty < 3:
            decision_urls = await self.get_search_results_page(category, page)
            
            if not decision_urls:
                consecutive_empty += 1
                page += 1
                continue
            
            consecutive_empty = 0
            logger.info(f"Found {len(decision_urls)} decisions on page {page}")
            
            # Scrape each decision with rate limiting
            for url in decision_urls:
                decision = await self.scrape_decision(url)
                if decision:
                    category_decisions.append(decision)
                    logger.info(f"Scraped: {decision.reference} - {decision.outcome}")
                
                # Rate limiting - be respectful
                await asyncio.sleep(1)
            
            # Save progress after each page
            self._save_progress(category, category_decisions)
            
            page += 1
            await asyncio.sleep(2)  # Pause between pages
        
        return category_decisions
    
    def _save_progress(self, category: str, decisions: List[FOSDecision]):
        """Save scraped decisions to JSON file"""
        filename = f"{self.output_dir}/raw/{category}_decisions.json"
        data = [asdict(d) for d in decisions]
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Saved {len(decisions)} decisions to {filename}")
    
    async def run_full_scrape(self):
        """Run full scrape across all target categories"""
        await self.create_session()
        
        try:
            all_decisions = []
            
            for category in self.TARGET_CATEGORIES:
                decisions = await self.scrape_category(category)
                all_decisions.extend(decisions)
                
                # Longer pause between categories
                await asyncio.sleep(5)
            
            # Save combined results
            self._save_combined_results(all_decisions)
            
            logger.info(f"Scraping complete. Total decisions: {len(all_decisions)}")
            return all_decisions
            
        finally:
            await self.close_session()
    
    def _save_combined_results(self, decisions: List[FOSDecision]):
        """Save all decisions to a combined file"""
        filename = f"{self.output_dir}/processed/all_decisions.json"
        data = [asdict(d) for d in decisions]
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        # Also save summary statistics
        stats = {
            "total_decisions": len(decisions),
            "by_category": {},
            "by_outcome": {},
            "scraped_at": datetime.utcnow().isoformat()
        }
        
        for d in decisions:
            cat = d.product_category or "unknown"
            stats["by_category"][cat] = stats["by_category"].get(cat, 0) + 1
            stats["by_outcome"][d.outcome] = stats["by_outcome"].get(d.outcome, 0) + 1
        
        with open(f"{self.output_dir}/processed/scrape_stats.json", 'w') as f:
            json.dump(stats, f, indent=2)


class FOSAPIClient:
    """
    Alternative approach using FOS search API if available.
    
    The FOS website may have an underlying API that returns JSON.
    This class attempts to use it for faster, more reliable scraping.
    """
    
    API_BASE = "https://www.financial-ombudsman.org.uk/api"
    
    def __init__(self):
        self.session = None
    
    async def search_decisions(
        self,
        product: str = None,
        outcome: str = None,
        date_from: str = None,
        date_to: str = None,
        page: int = 1,
        per_page: int = 50
    ):
        """
        Search decisions via API (if available).
        
        This is a hypothetical implementation - actual API endpoints
        would need to be discovered through network inspection.
        """
        params = {
            "page": page,
            "per_page": per_page
        }
        
        if product:
            params["product"] = product
        if outcome:
            params["outcome"] = outcome
        if date_from:
            params["date_from"] = date_from
        if date_to:
            params["date_to"] = date_to
        
        # Attempt API call
        try:
            async with self.session.get(
                f"{self.API_BASE}/decisions/search",
                params=params
            ) as response:
                if response.status == 200:
                    return await response.json()
        except Exception as e:
            logger.warning(f"API not available, falling back to HTML scraping: {e}")
        
        return None


# Quick test scraper for development
async def test_scrape():
    """Test scraping a few decisions"""
    scraper = FOSScraper(output_dir="test_data")
    await scraper.create_session()
    
    try:
        # Test with just first page of credit cards
        urls = await scraper.get_search_results_page("credit-cards", 1)
        logger.info(f"Found {len(urls)} decision URLs")
        
        # Scrape first 5
        for url in urls[:5]:
            decision = await scraper.scrape_decision(url)
            if decision:
                logger.info(f"Decision: {decision.reference}")
                logger.info(f"  Outcome: {decision.outcome}")
                logger.info(f"  Summary: {decision.summary[:100]}...")
            await asyncio.sleep(1)
            
    finally:
        await scraper.close_session()


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        # Run test scrape
        asyncio.run(test_scrape())
    else:
        # Run full scrape
        scraper = FOSScraper()
        asyncio.run(scraper.run_full_scrape())
