CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Books table
CREATE TABLE books (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT UNIQUE,
    category TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    price_per_week DECIMAL(8,2) NOT NULL,
    total_copies INTEGER DEFAULT 1,
    available_copies INTEGER DEFAULT 1,
    published_year INTEGER,
    pages INTEGER,
    rating DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Rentals table
CREATE TABLE rentals (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL REFERENCES users(id),
    book_id VARCHAR NOT NULL REFERENCES books(id),
    rental_date TIMESTAMP DEFAULT NOW(),
    due_date TIMESTAMP NOT NULL,
    return_date TIMESTAMP,
    status TEXT DEFAULT 'active', -- active, completed, overdue
    total_amount DECIMAL(8,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Wishlist table
CREATE TABLE wishlist (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL REFERENCES users(id),
    book_id VARCHAR NOT NULL REFERENCES books(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, book_id) -- Prevent duplicate wishlist entries
);

-- Indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_rentals_user_id ON rentals(user_id);
CREATE INDEX idx_rentals_book_id ON rentals(book_id);
CREATE INDEX idx_rentals_status ON rentals(status);
CREATE INDEX idx_rentals_due_date ON rentals(due_date);
CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX idx_wishlist_book_id ON wishlist(book_id);