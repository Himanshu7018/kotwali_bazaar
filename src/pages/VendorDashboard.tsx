import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Store, Package, Edit2, RotateCcw } from 'lucide-react';
import { UnifiedVendorForm } from '@/components/vendor/UnifiedVendorForm';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Shop {
  id: string;
  name: string;
  description: string;
  image_url: string;
  contact_phone: string;
  contact_email: string;
  address: string;
  google_maps_link?: string;
  google_rating_link?: string;
  operating_hours?: any;
  services_offered?: string[];
  status: string;
  is_active: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  quantity?: number;
  is_vegetarian?: boolean;
  image_url: string;
  availability: boolean;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
}

interface ChangeRequest {
  id: string;
  request_type: string;
  status: string;
  admin_notes: string;
  created_at: string;
  request_data: any;
}

export default function VendorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUnifiedFormOpen, setIsUnifiedFormOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<ChangeRequest | null>(null);

  // Check if there's a pending change request
  const hasPendingRequest = changeRequests.some(request => request.status === 'pending');

  useEffect(() => {
    if (user) {
      fetchVendorData();
      fetchCategories();
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (data) setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchVendorData = async () => {
    try {
      // Get vendor and shop info
      const { data: vendor } = await supabase
        .from('vendors')
        .select('id, shop_id')
        .eq('user_id', user?.id)
        .single();

      if (vendor) {
        setVendorId(vendor.id);
        
        if (vendor.shop_id) {
          const { data: shopData } = await supabase
            .from('shops')
            .select('*')
            .eq('id', vendor.shop_id)
            .single();
          
          setShop(shopData);

          // Fetch products
          const { data: productsData } = await supabase
            .from('products')
            .select('*')
            .eq('shop_id', vendor.shop_id);
          
          setProducts(productsData || []);
        }

        // Fetch change requests
        const { data: requestsData } = await supabase
          .from('change_requests')
          .select('*')
          .eq('vendor_id', vendor.id)
          .order('created_at', { ascending: false });
        
        setChangeRequests(requestsData || []);
      }
    } catch (error) {
      console.error('Error fetching vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnifiedFormSubmit = () => {
    setIsUnifiedFormOpen(false);
    setEditingRequest(null);
    fetchVendorData();
  };

  const toggleProductStock = async (productId: string, currentAvailability: boolean) => {
    try {
      const { data, error } = await supabase.rpc('update_product_availability', {
        product_id: productId,
        new_availability: !currentAvailability
      });

      if (error) throw error;

      if (data) {
        toast({
          title: "Stock Updated",
          description: `Product is now ${!currentAvailability ? 'in stock' : 'out of stock'}.`
        });
        fetchVendorData();
      } else {
        throw new Error('Unauthorized');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update stock status.",
        variant: "destructive"
      });
    }
  };

  const editChangeRequest = (request: ChangeRequest) => {
    setEditingRequest(request);
    setIsUnifiedFormOpen(true);
  };

  const canEditRequest = (status: string) => {
    return status === 'pending' || status === 'rejected';
  };

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center ">
        <h1 className="md:text-3xl text-lg font-bold">Vendor Dashboard</h1>
        <div className="flex items-center gap-3 md:mt-0 mt-4 ">
          {hasPendingRequest && (
            <Badge variant="secondary" className="text-amber-600 bg-amber-50 border-amber-200">
              Change Request Pending Approval
            </Badge>
          )}
          {vendorId && (
            <Dialog open={isUnifiedFormOpen} onOpenChange={(open) => {
              setIsUnifiedFormOpen(open);
              if (!open) setEditingRequest(null);
            }}>
              <DialogTrigger asChild>
                <Button disabled={hasPendingRequest && !editingRequest}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  {hasPendingRequest ? "Edit Pending Request" : "Update Shop & Products"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
                <UnifiedVendorForm 
                  vendorId={vendorId} 
                  onSubmit={handleUnifiedFormSubmit}
                  editingRequestId={editingRequest?.id}
                  initialData={editingRequest?.request_data}
                />
              </DialogContent>
            </Dialog>
          )}
          <Badge variant={shop?.status === 'approved' ? 'default' : 'secondary'}>
            {shop?.status || 'No Shop'}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="shop" className="space-y-6 w-full overflow-x-auto">
        <div className="w-full overflow-x-auto">
        <TabsList>
          <TabsTrigger value="shop" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Shop Details
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products ({products.length})
          </TabsTrigger>
          <TabsTrigger value="requests">Change Requests</TabsTrigger>
        </TabsList>
        </div>
        <TabsContent value="shop">
          <Card>
            <CardHeader>
              <CardTitle>Shop Information</CardTitle>
            </CardHeader>
            <CardContent>
              {shop ? (
                <div className="space-y-6">
                  {shop.image_url && (
                    <div>
                      <img 
                        src={shop.image_url} 
                        alt={shop.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold">{shop.name}</h3>
                    <p className="text-muted-foreground mt-2">{shop.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">{shop.contact_phone}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{shop.contact_email || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Address</p>
                        <p className="text-sm text-muted-foreground">{shop.address || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {shop.google_maps_link && (
                        <div>
                          <p className="text-sm font-medium">Google Maps</p>
                          <a 
                            href={shop.google_maps_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            View on Google Maps
                          </a>
                        </div>
                      )}
                      {shop.google_rating_link && (
                        <div>
                          <p className="text-sm font-medium">Google Rating</p>
                          <a 
                            href={shop.google_rating_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            View Google Reviews
                          </a>
                        </div>
                      )}
                      {shop.operating_hours && (
                        <div>
                          <p className="text-sm font-medium">Operating Hours</p>
                          <div className="text-sm text-muted-foreground">
                            {Object.entries(shop.operating_hours).map(([day, hours]) => (
                              <div key={day} className="flex justify-between">
                                <span className="capitalize">{day}:</span>
                                <span>{hours as string}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {shop.services_offered && shop.services_offered.length > 0 && (
                        <div>
                          <p className="text-sm font-medium">Services Offered</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {shop.services_offered.map((service, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No shop found. Please contact admin to set up your shop.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Products ({products.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card key={product.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {product.image_url && (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold">{product.name}</h3>
                          <div className="flex gap-1">
                            {(() => {
                              // Check if product category is food-related and show veg/non-veg badge
                              const selectedCategory = categories.find(cat => cat.id === product.category_id);
                              const isFoodCategory = selectedCategory?.name?.toLowerCase().includes('food') || 
                                                     selectedCategory?.name?.toLowerCase().includes('beverage');
                              return isFoodCategory && product.is_vegetarian !== undefined ? (
                                <Badge 
                                  variant={product.is_vegetarian ? "default" : "destructive"}
                                  className="text-xs"
                                >
                                  {product.is_vegetarian ? "Veg" : "Non-Veg"}
                                </Badge>
                              ) : null;
                            })()}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-lg font-bold">₹{product.price}</span>
                              {product.discount > 0 && (
                                <span className="text-sm text-muted-foreground ml-2">
                                  ({product.discount}% off)
                                </span>
                              )}
                            </div>
                            {product.quantity !== undefined && (
                              <span className="text-sm text-muted-foreground">
                                Qty: {product.quantity}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium">
                                {product.availability ? 'In Stock' : 'Out of Stock'}
                              </label>
                              <Switch
                                checked={product.availability}
                                onCheckedChange={() => toggleProductStock(product.id, product.availability)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {products.length === 0 && (
                  <p className="text-muted-foreground col-span-3">No products found. Use the "Update Shop & Products" button to add products.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Change Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {changeRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold capitalize">
                          {request.request_type.replace('_', ' ')}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          request.status === 'approved' ? 'default' :
                          request.status === 'rejected' ? 'destructive' : 'secondary'
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                    {request.admin_notes && (
                      <div className="mt-2 p-2 bg-muted rounded">
                        <p className="text-sm font-medium">Admin Notes:</p>
                        <p className="text-sm">{request.admin_notes}</p>
                      </div>
                    )}
                    {canEditRequest(request.status) && (
                      <div className="mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editChangeRequest(request)}
                          className="flex items-center gap-2"
                        >
                          <RotateCcw className="h-4 w-4" />
                          {request.status === 'pending' ? 'Edit Pending Request' : 'Edit & Resubmit'}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {changeRequests.length === 0 && (
                  <p className="text-muted-foreground">No change requests found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}