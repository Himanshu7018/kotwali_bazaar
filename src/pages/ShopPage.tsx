import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/product/ProductCard';
import { Phone, Mail, MapPin, Clock, MessageCircle, Truck, Store, Zap } from 'lucide-react';

interface Shop {
  id: string;
  name: string;
  description: string;
  image_url: string;
  contact_phone: string;
  contact_email: string;
  address: string;
  operating_hours: any;
  status: string;
  is_active: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  image_url: string;
  availability: boolean;
  shop_id: string;
}

export default function ShopPage() {
  const { shopId } = useParams();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (shopId) {
      fetchShopData();
    }
  }, [shopId]);

  const fetchShopData = async () => {
    try {
      // Fetch shop details
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('*')
        .eq('id', shopId)
        .in('status', ['approved', 'pending'])
        .eq('is_active', true)
        .single();

      if (shopError) throw shopError;
      setShop(shopData);

      // Fetch shop products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shopId)
        .eq('availability', true);

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching shop data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = (productName?: string) => {
    if (!shop?.contact_phone) return;
    
    const message = productName 
      ? `Hi, I'm interested in ${productName} from your shop ${shop.name}`
      : `Hi, I'd like to know more about your shop ${shop.name}`;
    
    const whatsappUrl = `https://wa.me/${shop.contact_phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  if (!shop) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Shop Not Found</h1>
          <p className="text-muted-foreground">The shop you're looking for doesn't exist or is not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Shop Header */}
      <Card className="border-0 shadow-lg">
        <CardContent className="md:p-8 p-2">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shop Image */}
            <div className="lg:col-span-1">
              {shop.image_url ? (
                <img 
                  src={shop.image_url} 
                  alt={shop.name}
                  className="w-full h-64 object-cover rounded-xl shadow-md"
                />
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Store className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <span className="text-gray-500 font-medium">Shop Image</span>
                  </div>
                </div>
              )}
            </div>

            {/* Shop Details */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="md:text-4xl text-2xl font-bold font-poppins text-gray-900">{shop.name}</h1>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Verified
                  </Badge>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">{shop.description}</p>
              </div>

              {/* Services & Delivery Options - Blinkit Style */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                  Services Available
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MessageCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">WhatsApp Orders</p>
                      <p className="text-sm text-gray-600">Quick ordering via chat</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Phone Support</p>
                      <p className="text-sm text-gray-600">Direct customer service</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Store className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Pickup Available</p>
                      <p className="text-sm text-gray-600">Collect from store</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Truck className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Local Delivery</p>
                      <p className="text-sm text-gray-600">Within service area</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shop.contact_phone && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-gray-900">{shop.contact_phone}</p>
                      <p className="text-sm text-gray-600">Phone</p>
                    </div>
                  </div>
                )}
                {shop.contact_email && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-gray-900">{shop.contact_email}</p>
                      <p className="text-sm text-gray-600">Email</p>
                    </div>
                  </div>
                )}
                {shop.address && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg md:col-span-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-gray-900">{shop.address}</p>
                      <p className="text-sm text-gray-600">Address</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Operating Hours */}
              {shop.operating_hours && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-gray-900">Open Today</p>
                    <p className="text-sm text-gray-600">Check operating hours</p>
                  </div>
                </div>
              )}

              {/* Contact Button */}
              <Button 
                onClick={() => openWhatsApp()}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                <MessageCircle className="h-5 w-5 mr-3" />
                Start WhatsApp Conversation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Products ({products.length})</h2>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={{
                  ...product,
                  shop: {
                    id: shop.id,
                    name: shop.name,
                    contact_phone: shop.contact_phone
                  }
                }} 
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">No Products Available</h3>
              <p className="text-muted-foreground mb-4">
                This shop doesn't have any products listed at the moment.
              </p>
              <Button onClick={() => openWhatsApp()}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Shop
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}