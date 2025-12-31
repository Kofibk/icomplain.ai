"""
FOS Decision Scraper - Last 12 Months
Scrapes recent Financial Ombudsman Service decisions for complaint intelligence.

This focuses on the last 12 months only for:
1. Faster initial data collection
2. More relevant/recent precedents
3. Current lender response patterns

Run: python fos_scraper_recent.py
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, List
import re
from concurrent.futures import ThreadPoolExecutor, as_completed

# Configuration
BASE_URL = "https://www.financial-ombudsman.org.uk"
SEARCH_URL = f"{BASE_URL}/decisions-case-studies/ombudsman-decisions/search"
OUTPUT_DIR = "fos_data"
RATE_LIMIT_SECONDS = 1.5  # Be respectful to FOS servers

# Categories we care about
CATEGORIES = {
    "pcp": ["PCP", "personal contract purchase", "motor finance", "car finance", "hire purchase", "HP"],
    "credit_card": ["credit card", "section 75", "chargeback"],
    "loans": ["personal loan", "unsecured loan", "unaffordable lending", "irresponsible lending"],
    "affordability": ["affordability", "creditworthiness", "persistent debt"],
}

# Major lenders to track
LENDERS = [
    "Black Horse", "MotoNovo", "Close Brothers", "Santander", "Barclays",
    "HSBC", "Lloyds", "NatWest", "Nationwide", "BMW Financial", "Mercedes Financial",
    "Volkswagen Financial", "Ford Credit", "Toyota Financial", "Alphera",
    "Zopa", "Monzo", "Starling", "Capital One", "MBNA", "Barclaycard",
    "Vanquis", "NewDay", "Creation", "Shop Direct", "Very", "Littlewoods"
]


class FOSDecisionScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (compatible; FOSResearch/1.0; +https://icomplain.ai)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        })
        
        # Create output directory
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        
        # Track progress
        self.decisions_scraped = 0
        self.errors = []
        
    def get_date_range(self) -> tuple:
        """Get date range for last 12 months"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)
        return start_date, end_date
    
    def search_decisions(self, 
                        keyword: str = "",
                        business_name: str = "",
                        date_from: Optional[datetime] = None,
                        date_to: Optional[datetime] = None,
                        page: int = 1) -> Dict:
        """Search FOS decisions with filters"""
        
        params = {
            "page": page,
            "per_page": 50,  # Max per page
        }
        
        if keyword:
            params["keyword"] = keyword
        if business_name:
            params["business_name"] = business_name
        if date_from:
            params["date_from"] = date_from.strftime("%Y-%m-%d")
        if date_to:
            params["date_to"] = date_to.strftime("%Y-%m-%d")
            
        try:
            response = self.session.get(SEARCH_URL, params=params, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, "html.parser")
            
            # Extract decision links
            decisions = []
            decision_cards = soup.select(".decision-card, .search-result, article.decision")
            
            for card in decision_cards:
                link = card.select_one("a[href*='/decisions-case-studies/']")
                if link:
                    href = link.get("href", "")
                    if not href.startswith("http"):
                        href = BASE_URL + href
                    
                    # Extract basic info from card
                    title = link.get_text(strip=True)
                    date_el = card.select_one(".date, time, .decision-date")
                    date = date_el.get_text(strip=True) if date_el else ""
                    
                    outcome_el = card.select_one(".outcome, .decision-outcome")
                    outcome = outcome_el.get_text(strip=True) if outcome_el else ""
                    
                    decisions.append({
                        "url": href,
                        "title": title,
                        "date": date,
                        "outcome_preview": outcome,
                    })
            
            # Check for pagination
            pagination = soup.select_one(".pagination")
            has_next = False
            total_pages = 1
            
            if pagination:
                next_link = pagination.select_one("a.next, a[rel='next']")
                has_next = next_link is not None
                
                # Try to find total pages
                page_links = pagination.select("a")
                for pl in page_links:
                    try:
                        page_num = int(pl.get_text(strip=True))
                        total_pages = max(total_pages, page_num)
                    except ValueError:
                        pass
            
            return {
                "decisions": decisions,
                "has_next": has_next,
                "total_pages": total_pages,
                "current_page": page,
            }
            
        except Exception as e:
            self.errors.append(f"Search error: {str(e)}")
            return {"decisions": [], "has_next": False, "total_pages": 0, "current_page": page}
    
    def scrape_decision_detail(self, url: str) -> Optional[Dict]:
        """Scrape full details from a decision page"""
        
        try:
            time.sleep(RATE_LIMIT_SECONDS)  # Rate limiting
            
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, "html.parser")
            
            # Extract decision reference
            ref_el = soup.select_one(".reference, .decision-reference, h1")
            reference = ref_el.get_text(strip=True) if ref_el else ""
            
            # Extract date
            date_el = soup.select_one("time, .date, .decision-date")
            date = date_el.get_text(strip=True) if date_el else ""
            
            # Extract business name
            business_el = soup.select_one(".business-name, .respondent")
            business = business_el.get_text(strip=True) if business_el else ""
            
            # Extract product type
            product_el = soup.select_one(".product-type, .product")
            product = product_el.get_text(strip=True) if product_el else ""
            
            # Extract outcome
            outcome_el = soup.select_one(".outcome, .decision-outcome, .verdict")
            outcome = outcome_el.get_text(strip=True) if outcome_el else ""
            
            # Determine if upheld
            outcome_lower = outcome.lower()
            is_upheld = any(word in outcome_lower for word in ["upheld", "uphold", "in favour of consumer"])
            
            # Extract full decision text
            content_el = soup.select_one(".decision-content, .content, article, main")
            full_text = content_el.get_text(separator="\n", strip=True) if content_el else ""
            
            # Extract key sections
            summary = self._extract_section(soup, ["summary", "background", "what happened"])
            findings = self._extract_section(soup, ["findings", "my findings", "assessment"])
            fair_outcome = self._extract_section(soup, ["fair outcome", "putting things right", "resolution"])
            
            # Categorize the decision
            category = self._categorize_decision(full_text, product)
            
            # Extract compensation amount if mentioned
            compensation = self._extract_compensation(full_text)
            
            # Extract key arguments
            key_arguments = self._extract_key_arguments(full_text, category)
            
            decision = {
                "url": url,
                "reference": reference,
                "date": date,
                "business": business,
                "product": product,
                "category": category,
                "outcome": "upheld" if is_upheld else "not upheld",
                "outcome_raw": outcome,
                "compensation": compensation,
                "summary": summary[:2000] if summary else "",
                "findings": findings[:3000] if findings else "",
                "fair_outcome": fair_outcome[:1500] if fair_outcome else "",
                "key_arguments": key_arguments,
                "full_text_length": len(full_text),
                "scraped_at": datetime.now().isoformat(),
            }
            
            self.decisions_scraped += 1
            
            if self.decisions_scraped % 50 == 0:
                print(f"  Scraped {self.decisions_scraped} decisions...")
            
            return decision
            
        except Exception as e:
            self.errors.append(f"Detail error for {url}: {str(e)}")
            return None
    
    def _extract_section(self, soup: BeautifulSoup, keywords: List[str]) -> str:
        """Extract a section by heading keywords"""
        for heading in soup.select("h2, h3, h4, strong"):
            heading_text = heading.get_text(strip=True).lower()
            if any(kw in heading_text for kw in keywords):
                # Get content after this heading
                content_parts = []
                for sibling in heading.find_next_siblings():
                    if sibling.name in ["h2", "h3", "h4"]:
                        break
                    content_parts.append(sibling.get_text(strip=True))
                return " ".join(content_parts)
        return ""
    
    def _categorize_decision(self, text: str, product: str) -> str:
        """Categorize decision based on content"""
        text_lower = text.lower()
        product_lower = product.lower()
        
        for category, keywords in CATEGORIES.items():
            for kw in keywords:
                if kw.lower() in text_lower or kw.lower() in product_lower:
                    return category
        
        return "other"
    
    def _extract_compensation(self, text: str) -> Optional[float]:
        """Extract compensation amount from text"""
        # Look for £X,XXX or £XXX patterns
        patterns = [
            r"£(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)",
            r"(\d{1,3}(?:,\d{3})*(?:\.\d{2})?) pounds",
        ]
        
        amounts = []
        for pattern in patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                try:
                    amount = float(match.replace(",", ""))
                    if 50 <= amount <= 100000:  # Reasonable compensation range
                        amounts.append(amount)
                except ValueError:
                    pass
        
        return max(amounts) if amounts else None
    
    def _extract_key_arguments(self, text: str, category: str) -> List[str]:
        """Extract key arguments/phrases that appear in the decision"""
        arguments = []
        text_lower = text.lower()
        
        # PCP/Motor finance arguments
        if category == "pcp":
            pcp_phrases = [
                "commission", "discretionary commission", "commission arrangement",
                "broker duty", "fiduciary duty", "disclosure",
                "interest rate", "APR", "rate of interest",
                "informed consent", "alternative rates",
                "CONC 4.5", "Consumer Credit Act",
            ]
            for phrase in pcp_phrases:
                if phrase.lower() in text_lower:
                    arguments.append(phrase)
        
        # Affordability arguments
        elif category in ["loans", "affordability"]:
            afford_phrases = [
                "affordability check", "creditworthiness assessment",
                "sustainable repayment", "CONC 5", "responsible lending",
                "income verification", "expenditure", "debt to income",
                "persistent debt", "credit limit increase",
            ]
            for phrase in afford_phrases:
                if phrase.lower() in text_lower:
                    arguments.append(phrase)
        
        # Section 75 arguments
        elif category == "credit_card":
            s75_phrases = [
                "section 75", "joint liability", "debtor-creditor-supplier",
                "breach of contract", "misrepresentation",
                "Consumer Credit Act 1974", "like claim",
            ]
            for phrase in s75_phrases:
                if phrase.lower() in text_lower:
                    arguments.append(phrase)
        
        return list(set(arguments))  # Dedupe
    
    def run(self, keywords: List[str] = None):
        """Main scraping run for last 12 months"""
        
        start_date, end_date = self.get_date_range()
        print(f"Scraping FOS decisions from {start_date.date()} to {end_date.date()}")
        
        if keywords is None:
            keywords = ["motor finance", "PCP", "credit card", "personal loan", "affordability"]
        
        all_decisions = []
        seen_urls = set()
        
        for keyword in keywords:
            print(f"\nSearching for: {keyword}")
            
            page = 1
            while True:
                print(f"  Page {page}...")
                
                results = self.search_decisions(
                    keyword=keyword,
                    date_from=start_date,
                    date_to=end_date,
                    page=page
                )
                
                if not results["decisions"]:
                    break
                
                for decision_preview in results["decisions"]:
                    url = decision_preview["url"]
                    
                    if url in seen_urls:
                        continue
                    seen_urls.add(url)
                    
                    # Scrape full detail
                    decision = self.scrape_decision_detail(url)
                    if decision:
                        all_decisions.append(decision)
                
                if not results["has_next"]:
                    break
                    
                page += 1
                
                # Safety limit
                if page > 100:
                    print("  Reached page limit")
                    break
        
        # Save results
        output_file = os.path.join(OUTPUT_DIR, f"fos_decisions_{datetime.now().strftime('%Y%m%d')}.json")
        with open(output_file, "w") as f:
            json.dump({
                "scraped_at": datetime.now().isoformat(),
                "date_range": {
                    "from": start_date.isoformat(),
                    "to": end_date.isoformat(),
                },
                "total_decisions": len(all_decisions),
                "decisions": all_decisions,
            }, f, indent=2)
        
        print(f"\n✓ Scraped {len(all_decisions)} decisions")
        print(f"✓ Saved to {output_file}")
        
        if self.errors:
            print(f"\n⚠ {len(self.errors)} errors encountered")
            error_file = os.path.join(OUTPUT_DIR, "errors.log")
            with open(error_file, "w") as f:
                f.write("\n".join(self.errors))
        
        # Generate summary
        self._generate_summary(all_decisions)
        
        return all_decisions
    
    def _generate_summary(self, decisions: List[Dict]):
        """Generate summary statistics"""
        
        if not decisions:
            return
        
        summary = {
            "total": len(decisions),
            "by_category": {},
            "by_outcome": {"upheld": 0, "not upheld": 0},
            "by_lender": {},
            "avg_compensation": 0,
            "key_arguments_frequency": {},
        }
        
        compensations = []
        
        for d in decisions:
            # By category
            cat = d.get("category", "other")
            summary["by_category"][cat] = summary["by_category"].get(cat, 0) + 1
            
            # By outcome
            outcome = d.get("outcome", "unknown")
            if outcome in summary["by_outcome"]:
                summary["by_outcome"][outcome] += 1
            
            # By lender
            business = d.get("business", "")
            for lender in LENDERS:
                if lender.lower() in business.lower():
                    summary["by_lender"][lender] = summary["by_lender"].get(lender, 0) + 1
                    break
            
            # Compensation
            comp = d.get("compensation")
            if comp:
                compensations.append(comp)
            
            # Arguments
            for arg in d.get("key_arguments", []):
                summary["key_arguments_frequency"][arg] = summary["key_arguments_frequency"].get(arg, 0) + 1
        
        if compensations:
            summary["avg_compensation"] = sum(compensations) / len(compensations)
            summary["max_compensation"] = max(compensations)
            summary["min_compensation"] = min(compensations)
        
        # Save summary
        summary_file = os.path.join(OUTPUT_DIR, "summary.json")
        with open(summary_file, "w") as f:
            json.dump(summary, f, indent=2)
        
        print(f"\n📊 Summary:")
        print(f"  Total decisions: {summary['total']}")
        print(f"  Upheld: {summary['by_outcome']['upheld']} ({summary['by_outcome']['upheld']/summary['total']*100:.1f}%)")
        print(f"  Categories: {summary['by_category']}")
        if compensations:
            print(f"  Avg compensation: £{summary['avg_compensation']:.2f}")


if __name__ == "__main__":
    scraper = FOSDecisionScraper()
    scraper.run()
