-- Add new fields to shops table
ALTER TABLE public.shops 
ADD COLUMN google_maps_link text,
ADD COLUMN google_rating_link text,
ADD COLUMN services_offered text[] DEFAULT '{}';

-- Add new fields to products table  
ALTER TABLE public.products
ADD COLUMN quantity integer DEFAULT 0,
ADD COLUMN is_vegetarian boolean DEFAULT true;

-- Add check constraint for quantity
ALTER TABLE public.products 
ADD CONSTRAINT products_quantity_positive CHECK (quantity >= 0);