import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  category_id: string;
  availability: boolean;
  image_url?: string;
}

interface UnifiedRequestData {
  shop_update?: {
    name?: string;
    description?: string;
    contact_phone?: string;
    contact_email?: string;
    address?: string;
    image_url?: string;
  };
  products?: {
    add?: Product[];
    update?: Product[];
    delete?: string[];
  };
}

interface UnifiedRequestViewerProps {
  requestData: UnifiedRequestData;
  vendorEmail: string;
  shopName?: string;
}

export function UnifiedRequestViewer({ requestData, vendorEmail, shopName }: UnifiedRequestViewerProps) {
  const { shop_update, products } = requestData;

  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto">
      {/* Header Info */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">Unified Update Request</h3>
          <p className="text-sm text-muted-foreground">From: {vendorEmail}</p>
          {shopName && <p className="text-sm text-muted-foreground">Shop: {shopName}</p>}
        </div>
      </div>

      {/* Shop Updates */}
      {shop_update && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shop Details Update</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {shop_update.image_url && (
              <div>
                <p className="text-sm font-medium">Shop Image</p>
                <img 
                  src={shop_update.image_url} 
                  alt="Shop" 
                  className="w-full h-32 object-cover rounded mt-1"
                />
              </div>
            )}
            {shop_update.name && (
              <div>
                <p className="text-sm font-medium">Shop Name</p>
                <p className="text-sm text-muted-foreground">{shop_update.name}</p>
              </div>
            )}
            {shop_update.description && (
              <div>
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm text-muted-foreground">{shop_update.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {shop_update.contact_phone && (
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{shop_update.contact_phone}</p>
                </div>
              )}
              {shop_update.contact_email && (
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{shop_update.contact_email}</p>
                </div>
              )}
            </div>
            {shop_update.address && (
              <div>
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm text-muted-foreground">{shop_update.address}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Product Changes */}
      {products && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Product Changes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* New Products */}
            {products.add && products.add.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="font-medium text-sm">New Products</h4>
                  <Badge variant="secondary">{products.add.length}</Badge>
                </div>
                <div className="grid gap-3">
                  {products.add.map((product, index) => (
                    <Card key={index} className="p-3">
                      <div className="space-y-2">
                        {product.image_url && (
                          <img 
                            src={product.image_url} 
                            alt={product.name} 
                            className="w-full h-24 object-cover rounded"
                          />
                        )}
                        <div className="flex justify-between items-start">
                          <h5 className="font-medium text-sm">{product.name}</h5>
                          <Badge variant="outline" className="text-xs">New</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{product.description}</p>
                        <div className="flex gap-4 text-xs">
                          <span><strong>Price:</strong> ₹{product.price}</span>
                          {product.discount > 0 && (
                            <span><strong>Discount:</strong> {product.discount}%</span>
                          )}
                          <span><strong>Available:</strong> {product.availability ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Updated Products */}
            {products.update && products.update.length > 0 && (
              <>
                {products.add && products.add.length > 0 && <Separator />}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="font-medium text-sm">Updated Products</h4>
                    <Badge variant="secondary">{products.update.length}</Badge>
                  </div>
                  <div className="grid gap-3">
                    {products.update.map((product, index) => (
                      <Card key={index} className="p-3">
                        <div className="space-y-2">
                          {product.image_url && (
                            <img 
                              src={product.image_url} 
                              alt={product.name} 
                              className="w-full h-24 object-cover rounded"
                            />
                          )}
                          <div className="flex justify-between items-start">
                            <h5 className="font-medium text-sm">{product.name}</h5>
                            <Badge variant="outline" className="text-xs">Updated</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{product.description}</p>
                          <div className="flex gap-4 text-xs">
                            <span><strong>Price:</strong> ₹{product.price}</span>
                            {product.discount > 0 && (
                              <span><strong>Discount:</strong> {product.discount}%</span>
                            )}
                            <span><strong>Available:</strong> {product.availability ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Deleted Products */}
            {products.delete && products.delete.length > 0 && (
              <>
                {((products.add && products.add.length > 0) || (products.update && products.update.length > 0)) && <Separator />}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="font-medium text-sm">Products to Delete</h4>
                    <Badge variant="destructive">{products.delete.length}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {products.delete.length} product(s) will be permanently deleted.
                  </div>
                </div>
              </>
            )}

            {(!products.add || products.add.length === 0) && 
             (!products.update || products.update.length === 0) && 
             (!products.delete || products.delete.length === 0) && (
              <p className="text-sm text-muted-foreground">No product changes in this request.</p>
            )}
          </CardContent>
        </Card>
      )}

      {!shop_update && !products && (
        <p className="text-sm text-muted-foreground">No changes found in this request.</p>
      )}
    </div>
  );
}