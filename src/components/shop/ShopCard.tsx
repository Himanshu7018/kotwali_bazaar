import { MapPin, Phone, Clock, Package } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Shop {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  contact_phone: string;
  address?: string;
  operating_hours?: any;
  productCount?: number;
}

interface ShopCardProps {
  shop: Shop;
  onViewShop?: (shopId: string) => void;
}

export function ShopCard({ shop, onViewShop }: ShopCardProps) {
  const handleViewShop = () => {
    window.location.href = `/shop/${shop.id}`;
  };

  return (
    <Card className="bg-gradient-card hover:shadow-medium transition-all duration-300 transform hover:scale-[1.02] overflow-hidden group">
      <div className="aspect-video relative overflow-hidden">
        {shop.image_url ? (
          <img
            src={shop.image_url}
            alt={shop.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Package className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        
        {/* Product Count Badge */}
        {shop.productCount !== undefined && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs">
              {shop.productCount} Products
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <h3 className="font-bold text-lg text-card-foreground line-clamp-1">
            {shop.name}
          </h3>
          
          {shop.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {shop.description}
            </p>
          )}

          {/* Contact Info */}
          <div className="space-y-2">
            {shop.contact_phone && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Phone className="h-3 w-3 mr-2" />
                {shop.contact_phone}
              </div>
            )}

            {shop.address && (
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 mr-2" />
                <span className="line-clamp-1">{shop.address}</span>
              </div>
            )}

            {shop.operating_hours && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-2" />
                <span>
                  {typeof shop.operating_hours === 'string' 
                    ? shop.operating_hours 
                    : "See shop details"
                  }
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleViewShop}
          variant="marketplace"
          className="w-full"
        >
          View Shop
        </Button>
      </CardFooter>
    </Card>
  );
}