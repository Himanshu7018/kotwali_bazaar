-- Create enum types
CREATE TYPE public.shop_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.change_request_type AS ENUM ('shop_update', 'product_add', 'product_update', 'product_delete');
CREATE TYPE public.change_request_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.user_role AS ENUM ('admin', 'vendor');

-- Create categories table
CREATE TABLE public.categories (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create shops table
CREATE TABLE public.shops (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    contact_phone TEXT NOT NULL,
    contact_email TEXT,
    address TEXT,
    operating_hours JSONB,
    status shop_status NOT NULL DEFAULT 'pending',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vendors table
CREATE TABLE public.vendors (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    shop_id UUID REFERENCES public.shops(id) ON DELETE SET NULL,
    is_blocked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    discount DECIMAL(5,2) DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
    image_url TEXT,
    availability BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create change_requests table
CREATE TABLE public.change_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    request_type change_request_type NOT NULL,
    request_data JSONB NOT NULL,
    status change_request_status NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id)
);

-- Create user_roles table for admin management
CREATE TABLE public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, role)
);

-- Insert default categories
INSERT INTO public.categories (name, description) VALUES
('Groceries', 'Daily household groceries and essentials'),
('Clothing', 'Traditional and modern clothing'),
('Electronics', 'Mobile phones, accessories, and gadgets'),
('Books & Stationery', 'Books, notebooks, and office supplies'),
('Food & Beverages', 'Ready to eat food and drinks'),
('Home & Kitchen', 'Home appliances and kitchen items'),
('Health & Beauty', 'Personal care and beauty products'),
('Sports & Fitness', 'Sports equipment and fitness accessories');

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get current vendor
CREATE OR REPLACE FUNCTION public.get_current_vendor()
RETURNS TABLE(vendor_id UUID, shop_id UUID, is_blocked BOOLEAN)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT v.id, v.shop_id, v.is_blocked
  FROM public.vendors v
  WHERE v.user_id = auth.uid()
$$;

-- RLS Policies for categories (public read access)
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage categories" 
ON public.categories FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for shops (public can view approved shops)
CREATE POLICY "Approved active shops are viewable by everyone" 
ON public.shops FOR SELECT 
USING (status = 'approved' AND is_active = true);

CREATE POLICY "Vendors can view their own shop" 
ON public.shops FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.vendors v 
    WHERE v.user_id = auth.uid() 
    AND v.shop_id = shops.id
  )
);

CREATE POLICY "Admins can view all shops" 
ON public.shops FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all shops" 
ON public.shops FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for vendors
CREATE POLICY "Vendors can view their own profile" 
ON public.vendors FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all vendors" 
ON public.vendors FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for products (public can view products from approved shops)
CREATE POLICY "Products from approved shops are viewable by everyone" 
ON public.products FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.shops s 
    WHERE s.id = products.shop_id 
    AND s.status = 'approved' 
    AND s.is_active = true
  )
);

CREATE POLICY "Vendors can view their own products" 
ON public.products FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.vendors v 
    WHERE v.user_id = auth.uid() 
    AND v.shop_id = products.shop_id
  )
);

CREATE POLICY "Admins can view all products" 
ON public.products FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all products" 
ON public.products FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for change requests
CREATE POLICY "Vendors can view their own change requests" 
ON public.change_requests FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.vendors v 
    WHERE v.user_id = auth.uid() 
    AND v.id = change_requests.vendor_id
  )
);

CREATE POLICY "Vendors can create change requests" 
ON public.change_requests FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.vendors v 
    WHERE v.user_id = auth.uid() 
    AND v.id = change_requests.vendor_id 
    AND v.is_blocked = false
  )
);

CREATE POLICY "Admins can manage all change requests" 
ON public.change_requests FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_shops_updated_at
    BEFORE UPDATE ON public.shops
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('marketplace-images', 'marketplace-images', true);

-- Create storage policies
CREATE POLICY "Images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'marketplace-images');

CREATE POLICY "Authenticated users can upload images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'marketplace-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'marketplace-images' AND auth.role() = 'authenticated');

CREATE POLICY "Admins and owners can delete images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'marketplace-images' AND auth.role() = 'authenticated');