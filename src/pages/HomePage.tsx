import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Store, Package, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ProductCard } from '@/components/product/ProductCard';
import { ShopCard } from '@/components/shop/ShopCard';
import { supabase } from '@/integrations/supabase/client';
import heroImage from '@/assets/hero-marketplace.jpg';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  image_url: string;
  availability: boolean;
  shop: {
    id: string;
    name: string;
    contact_phone: string;
  };
  category: {
    name: string;
  };
}

interface Shop {
  id: string;
  name: string;
  description: string;
  image_url: string;
  contact_phone: string;
  address: string;
  productCount: number;
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredShops, setFeaturedShops] = useState<Shop[]>([]);
  const [stats, setStats] = useState({ shops: 0, products: 0, categories: 8 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch featured products
      const { data: products } = await supabase
        .from('products')
        .select(`
          *,
          shop:shops!inner(id, name, contact_phone, status, is_active),
          category:categories(name)
        `)
        .in('shop.status', ['approved', 'pending'])
        .eq('shop.is_active', true)
        .eq('availability', true)
        .limit(8);

      if (products) {
        setFeaturedProducts(products as any);
      }

      // Fetch featured shops with product counts
      const { data: shops } = await supabase
        .from('shops')
        .select(`
          *,
          products(count)
        `)
        .in('status', ['approved', 'pending'])
        .eq('is_active', true)
        .limit(6);

      if (shops) {
        const shopsWithCounts = shops.map(shop => ({
          ...shop,
          productCount: shop.products?.[0]?.count || 0
        }));
        setFeaturedShops(shopsWithCounts as any);
      }

      // Fetch stats
      const [shopsCount, productsCount] = await Promise.all([
        supabase.from('shops').select('id', { count: 'exact' }).in('status', ['approved', 'pending']).eq('is_active', true),
        supabase.from('products').select('id', { count: 'exact' }).eq('availability', true)
      ]);

      setStats({
        shops: shopsCount.count || 0,
        products: productsCount.count || 0,
        categories: 8
      });

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleShopClick = (shopId: string) => {
    navigate(`/shop/${shopId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Kotwali Bazaar"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Welcome to Kotwali Bazaar
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90 animate-fade-in">
              Discover local shops, connect with trusted vendors, and find everything you need 
              in your neighborhood marketplace.
            </p>
            
            {/* Hero Search */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto animate-fade-in">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search products and shops..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 text-base bg-background/90 backdrop-blur border-primary-glow/30 text-black"
                />
              </div>
              <Button type="submit" variant="hero" size="lg" className="h-12">
                Search Now
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-md-16 py-10 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="text-center shadow-soft">
              <CardContent className="p-6">
                <Store className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-primary mb-2">{stats.shops}</h3>
                <p className="text-muted-foreground">Active Shops</p>
              </CardContent>
            </Card>
            
            <Card className="text-center shadow-soft">
              <CardContent className="p-6">
                <Package className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-primary mb-2">{stats.products}</h3>
                <p className="text-muted-foreground">Available Products</p>
              </CardContent>
            </Card>
            
            <Card className="text-center shadow-soft">
              <CardContent className="p-6">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-primary mb-2">{stats.categories}</h3>
                <p className="text-muted-foreground">Categories</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-md-16 py-10 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Featured Products</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover the latest and most popular products from our trusted local vendors
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onShopClick={handleShopClick}
              />
            ))}
          </div>

          <div className="text-center">
            <Button asChild variant="marketplace" size="lg">
              <span className="cursor-pointer" onClick={() => navigate('/search')}>
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Shops */}
      <section className="py-md-16 py-10 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Popular Shops</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse our most popular local shops and discover unique products
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredShops.map((shop) => (
              <ShopCard
                key={shop.id}
                shop={shop}
                onViewShop={handleShopClick}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto text-primary-foreground">
            <h2 className="text-3xl font-bold mb-4">
              Connect with Local Vendors
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Experience the convenience of local shopping with instant WhatsApp connectivity
            </p>
            <Button asChild variant="hero" size="lg">
              <span className="cursor-pointer" onClick={() => navigate('/search')}>
                Start Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}