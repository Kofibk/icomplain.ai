"""
Embeddings Generator for FOS Decisions

Generates vector embeddings for RAG (Retrieval Augmented Generation).
When a user submits a complaint, we retrieve similar successful decisions
to inform the AI's complaint generation.
"""

import json
import os
from typing import List, Dict, Optional
from dataclasses import dataclass
import logging
import hashlib

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# We'll use different embedding providers
# Option 1: OpenAI embeddings (best quality, paid)
# Option 2: Voyage AI (good for legal text)
# Option 3: Local model (free but lower quality)

try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    import voyageai
    VOYAGE_AVAILABLE = True
except ImportError:
    VOYAGE_AVAILABLE = False


@dataclass
class EmbeddedDecision:
    """Decision with vector embedding"""
    reference: str
    category: str
    outcome: str
    outcome_score: float
    summary: str
    key_arguments: List[str]
    evidence_cited: List[str]
    legal_references: List[str]
    embedding: List[float]
    chunk_text: str  # The text that was embedded
    chunk_id: str


class EmbeddingsGenerator:
    """
    Generates embeddings for FOS decisions.
    
    We create embeddings for:
    1. Full decision summaries
    2. Individual key arguments (from upheld cases)
    3. Combined category + evidence patterns
    
    This allows semantic search to find:
    - Similar past complaints
    - Successful argument patterns
    - Relevant evidence requirements
    """
    
    CHUNK_SIZE = 1000  # Characters per chunk
    OVERLAP = 200  # Character overlap between chunks
    
    def __init__(
        self,
        input_dir: str = "data/processed",
        output_dir: str = "data/embeddings",
        provider: str = "openai"  # or "voyage" or "local"
    ):
        self.input_dir = input_dir
        self.output_dir = output_dir
        self.provider = provider
        os.makedirs(output_dir, exist_ok=True)
        
        self._init_client()
    
    def _init_client(self):
        """Initialise embedding client"""
        if self.provider == "openai" and OPENAI_AVAILABLE:
            self.client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            self.model = "text-embedding-3-small"
            self.dimensions = 1536
        elif self.provider == "voyage" and VOYAGE_AVAILABLE:
            self.client = voyageai.Client(api_key=os.getenv("VOYAGE_API_KEY"))
            self.model = "voyage-law-2"  # Specialised for legal text
            self.dimensions = 1024
        else:
            logger.warning("No embedding provider available, using mock embeddings")
            self.client = None
            self.model = "mock"
            self.dimensions = 384
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for a single text"""
        if not text or len(text.strip()) < 10:
            return [0.0] * self.dimensions
        
        # Truncate if too long
        text = text[:8000]
        
        try:
            if self.provider == "openai" and self.client:
                response = self.client.embeddings.create(
                    model=self.model,
                    input=text
                )
                return response.data[0].embedding
            
            elif self.provider == "voyage" and self.client:
                response = self.client.embed(
                    texts=[text],
                    model=self.model
                )
                return response.embeddings[0]
            
            else:
                # Mock embedding for development
                return self._mock_embedding(text)
                
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            return [0.0] * self.dimensions
    
    def _mock_embedding(self, text: str) -> List[float]:
        """Generate deterministic mock embedding for development"""
        # Use hash to create consistent embedding
        hash_bytes = hashlib.sha256(text.encode()).digest()
        embedding = []
        for i in range(0, self.dimensions * 4, 4):
            if i < len(hash_bytes) - 3:
                val = int.from_bytes(hash_bytes[i:i+4], 'big')
            else:
                # Repeat hash for longer embeddings
                idx = i % len(hash_bytes)
                val = int.from_bytes(hash_bytes[idx:idx+4] if idx + 4 <= len(hash_bytes) else hash_bytes[idx:] + hash_bytes[:4-(len(hash_bytes)-idx)], 'big')
            # Normalise to [-1, 1]
            embedding.append((val / (2**32)) * 2 - 1)
        return embedding[:self.dimensions]
    
    def chunk_text(self, text: str) -> List[str]:
        """Split long text into overlapping chunks"""
        if len(text) <= self.CHUNK_SIZE:
            return [text]
        
        chunks = []
        start = 0
        while start < len(text):
            end = start + self.CHUNK_SIZE
            
            # Try to break at sentence boundary
            if end < len(text):
                last_period = text.rfind('.', start, end)
                if last_period > start + self.CHUNK_SIZE // 2:
                    end = last_period + 1
            
            chunks.append(text[start:end].strip())
            start = end - self.OVERLAP
        
        return chunks
    
    def create_searchable_text(self, decision: Dict) -> str:
        """Create optimised text for embedding"""
        parts = []
        
        # Category context
        category = decision.get('complaint_category', '')
        if category:
            parts.append(f"Complaint category: {category}")
        
        # Summary
        summary = decision.get('complaint_summary', '')
        if summary:
            parts.append(f"Summary: {summary}")
        
        # Key arguments (most important for matching)
        arguments = decision.get('key_arguments', [])
        if arguments:
            parts.append("Key arguments: " + " | ".join(arguments))
        
        # Evidence
        evidence = decision.get('evidence_cited', [])
        if evidence:
            parts.append("Evidence types: " + ", ".join(evidence))
        
        # Legal references
        legal = decision.get('legal_references', [])
        if legal:
            parts.append("Legal references: " + ", ".join(legal))
        
        return "\n".join(parts)
    
    def process_decisions(self, decisions: List[Dict]) -> List[EmbeddedDecision]:
        """Process all decisions and generate embeddings"""
        embedded = []
        
        for i, decision in enumerate(decisions):
            if i % 100 == 0:
                logger.info(f"Processing embedding {i}/{len(decisions)}")
            
            # Create searchable text
            search_text = self.create_searchable_text(decision)
            
            # For upheld decisions, also create argument-level embeddings
            outcome_score = decision.get('outcome_score', 0)
            
            # Main embedding
            chunks = self.chunk_text(search_text)
            for j, chunk in enumerate(chunks):
                embedding = self.generate_embedding(chunk)
                chunk_id = f"{decision.get('reference', 'unknown')}_{j}"
                
                embedded.append(EmbeddedDecision(
                    reference=decision.get('reference', ''),
                    category=decision.get('complaint_category', ''),
                    outcome=decision.get('outcome', ''),
                    outcome_score=outcome_score,
                    summary=decision.get('complaint_summary', '')[:500],
                    key_arguments=decision.get('key_arguments', []),
                    evidence_cited=decision.get('evidence_cited', []),
                    legal_references=decision.get('legal_references', []),
                    embedding=embedding,
                    chunk_text=chunk,
                    chunk_id=chunk_id
                ))
            
            # For upheld cases, also embed individual key arguments
            if outcome_score >= 0.5:
                for k, arg in enumerate(decision.get('key_arguments', [])[:5]):
                    if len(arg) > 30:
                        embedding = self.generate_embedding(
                            f"[{decision.get('complaint_category', '')}] Successful argument: {arg}"
                        )
                        chunk_id = f"{decision.get('reference', 'unknown')}_arg_{k}"
                        
                        embedded.append(EmbeddedDecision(
                            reference=decision.get('reference', ''),
                            category=decision.get('complaint_category', ''),
                            outcome='upheld',
                            outcome_score=1.0,
                            summary=arg,
                            key_arguments=[arg],
                            evidence_cited=decision.get('evidence_cited', []),
                            legal_references=decision.get('legal_references', []),
                            embedding=embedding,
                            chunk_text=arg,
                            chunk_id=chunk_id
                        ))
        
        return embedded
    
    def save_embeddings(self, embedded: List[EmbeddedDecision], filename: str):
        """Save embeddings to JSON file"""
        data = []
        for e in embedded:
            data.append({
                "reference": e.reference,
                "category": e.category,
                "outcome": e.outcome,
                "outcome_score": e.outcome_score,
                "summary": e.summary,
                "key_arguments": e.key_arguments,
                "evidence_cited": e.evidence_cited,
                "legal_references": e.legal_references,
                "embedding": e.embedding,
                "chunk_text": e.chunk_text,
                "chunk_id": e.chunk_id
            })
        
        filepath = os.path.join(self.output_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f)
        
        logger.info(f"Saved {len(data)} embeddings to {filepath}")
    
    def save_for_supabase(self, embedded: List[EmbeddedDecision]):
        """
        Save in format ready for Supabase pgvector import.
        
        Generates SQL insert statements or CSV for bulk import.
        """
        # SQL format
        sql_statements = []
        sql_statements.append("""
-- Run this after creating the table
-- Make sure pgvector extension is enabled: CREATE EXTENSION IF NOT EXISTS vector;

INSERT INTO fos_decisions (
    reference, category, outcome, outcome_score,
    summary, key_arguments, evidence_cited, legal_references,
    chunk_text, chunk_id, embedding
) VALUES
""")
        
        values = []
        for e in embedded:
            # Escape strings
            summary = e.summary.replace("'", "''")[:500]
            chunk_text = e.chunk_text.replace("'", "''")[:2000]
            
            value = f"""(
    '{e.reference}',
    '{e.category}',
    '{e.outcome}',
    {e.outcome_score},
    '{summary}',
    ARRAY{e.key_arguments}::text[],
    ARRAY{e.evidence_cited}::text[],
    ARRAY{e.legal_references}::text[],
    '{chunk_text}',
    '{e.chunk_id}',
    '[{",".join(str(x) for x in e.embedding)}]'::vector
)"""
            values.append(value)
        
        # Write in batches (Supabase has limits)
        batch_size = 100
        for i in range(0, len(values), batch_size):
            batch = values[i:i+batch_size]
            filepath = os.path.join(self.output_dir, f"supabase_import_{i//batch_size}.sql")
            with open(filepath, 'w') as f:
                f.write(sql_statements[0])
                f.write(",\n".join(batch))
                f.write(";\n")
        
        logger.info(f"Saved {len(embedded)} embeddings for Supabase import")
    
    def run(self):
        """Run the full embedding pipeline"""
        # Load processed decisions
        all_decisions = []
        for filename in os.listdir(self.input_dir):
            if filename.endswith('_processed.json'):
                filepath = os.path.join(self.input_dir, filename)
                with open(filepath, 'r', encoding='utf-8') as f:
                    decisions = json.load(f)
                    all_decisions.extend(decisions)
        
        if not all_decisions:
            logger.warning("No processed decisions found")
            return
        
        logger.info(f"Processing {len(all_decisions)} decisions")
        
        # Generate embeddings
        embedded = self.process_decisions(all_decisions)
        
        # Save outputs
        self.save_embeddings(embedded, "all_embeddings.json")
        self.save_for_supabase(embedded)
        
        # Save by category for faster loading
        by_category = {}
        for e in embedded:
            if e.category not in by_category:
                by_category[e.category] = []
            by_category[e.category].append(e)
        
        for category, cat_embedded in by_category.items():
            self.save_embeddings(cat_embedded, f"{category}_embeddings.json")
        
        logger.info("Embedding generation complete")
        return embedded


if __name__ == "__main__":
    generator = EmbeddingsGenerator(provider="openai")
    generator.run()
