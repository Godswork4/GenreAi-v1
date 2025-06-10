-- Create transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    transaction_hash TEXT NOT NULL UNIQUE,
    network TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    type TEXT NOT NULL CHECK (type IN ('swap', 'transfer', 'stake', 'unstake')),
    amount TEXT NOT NULL,
    token_address TEXT NOT NULL,
    token_symbol TEXT NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX idx_transactions_user_id ON transactions(user_id);

-- Create index on transaction_hash for faster lookups
CREATE INDEX idx_transactions_hash ON transactions(transaction_hash);
