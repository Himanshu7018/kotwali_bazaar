-- Insert test shops (without vendor dependency)
INSERT INTO public.shops (id, name, description, contact_email, contact_phone, address, status, is_active, image_url) VALUES
('11111111-1111-1111-1111-111111111111', 'Ram Electronics', 'Your trusted electronics store with latest gadgets and home appliances', 'ram@electronics.com', '+91-9876543210', '123 Electronics Market, Delhi', 'approved', true, 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b'),
('22222222-2222-2222-2222-222222222222', 'Sharma Clothing Store', 'Traditional and modern clothing for the entire family', 'sharma@clothing.com', '+91-9876543211', '456 Fashion Street, Mumbai', 'approved', true, 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07'),
('33333333-3333-3333-3333-333333333333', 'Gupta General Store', 'Daily essentials and grocery items at affordable prices', 'gupta@general.com', '+91-9876543212', '789 Market Road, Kolkata', 'approved', true, 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21');

-- Insert products for Ram Electronics
INSERT INTO public.products (id, shop_id, name, description, price, discount, availability, image_url) VALUES
('p1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'LED TV', '32 inch Smart LED TV with 4K resolution', 25000, 10, true, 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b'),
('p1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'Mobile Phone', 'Latest smartphone with advanced camera', 15000, 5, true, 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b'),
('p1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'Bluetooth Speaker', 'Portable wireless speaker with premium sound', 2500, 15, true, 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b'),
('p1111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111', 'Power Bank', '10000mAh fast charging power bank', 1200, 0, true, 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b'),
('p1111111-1111-1111-1111-111111111115', '11111111-1111-1111-1111-111111111111', 'Earphones', 'Premium quality wired earphones', 800, 20, true, 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b');

-- Insert products for Sharma Clothing Store
INSERT INTO public.products (id, shop_id, name, description, price, discount, availability, image_url) VALUES
('p2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'Cotton Shirt', 'Comfortable cotton shirt for daily wear', 500, 10, true, 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07'),
('p2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Jeans', 'Stylish denim jeans for men and women', 1200, 25, true, 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07'),
('p2222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', 'Kurta', 'Traditional Indian kurta in various colors', 800, 0, true, 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07'),
('p2222222-2222-2222-2222-222222222224', '22222222-2222-2222-2222-222222222222', 'Saree', 'Beautiful silk saree for special occasions', 2000, 15, true, 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07'),
('p2222222-2222-2222-2222-222222222225', '22222222-2222-2222-2222-222222222222', 'Jacket', 'Warm winter jacket for cold weather', 1500, 30, true, 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07');

-- Insert products for Gupta General Store
INSERT INTO public.products (id, shop_id, name, description, price, discount, availability, image_url) VALUES
('p3333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333333', 'Rice (1kg)', 'Premium quality basmati rice', 60, 0, true, 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21'),
('p3333333-3333-3333-3333-333333333332', '33333333-3333-3333-3333-333333333333', 'Cooking Oil', 'Refined sunflower cooking oil 1L', 150, 5, true, 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21'),
('p3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Soap', 'Antibacterial bathing soap', 25, 0, true, 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21'),
('p3333333-3333-3333-3333-333333333334', '33333333-3333-3333-3333-333333333333', 'Shampoo', 'Herbal shampoo for all hair types', 120, 10, true, 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21'),
('p3333333-3333-3333-3333-333333333335', '33333333-3333-3333-3333-333333333333', 'Biscuits', 'Delicious cream biscuits pack', 40, 15, true, 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21');