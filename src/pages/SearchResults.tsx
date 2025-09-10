import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ProductCard } from '@/components/product/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

interface Category {
  id: string;
  name: string;
}

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [priceRange, setPriceRange] = useState(searchParams.get('price') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    searchProducts();
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (data) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const searchProducts = async () => {
    setLoading(true);
    try {
      // First, get shop IDs that match the search term
      let shopIds: string[] = [];
      const searchTerm = searchParams.get('q');

      if (searchTerm) {
        const { data: shops } = await supabase
          .from('shops')
          .select('id')
          .ilike('name', `%${searchTerm}%`);

        shopIds = shops?.map(shop => shop.id) || [];
      }

      let query = supabase
        .from('products')
        .select(`
          *,
          shop:shops(id, name, contact_phone),
          category:categories(id, name)
        `)
        .eq('availability', true);

      // Search filter (product name, description, and shop name)
      if (searchTerm) {
        // Search in product name and description, or by shop IDs
        query = query.or(
          `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
        );

        if (shopIds.length > 0) {
          query = query.or(`shop_id.in.(${shopIds.join(',')})`);
        }
      }

      // Category filter
      const category = searchParams.get('category');
      if (category && category !== 'all_categories') {
        const selectedCat = categories.find(cat => cat.name === category);
        if (selectedCat) {
          query = query.eq('category_id', selectedCat.id);
        }
      }

      // Price filter
      const price = searchParams.get('price');
      if (price && price !== 'all_prices') {
        const [min, max] = price.split('-').map(Number);
        if (min) query = query.gte('price', min);
        if (max) query = query.lte('price', max);
      }

      // Sorting
      const sort = searchParams.get('sort') || 'name';
      switch (sort) {
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('name', { ascending: true });
      }

      const { data } = await query;
      
      if (data) {
        setProducts(data as any);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams({ q: searchQuery });
  };

  const updateSearchParams = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  };

  const handleShopClick = (shopId: string) => {
    navigate(`/shop/${shopId}`);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setPriceRange('');
    setSortBy('name');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gradient-subtle py-8">
      <div className="container mx-auto px-4">
        {/* Search Header */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products and shops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <Button type="submit" variant="default">
              Search
            </Button>
          </form>
          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {searchParams.get('q') ? `Search Results for "${searchParams.get('q')}"` : 'All Products'}
              </h1>
              <p className="text-muted-foreground">
                {loading ? 'Searching...' : `${products.length} products found`}
              </p>
            </div>            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </h3>
                  <Button variant="link" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
                <div className="space-y-6">
                  {/* Category Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select value={selectedCategory} onValueChange={(value) => {
                      setSelectedCategory(value);
                      updateSearchParams({ category: value });
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_categories">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Price Range Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price Range</label>
                    <Select value={priceRange} onValueChange={(value) => {
                      setPriceRange(value);
                      updateSearchParams({ price: value });
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any Price" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_prices">Any Price</SelectItem>
                        <SelectItem value="0-100">₹0 - ₹100</SelectItem>
                        <SelectItem value="100-500">₹100 - ₹500</SelectItem>
                        <SelectItem value="500-1000">₹500 - ₹1,000</SelectItem>
                        <SelectItem value="1000-5000">₹1,000 - ₹5,000</SelectItem>
                        <SelectItem value="5000-">₹5,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Sort Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    <Select value={sortBy} onValueChange={(value) => {
                      setSortBy(value);
                      updateSearchParams({ sort: value });
                    }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name (A-Z)</SelectItem>
                        <SelectItem value="price-low">Price (Low to High)</SelectItem>
                        <SelectItem value="price-high">Price (High to Low)</SelectItem>
                        <SelectItem value="newest">Newest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-square bg-muted"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search terms or filters
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' 
                : 'space-y-4'
              }>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onShopClick={handleShopClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
