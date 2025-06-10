-- Create waitlist table
CREATE TABLE waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email TEXT NOT NULL UNIQUE,
    twitter_verified BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'completed')),
    referral_code TEXT UNIQUE DEFAULT NULL
);

-- Create index on email for faster lookups
CREATE INDEX idx_waitlist_email ON waitlist(email);

-- Enable Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting new entries
CREATE POLICY "Anyone can join waitlist"
    ON waitlist FOR INSERT
    WITH CHECK (true);

-- Create policy for reading own entry
CREATE POLICY "Users can view their own waitlist entry"
    ON waitlist FOR SELECT
    USING (true); 