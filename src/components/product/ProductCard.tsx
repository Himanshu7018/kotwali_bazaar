import { MessageCircle, MapPin, Tag, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  discount?: number;
  image_url?: string;
  availability: boolean;
  shop: {
    id: string;
    name: string;
    contact_phone: string;
  };
  category?: {
    name: string;
  };
}

interface ProductCardProps {
  product: Product;
  onShopClick?: (shopId: string) => void;
}

export function ProductCard({ product, onShopClick }: ProductCardProps) {
  const discountedPrice = product.discount 
    ? product.price * (1 - product.discount / 100)
    : product.price;

  const handleWhatsAppContact = () => {
    const message = `Hi, I'm interested in ${product.name} from your shop ${product.shop.name}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${product.shop.contact_phone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShopClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onShopClick?.(product.shop.id);
  };

  return (
    <Card className="bg-white hover:shadow-lg transition-all duration-200 overflow-hidden group border border-gray-100 rounded-xl">
      <div className="aspect-[4/3] relative overflow-hidden bg-gray-50">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-50 flex items-center justify-center">
            <div className="p-6 rounded-full bg-gray-100">
              <Tag className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        )}
        
        {/* Availability Badge - Blinkit style */}
        {!product.availability && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Out of Stock
            </div>
          </div>
        )}

        {/* Discount Badge - Top left corner like Blinkit */}
        {product.discount && product.discount > 0 && (
          <div className="absolute top-2 left-2">
            <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
              {product.discount}% OFF
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Product Name - Blinkit style */}
          <h3 className="font-poppins font-semibold text-gray-800 text-sm line-clamp-2 leading-tight">
            {product.name}
          </h3>
          
          {/* Category - Small and subtle */}
          {product.category && (
            <p className="text-xs text-gray-500 font-medium">
              {product.category.name}
            </p>
          )}

          {/* Price Section - Blinkit inspired */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-1">
              <span className="font-poppins font-bold text-gray-900 text-lg">
                ₹{Math.floor(discountedPrice)}
              </span>
              {discountedPrice % 1 !== 0 && (
                <span className="font-poppins font-bold text-gray-900 text-sm">
                  .{Math.round((discountedPrice % 1) * 100)}
                </span>
              )}
              {product.discount && product.discount > 0 && (
                <span className="text-xs text-gray-400 line-through ml-1">
                  ₹{product.price}
                </span>
              )}
            </div>
            
            {/* Availability Indicator */}
            <div className="flex items-center">
              {product.availability ? (
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              ) : (
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              )}
            </div>
          </div>

          {/* Shop Info - Compact */}
          <button
            onClick={handleShopClick}
            className="flex items-center text-xs text-gray-600 hover:text-primary transition-colors"
          >
            <MapPin className="h-3 w-3 mr-1" />
            <span className="font-medium">{product.shop.name}</span>
          </button>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleWhatsAppContact}
          variant="default"
          size="sm"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg border-0"
          disabled={!product.availability}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Contact Shop
        </Button>
      </CardFooter>
    </Card>
  );
}