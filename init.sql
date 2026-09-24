-- Create schema
CREATE SCHEMA IF NOT EXISTS "ico-env";

-- Create users table
CREATE TABLE IF NOT EXISTS "ico-env".users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    temp_password_hash VARCHAR(255),
    secret_key VARCHAR(255),
    type VARCHAR(50) NOT NULL DEFAULT 'employee',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS "ico-env".bookings (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    booking_date DATE NOT NULL,
    booking_desk VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_name, booking_date, booking_desk)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON "ico-env".users(email);
CREATE INDEX IF NOT EXISTS idx_bookings_user_name ON "ico-env".bookings(user_name);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON "ico-env".bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_desk ON "ico-env".bookings(booking_desk);
