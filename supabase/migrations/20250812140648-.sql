-- Add direct stock update functionality for vendors
-- Allow vendors to toggle product availability without admin approval
-- This is for real-time stock management

-- Create function to update product availability by vendor
CREATE OR REPLACE FUNCTION public.update_product_availability(
  product_id uuid,
  new_availability boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  vendor_user_id uuid;
BEGIN
  -- Get the current user's vendor ID and verify ownership
  SELECT v.user_id INTO vendor_user_id
  FROM vendors v
  JOIN products p ON p.shop_id = v.shop_id
  WHERE p.id = product_id
    AND v.user_id = auth.uid()
    AND v.is_blocked = false;
  
  -- If vendor owns the product, update availability
  IF vendor_user_id IS NOT NULL THEN
    UPDATE products 
    SET availability = new_availability, updated_at = now()
    WHERE id = product_id;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;