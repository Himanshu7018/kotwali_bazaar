-- Add owner_name field to vendors table
ALTER TABLE public.vendors 
ADD COLUMN owner_name TEXT;