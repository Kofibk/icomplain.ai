-- ComplaintAI Database Schema
-- Run this in your Supabase SQL editor

-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- ================================================
-- FOS Decisions Table (Training Data)
-- ================================================
CREATE TABLE IF NOT EXISTS fos_decisions (
    id BIGSERIAL PRIMARY KEY,
    reference VARCHAR(50) UNIQUE,
    date DATE,
    category VARCHAR(50),
    product_type VARCHAR(100),
    outcome VARCHAR(50),
    outcome_score FLOAT,
    summary TEXT,
    key_arguments TEXT[],
    evidence_cited TEXT[],
    legal_references TEXT[],
    chunk_text TEXT,
    chunk_id VARCHAR(100),
    embedding vector(1536),  -- OpenAI embedding dimension
    url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster category lookups
CREATE INDEX IF NOT EXISTS idx_fos_decisions_category ON fos_decisions(category);
CREATE INDEX IF NOT EXISTS idx_fos_decisions_outcome ON fos_decisions(outcome);

-- Vector similarity index for RAG
CREATE INDEX IF NOT EXISTS idx_fos_decisions_embedding ON fos_decisions 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- ================================================
-- Generated Complaints Table
-- ================================================
CREATE TABLE IF NOT EXISTS generated_complaints (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE,
    complaint_type VARCHAR(50) NOT NULL,
    answers JSONB NOT NULL,
    generated_letter TEXT,
    evidence_checklist TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    email VARCHAR(255),
    payment_status VARCHAR(50) DEFAULT 'pending'
);

-- Index for session lookups
CREATE INDEX IF NOT EXISTS idx_generated_complaints_session ON generated_complaints(session_id);

-- ================================================
-- Payments Table
-- ================================================
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    stripe_session_id VARCHAR(255) UNIQUE,
    stripe_payment_intent VARCHAR(255),
    complaint_id BIGINT REFERENCES generated_complaints(id),
    amount INTEGER NOT NULL,  -- in pence
    currency VARCHAR(3) DEFAULT 'gbp',
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ================================================
-- Outcome Tracking Table (Optional - for improving the model)
-- ================================================
CREATE TABLE IF NOT EXISTS complaint_outcomes (
    id BIGSERIAL PRIMARY KEY,
    complaint_id BIGINT REFERENCES generated_complaints(id),
    outcome VARCHAR(50),  -- 'successful', 'rejected', 'escalated_fos', 'fos_upheld', 'fos_rejected'
    compensation_received NUMERIC(10, 2),
    feedback TEXT,
    reported_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- Helper Functions
-- ================================================

-- Function to search similar decisions using vector similarity
CREATE OR REPLACE FUNCTION search_similar_decisions(
    query_embedding vector(1536),
    match_category VARCHAR(50) DEFAULT NULL,
    match_count INT DEFAULT 5,
    min_similarity FLOAT DEFAULT 0.7
)
RETURNS TABLE (
    id BIGINT,
    reference VARCHAR(50),
    category VARCHAR(50),
    outcome VARCHAR(50),
    summary TEXT,
    key_arguments TEXT[],
    legal_references TEXT[],
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        f.reference,
        f.category,
        f.outcome,
        f.summary,
        f.key_arguments,
        f.legal_references,
        1 - (f.embedding <=> query_embedding) AS similarity
    FROM fos_decisions f
    WHERE 
        (match_category IS NULL OR f.category = match_category)
        AND f.outcome_score >= 0.5  -- Only upheld decisions
        AND 1 - (f.embedding <=> query_embedding) > min_similarity
    ORDER BY f.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ================================================
-- Row Level Security (RLS)
-- ================================================

-- Enable RLS on all tables
ALTER TABLE fos_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_outcomes ENABLE ROW LEVEL SECURITY;

-- FOS decisions are read-only for authenticated users
CREATE POLICY "FOS decisions are readable"
ON fos_decisions FOR SELECT
USING (true);

-- Generated complaints - users can only see their own (via session_id)
CREATE POLICY "Users can view own complaints"
ON generated_complaints FOR SELECT
USING (true);  -- In production, add proper auth check

CREATE POLICY "Service can insert complaints"
ON generated_complaints FOR INSERT
WITH CHECK (true);  -- Only service role should insert

-- Payments - similar to complaints
CREATE POLICY "Service can manage payments"
ON payments FOR ALL
USING (true);

-- ================================================
-- Seed Data (Example decisions for testing)
-- ================================================

-- Insert some example PCP decisions
INSERT INTO fos_decisions (reference, date, category, product_type, outcome, outcome_score, summary, key_arguments, evidence_cited, legal_references)
VALUES 
(
    'DRN-TEST-001',
    '2024-06-15',
    'pcp',
    'hire-purchase',
    'upheld',
    1.0,
    'Consumer complained they were not told about commission arrangements when taking out PCP finance. The dealer received commission from the lender but this was not disclosed.',
    ARRAY[
        'The dealer had a duty to disclose the commission arrangement',
        'The customer was not informed about how the interest rate was set',
        'A properly informed customer may have sought alternative finance'
    ],
    ARRAY['finance agreement', 'dealer documentation', 'lender records'],
    ARRAY['CONC 4.5.3R', 'Consumer Credit Act 1974']
),
(
    'DRN-TEST-002',
    '2024-05-20',
    'section75',
    'credit-cards',
    'upheld',
    1.0,
    'Consumer used credit card to pay deposit for holiday. Travel company went into administration before travel date. Card provider initially rejected Section 75 claim.',
    ARRAY[
        'Section 75 makes the card provider jointly liable with the merchant',
        'The full amount was recoverable despite only deposit being paid on card',
        'Consumer had attempted to resolve with merchant before claiming'
    ],
    ARRAY['credit card statement', 'booking confirmation', 'correspondence with merchant'],
    ARRAY['Section 75 Consumer Credit Act 1974']
),
(
    'DRN-TEST-003',
    '2024-04-10',
    'unaffordable',
    'credit-cards',
    'upheld',
    1.0,
    'Consumer complained credit card was unaffordable. Lender had increased limit multiple times without conducting proper affordability assessments.',
    ARRAY[
        'Lender failed to conduct reasonable affordability checks before limit increases',
        'Consumer was in persistent debt paying mostly interest',
        'Bank statements would have shown consumer was struggling'
    ],
    ARRAY['bank statements', 'credit card statements', 'credit report'],
    ARRAY['CONC 5.2.1R', 'CONC 6.7']
);

-- Grant permissions to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
