-- Create test shop for vendor testing
INSERT INTO shops (name, description, contact_phone, contact_email, address, status) 
VALUES (
  'Test Electronics Shop',
  'A shop selling electronics and gadgets',
  '+91-9876543210',
  'shop@test.com',
  '123 Market Street, City Center',
  'approved'
) ON CONFLICT DO NOTHING;