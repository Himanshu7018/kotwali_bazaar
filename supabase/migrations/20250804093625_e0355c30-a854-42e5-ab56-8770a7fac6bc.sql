-- Create test users with roles
-- First, let's create a test shop for the vendor

INSERT INTO shops (name, description, contact_phone, contact_email, address, status) 
VALUES (
  'Test Electronics Shop',
  'A shop selling electronics and gadgets',
  '+91-9876543210',
  'shop@test.com',
  '123 Market Street, City Center',
  'approved'
) ON CONFLICT DO NOTHING;

-- Create a test vendor entry (we'll link this to a user after they sign up)
INSERT INTO vendors (email, is_blocked, shop_id)
SELECT 'vendor@test.com', false, s.id
FROM shops s 
WHERE s.name = 'Test Electronics Shop'
ON CONFLICT DO NOTHING;

-- Note: The actual auth users need to be created through the authentication system
-- We'll provide the credentials for manual testing:
-- 
-- Customer account credentials:
-- Email: customer@test.com
-- Password: customer123
-- Role: customer
--
-- Vendor/Shop Owner account credentials:  
-- Email: vendor@test.com
-- Password: vendor123
-- Role: vendor