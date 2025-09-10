-- Add customer role to the existing user_role enum
ALTER TYPE user_role ADD VALUE 'customer';

-- Update RLS policies to allow customers to view products and shops (they already can due to public access)
-- Add policy for customers to view their own orders (when order system is implemented)

-- Create a test customer user and vendor user
-- Note: These are temporary test accounts. In production, users should register through the UI.

-- First, let's create the auth users (this will be done via the auth system)
-- We'll create entries in user_roles table for the test users

-- Insert test roles for existing users (we'll update this after creating the users)
-- For now, let's ensure the enum is updated and ready