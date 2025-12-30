"""
FOS Decision Data Processor

Cleans, categorises, and prepares scraped FOS decisions for AI training.
Extracts key patterns from successful complaints.
"""

import json
import re
import os
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class ProcessedDecision:
    """Cleaned and enriched decision data"""
    reference: str
    date: str
    
    # Categorisation
    complaint_category: str  # pcp, section75, unaffordable_lending, holiday_park, other
    product_type: str
    
    # Outcome
    outcome: str
    outcome_score: float  # 1.0 = fully upheld, 0.5 = partial, 0.0 = not upheld
    
    # Key content
    complaint_summary: str
    key_arguments: List[str]
    evidence_cited: List[str]
    legal_references: List[str]
    
    # Compensation
    compensation_amount: Optional[float]
    compensation_type: str  # refund, interest, distress, combination
    
    # Full text for embedding
    full_text: str
    
    # Metadata
    url: str
    processed_at: str


class DecisionProcessor:
    """
    Processes raw FOS decisions into structured training data.
    
    Key tasks:
    1. Categorise by complaint type
    2. Extract winning arguments and patterns
    3. Identify evidence requirements
    4. Extract legal/regulatory references
    """
    
    # Patterns to identify complaint categories
    CATEGORY_PATTERNS = {
        'pcp': [
            r'motor finance',
            r'car finance',
            r'pcp',
            r'personal contract purchase',
            r'hire purchase.*motor',
            r'commission.*car',
            r'discretionary commission',
            r'dca',
            r'dealer commission',
        ],
        'section75': [
            r'section 75',
            r's\.?75',
            r'consumer credit act.*1974',
            r'joint.*liability',
            r'jointly.*liable',
            r'credit card.*purchase',
            r'goods not.*delivered',
            r'faulty goods',
            r'misrepresentation.*credit',
        ],
        'unaffordable_lending': [
            r'unaffordable',
            r'irresponsible lending',
            r'affordability check',
            r'creditworth',
            r'could not afford',
            r'persistent debt',
            r'financial difficult',
            r'debt spiral',
            r'conc 5',
            r'lending assessment',
        ],
        'holiday_park': [
            r'holiday park',
            r'caravan',
            r'static home',
            r'lodge',
            r'timeshare',
            r'pitch fee',
            r'site fee',
        ]
    }
    
    # Patterns for extracting key arguments (from upheld decisions)
    ARGUMENT_PATTERNS = [
        r'I (?:think|believe|consider|find) (?:that )?(.{50,200})',
        r'(?:The|This) (?:business|lender|firm) (?:should have|failed to|did not) (.{30,150})',
        r'(?:It is|I am) (?:clear|satisfied|persuaded) (?:that )?(.{30,150})',
        r'(?:Taking|Having) (?:all|everything) into (?:account|consideration),? (.{30,150})',
        r'(?:On balance|Overall),? (.{30,150})',
    ]
    
    # Evidence patterns
    EVIDENCE_PATTERNS = [
        r'(?:bank statement|credit report|application form|agreement|contract)',
        r'(?:income|expenditure|affordability) (?:information|assessment|data)',
        r'(?:credit file|credit history|credit score)',
        r'(?:terms and conditions|t&cs)',
        r'(?:correspondence|emails|letters)',
        r'(?:transaction history|statements)',
    ]
    
    # Legal reference patterns
    LEGAL_PATTERNS = [
        r'(?:CONC \d+(?:\.\d+)*)',
        r'(?:Consumer Credit Act \d{4})',
        r'(?:section \d+)',
        r'(?:FCA (?:rules|guidance|handbook))',
        r'(?:Consumer Rights Act)',
        r'(?:DISP \d+(?:\.\d+)*)',
        r'(?:BCOBS)',
    ]
    
    def __init__(self, input_dir: str = "data/raw", output_dir: str = "data/processed"):
        self.input_dir = input_dir
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
    
    def load_raw_decisions(self) -> List[Dict]:
        """Load all raw decision files"""
        decisions = []
        
        for filename in os.listdir(self.input_dir):
            if filename.endswith('.json'):
                filepath = os.path.join(self.input_dir, filename)
                with open(filepath, 'r', encoding='utf-8') as f:
                    file_decisions = json.load(f)
                    decisions.extend(file_decisions)
        
        logger.info(f"Loaded {len(decisions)} raw decisions")
        return decisions
    
    def categorise_decision(self, text: str) -> Tuple[str, float]:
        """
        Determine the complaint category based on content.
        Returns (category, confidence_score)
        """
        text_lower = text.lower()
        
        scores = {}
        for category, patterns in self.CATEGORY_PATTERNS.items():
            score = 0
            for pattern in patterns:
                matches = re.findall(pattern, text_lower)
                score += len(matches)
            scores[category] = score
        
        if not any(scores.values()):
            return ('other', 0.0)
        
        best_category = max(scores, key=scores.get)
        max_score = scores[best_category]
        confidence = min(max_score / 5.0, 1.0)  # Normalise to 0-1
        
        return (best_category, confidence)
    
    def extract_key_arguments(self, text: str, is_upheld: bool) -> List[str]:
        """Extract key arguments from the decision reasoning"""
        arguments = []
        
        # Only extract from upheld decisions for training on successful patterns
        if not is_upheld:
            return arguments
        
        for pattern in self.ARGUMENT_PATTERNS:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                # Clean and add
                cleaned = match.strip()
                if len(cleaned) > 30 and cleaned not in arguments:
                    arguments.append(cleaned)
        
        return arguments[:10]  # Limit to top 10
    
    def extract_evidence_cited(self, text: str) -> List[str]:
        """Extract evidence types mentioned in the decision"""
        evidence = []
        text_lower = text.lower()
        
        for pattern in self.EVIDENCE_PATTERNS:
            matches = re.findall(pattern, text_lower)
            for match in matches:
                if match not in evidence:
                    evidence.append(match)
        
        return list(set(evidence))
    
    def extract_legal_references(self, text: str) -> List[str]:
        """Extract legal and regulatory references"""
        references = []
        
        for pattern in self.LEGAL_PATTERNS:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if match not in references:
                    references.append(match)
        
        return list(set(references))
    
    def extract_compensation(self, text: str) -> Tuple[Optional[float], str]:
        """Extract compensation amount and type"""
        amount = None
        comp_type = 'unknown'
        
        # Look for compensation amounts
        amount_patterns = [
            r'pay.*?£([\d,]+(?:\.\d{2})?)',
            r'refund.*?£([\d,]+(?:\.\d{2})?)',
            r'£([\d,]+(?:\.\d{2})?).*?compensation',
            r'award.*?£([\d,]+(?:\.\d{2})?)',
        ]
        
        for pattern in amount_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    amount = float(match.group(1).replace(',', ''))
                    break
                except ValueError:
                    continue
        
        # Determine compensation type
        text_lower = text.lower()
        if 'refund' in text_lower and 'interest' in text_lower:
            comp_type = 'refund_plus_interest'
        elif 'refund' in text_lower:
            comp_type = 'refund'
        elif 'interest' in text_lower:
            comp_type = 'interest'
        elif 'distress' in text_lower or 'inconvenience' in text_lower:
            comp_type = 'distress_and_inconvenience'
        
        return (amount, comp_type)
    
    def calculate_outcome_score(self, outcome: str) -> float:
        """Convert outcome string to numerical score"""
        outcome_lower = outcome.lower()
        
        if 'not upheld' in outcome_lower:
            return 0.0
        elif 'partially' in outcome_lower or 'part' in outcome_lower:
            return 0.5
        elif 'upheld' in outcome_lower:
            return 1.0
        else:
            return 0.0
    
    def create_complaint_summary(self, text: str) -> str:
        """Create a concise summary of the complaint"""
        # Look for complaint description section
        patterns = [
            r'complaint\s*:?\s*(.{100,500}?)(?:\n|$)',
            r'what happened\s*:?\s*(.{100,500}?)(?:\n|$)',
            r'background\s*:?\s*(.{100,500}?)(?:\n|$)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                summary = match.group(1).strip()
                # Clean up
                summary = re.sub(r'\s+', ' ', summary)
                return summary[:500]
        
        # Fallback: first substantial paragraph
        paragraphs = text.split('\n\n')
        for para in paragraphs:
            if len(para) > 100:
                return para[:500].strip()
        
        return text[:500]
    
    def process_decision(self, raw: Dict) -> Optional[ProcessedDecision]:
        """Process a single raw decision"""
        try:
            full_text = raw.get('full_text', '')
            if not full_text or len(full_text) < 100:
                return None
            
            # Categorise
            category, confidence = self.categorise_decision(full_text)
            
            # Only process if we're confident about category
            if confidence < 0.2 and category == 'other':
                category = raw.get('product_type', 'other')
            
            # Calculate outcome score
            outcome = raw.get('outcome', 'unknown')
            outcome_score = self.calculate_outcome_score(outcome)
            is_upheld = outcome_score > 0.5
            
            # Extract key information
            key_arguments = self.extract_key_arguments(full_text, is_upheld)
            evidence = self.extract_evidence_cited(full_text)
            legal_refs = self.extract_legal_references(full_text)
            compensation, comp_type = self.extract_compensation(full_text)
            summary = self.create_complaint_summary(full_text)
            
            return ProcessedDecision(
                reference=raw.get('reference', 'UNKNOWN'),
                date=raw.get('date', ''),
                complaint_category=category,
                product_type=raw.get('product_type', ''),
                outcome=outcome,
                outcome_score=outcome_score,
                complaint_summary=summary,
                key_arguments=key_arguments,
                evidence_cited=evidence,
                legal_references=legal_refs,
                compensation_amount=compensation or raw.get('compensation_amount'),
                compensation_type=comp_type,
                full_text=full_text,
                url=raw.get('url', ''),
                processed_at=datetime.utcnow().isoformat()
            )
            
        except Exception as e:
            logger.error(f"Error processing decision: {e}")
            return None
    
    def process_all(self) -> List[ProcessedDecision]:
        """Process all raw decisions"""
        raw_decisions = self.load_raw_decisions()
        processed = []
        
        for i, raw in enumerate(raw_decisions):
            if i % 1000 == 0:
                logger.info(f"Processing decision {i}/{len(raw_decisions)}")
            
            result = self.process_decision(raw)
            if result:
                processed.append(result)
        
        logger.info(f"Processed {len(processed)} decisions successfully")
        return processed
    
    def save_processed(self, decisions: List[ProcessedDecision]):
        """Save processed decisions to categorised files"""
        # Group by category
        by_category = {}
        for d in decisions:
            cat = d.complaint_category
            if cat not in by_category:
                by_category[cat] = []
            by_category[cat].append(asdict(d))
        
        # Save each category
        for category, cat_decisions in by_category.items():
            filename = os.path.join(self.output_dir, f"{category}_processed.json")
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(cat_decisions, f, indent=2, ensure_ascii=False)
            logger.info(f"Saved {len(cat_decisions)} {category} decisions")
        
        # Save upheld-only decisions for training
        upheld = [asdict(d) for d in decisions if d.outcome_score >= 0.5]
        with open(os.path.join(self.output_dir, "upheld_decisions.json"), 'w', encoding='utf-8') as f:
            json.dump(upheld, f, indent=2, ensure_ascii=False)
        logger.info(f"Saved {len(upheld)} upheld decisions for training")
        
        # Save statistics
        stats = self.calculate_statistics(decisions)
        with open(os.path.join(self.output_dir, "processing_stats.json"), 'w') as f:
            json.dump(stats, f, indent=2)
    
    def calculate_statistics(self, decisions: List[ProcessedDecision]) -> Dict:
        """Calculate summary statistics"""
        stats = {
            "total_processed": len(decisions),
            "by_category": {},
            "by_outcome": {},
            "upheld_rate_by_category": {},
            "average_compensation": {},
            "common_evidence_types": {},
            "common_legal_references": {},
            "processed_at": datetime.utcnow().isoformat()
        }
        
        # Count by category
        for d in decisions:
            cat = d.complaint_category
            stats["by_category"][cat] = stats["by_category"].get(cat, 0) + 1
            
            # Track outcomes by category
            if cat not in stats["upheld_rate_by_category"]:
                stats["upheld_rate_by_category"][cat] = {"upheld": 0, "total": 0}
            stats["upheld_rate_by_category"][cat]["total"] += 1
            if d.outcome_score >= 0.5:
                stats["upheld_rate_by_category"][cat]["upheld"] += 1
        
        # Calculate upheld rates
        for cat in stats["upheld_rate_by_category"]:
            data = stats["upheld_rate_by_category"][cat]
            data["rate"] = round(data["upheld"] / data["total"] * 100, 1) if data["total"] > 0 else 0
        
        # Count evidence types
        evidence_counts = {}
        for d in decisions:
            for e in d.evidence_cited:
                evidence_counts[e] = evidence_counts.get(e, 0) + 1
        stats["common_evidence_types"] = dict(sorted(evidence_counts.items(), key=lambda x: -x[1])[:20])
        
        # Count legal references
        legal_counts = {}
        for d in decisions:
            for ref in d.legal_references:
                legal_counts[ref] = legal_counts.get(ref, 0) + 1
        stats["common_legal_references"] = dict(sorted(legal_counts.items(), key=lambda x: -x[1])[:20])
        
        return stats
    
    def run(self):
        """Run the full processing pipeline"""
        processed = self.process_all()
        self.save_processed(processed)
        return processed


if __name__ == "__main__":
    processor = DecisionProcessor()
    processor.run()
