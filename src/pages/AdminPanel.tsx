import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Store, 
  Package, 
  UserCheck, 
  UserX, 
  Check, 
  X, 
  Plus,
  Eye,
  Ban,
  CheckCircle
} from 'lucide-react';
import { UnifiedRequestViewer } from '@/components/admin/UnifiedRequestViewer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Vendor {
  id: string;
  email: string;
  is_blocked: boolean;
  created_at: string;
  vendor_name:string;
  shops?: {
    id: string;
    name: string;
    status: string;
    is_active: boolean;
  };
}

interface ChangeRequest {
  id: string;
  vendor_id: string;
  request_type: string;
  request_data: any;
  status: string;
  admin_notes: string;
  created_at: string;
  vendors?: {
    email: string;
    shops?: {
      name: string;
    };
  };
}

export default function AdminPanel() {
  const { userRole } = useAuth();
  const { toast } = useToast();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVendorDialogOpen, setIsVendorDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);

  useEffect(() => {
    if (userRole === 'admin') {
      fetchAdminData();
    }
  }, [userRole]);

  const fetchAdminData = async () => {
    try {
      // Fetch vendors with their shops
      const { data: vendorsData } = await supabase
        .from('vendors')
        .select(`
          *,
          shops:shop_id (
            id,
            name,
            status,
            is_active
          )
        `)
        .order('created_at', { ascending: false });
      console.log("vendorsData",vendorsData)
      setVendors((vendorsData || []) as any);

      // Fetch change requests
      const { data: requestsData } = await supabase
        .from('change_requests')
        .select(`
          *,
          vendors (
            email,
            shops:shop_id (
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      setChangeRequests(requestsData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createVendor = async (formData: FormData) => {
    try {
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      const shopName = formData.get('shopName') as string;
      const contactPhone = formData.get('contactPhone') as string;
      const vendorName = formData.get('ownerName') as string;
      // Create user in Supabase Auth using signUp
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });

      if (authError) throw authError;

      // Create shop
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .insert({
          name: shopName,
          contact_phone: contactPhone,
          status: 'approved',
          
        })
        .select()
        .single();

      if (shopError) throw shopError;

      // Create vendor
      await supabase.from('vendors').insert({
        user_id: authData.user.id,
        email,
        shop_id: shopData.id,
        vendor_name:vendorName
      });

      // Assign vendor role
      await supabase.from('user_roles').insert({
        user_id: authData.user.id,
        role: 'vendor'
      });

      toast({
        title: "Vendor Created",
        description: `Vendor ${email} has been created successfully.`
      });

      setIsVendorDialogOpen(false);
      fetchAdminData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create vendor.",
        variant: "destructive"
      });
    }
  };

  const toggleVendorBlock = async (vendorId: string, isBlocked: boolean) => {
    try {
      await supabase
        .from('vendors')
        .update({ is_blocked: !isBlocked })
        .eq('id', vendorId);

      setVendors(vendors.map(v => 
        v.id === vendorId ? { ...v, is_blocked: !isBlocked } : v
      ));

      toast({
        title: `Vendor ${!isBlocked ? 'Blocked' : 'Unblocked'}`,
        description: `Vendor has been ${!isBlocked ? 'blocked' : 'unblocked'} successfully.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update vendor status.",
        variant: "destructive"
      });
    }
  };

  // Helper function to delete image from Supabase storage
  const deleteImageFromStorage = async (imageUrl: string) => {
    if (!imageUrl) return;

    try {
      // Extract file path from public URL
      // URL format: https://[project-ref].supabase.co/storage/v1/object/public/marketplace-images/[file-path]
      const urlParts = imageUrl.split('/storage/v1/object/public/marketplace-images/');
      if (urlParts.length === 2) {
        const filePath = urlParts[1];
        await supabase.storage
          .from('marketplace-images')
          .remove([filePath]);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  // Helper function to rename image from -pending to -approved in Supabase storage
  const renameImageToApproved = async (imageUrl: string): Promise<string | null> => {
    if (!imageUrl || !imageUrl.includes('-pending')) return imageUrl;

    try {
      // Extract file path from public URL
      const urlParts = imageUrl.split('/storage/v1/object/public/marketplace-images/');
      if (urlParts.length !== 2) return imageUrl;

      const oldFilePath = urlParts[1];
      const newFilePath = oldFilePath.replace('-pending', '-approved');

      // Copy the file to new name
      const { data: copyData, error: copyError } = await supabase.storage
        .from('marketplace-images')
        .copy(oldFilePath, newFilePath);

      if (copyError) throw copyError;

      // Delete the old file
      await supabase.storage
        .from('marketplace-images')
        .remove([oldFilePath]);

      // Return the new public URL
      const { data: { publicUrl } } = supabase.storage
        .from('marketplace-images')
        .getPublicUrl(newFilePath);

      return publicUrl;
    } catch (error) {
      console.error('Error renaming image:', error);
      return imageUrl; // Return original URL if rename fails
    }
  };

  const handleChangeRequest = async (requestId: string, action: 'approve' | 'reject', notes?: string) => {
    try {
      const request = changeRequests.find(r => r.id === requestId);
      if (!request) return;

      if (action === 'approve') {
        // Apply the changes based on request type
        if (request.request_type === 'shop_update') {
          const vendor = await supabase
            .from('vendors')
            .select('shop_id')
            .eq('id', request.vendor_id)
            .single();

          await supabase
            .from('shops')
            .update(request.request_data)
            .eq('id', vendor.data?.shop_id);
        } else if (request.request_type === 'product_add') {
          const vendor = await supabase
            .from('vendors')
            .select('shop_id')
            .eq('id', request.vendor_id)
            .single();

          await supabase
            .from('products')
            .insert({
              ...request.request_data,
              shop_id: vendor.data?.shop_id
            });
        } else if (request.request_type === 'product_update') {
          const { product_id, ...updateData } = request.request_data;
          await supabase
            .from('products')
            .update(updateData)
            .eq('id', product_id);
        } else if (request.request_type === 'unified_update') {
          const vendor = await supabase
            .from('vendors')
            .select('shop_id')
            .eq('id', request.vendor_id)
            .single();

          const shopId = vendor.data?.shop_id;
          if (!shopId) return;

          // Handle shop updates - delete old image if changed, rename pending images to approved
          if (request.request_data.shop_update) {
            const shopUpdateData = { ...request.request_data.shop_update };

            // Rename shop image if it's pending
            if (shopUpdateData.image_url && shopUpdateData.image_url.includes('-pending')) {
              shopUpdateData.image_url = await renameImageToApproved(shopUpdateData.image_url);
            }

            const { data: currentShop } = await supabase
              .from('shops')
              .select('image_url')
              .eq('id', shopId)
              .single();

            if (currentShop?.image_url && shopUpdateData.image_url &&
                currentShop.image_url !== shopUpdateData.image_url) {
              await deleteImageFromStorage(currentShop.image_url);
            }

            await supabase
              .from('shops')
              .update(shopUpdateData)
              .eq('id', shopId);
          }

          // Handle product operations
          const { products } = request.request_data;

          // Add new products - rename pending images to approved
          if (products.add && products.add.length > 0) {
            const processedProducts = await Promise.all(products.add.map(async (product: any) => {
              const processedProduct = { ...product, shop_id: shopId };
              if (processedProduct.image_url && processedProduct.image_url.includes('-pending')) {
                processedProduct.image_url = await renameImageToApproved(processedProduct.image_url);
              }
              return processedProduct;
            }));

            await supabase
              .from('products')
              .insert(processedProducts);
          }

          // Update existing products - delete old images if changed, rename pending images to approved
          if (products.update && products.update.length > 0) {
            for (const product of products.update) {
              const { id, ...updateData } = product;
              const processedUpdateData = { ...updateData };

              // Rename product image if it's pending
              if (processedUpdateData.image_url && processedUpdateData.image_url.includes('-pending')) {
                processedUpdateData.image_url = await renameImageToApproved(processedUpdateData.image_url);
              }

              // Fetch current product to check if image changed
              const { data: currentProduct } = await supabase
                .from('products')
                .select('image_url')
                .eq('id', id)
                .single();

              if (currentProduct?.image_url && processedUpdateData.image_url &&
                  currentProduct.image_url !== processedUpdateData.image_url) {
                await deleteImageFromStorage(currentProduct.image_url);
              }

              await supabase
                .from('products')
                .update(processedUpdateData)
                .eq('id', id);
            }
          }

          // Delete products - delete their images first
          if (products.delete && products.delete.length > 0) {
            // Fetch products to get their image URLs before deletion
            const { data: productsToDelete } = await supabase
              .from('products')
              .select('id, image_url')
              .in('id', products.delete);

            // Delete images
            if (productsToDelete) {
              for (const product of productsToDelete) {
                if (product.image_url) {
                  await deleteImageFromStorage(product.image_url);
                }
              }
            }

            // Delete products from database
            await supabase
              .from('products')
              .delete()
              .in('id', products.delete);
          }
        }
      }

      // Delete approved requests, update rejected ones
      if (action === 'approve') {
        await supabase
          .from('change_requests')
          .delete()
          .eq('id', requestId);
      } else {
        await supabase
          .from('change_requests')
          .update({
            status: 'rejected',
            admin_notes: notes || '',
            reviewed_at: new Date().toISOString()
          })
          .eq('id', requestId);
      }

      toast({
        title: `Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        description: `Change request has been ${action === 'approve' ? 'approved' : 'rejected'}.`
      });

      fetchAdminData();
      setSelectedRequest(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process change request.",
        variant: "destructive"
      });
    }
  };

  if (userRole !== 'admin') {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="md:text-3xl text-xl font-bold">Admin Panel</h1>
        <Badge variant="default">Administrator</Badge>
      </div>

      <Tabs defaultValue="vendors" className="space-y-6 w-full overflow-x-auto">
      <div className="w-full overflow-x-auto">
        <TabsList>
          <TabsTrigger value="vendors" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Vendors ({vendors.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Change Requests ({changeRequests.filter(r => r.status === 'pending').length})
          </TabsTrigger>
        </TabsList>
       </div>
        <TabsContent value="vendors">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle >Vendor Management</CardTitle>
              <Dialog open={isVendorDialogOpen} onOpenChange={setIsVendorDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Vendor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Vendor</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    createVendor(new FormData(e.target as HTMLFormElement));
                  }} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="shopName">Shop Name</Label>
                      <Input id="shopName" name="shopName" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ownerName">Owner Name</Label>
                      <Input id="ownerName" name="ownerName" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input id="contactPhone" name="contactPhone" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Temporary Password</Label>
                      <Input defaultValue='123456' id="password" name="password" required />
                    </div>
                    
                    <Button type="submit" className="w-full">Create Vendor</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                   <TableHead>Shop Name</TableHead>
                   <TableHead>Vendor Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell>
                        {vendor.shops ? (
                          <div>
                            <p className="font-medium">{vendor.shops.name}</p>
                            {/* <Badge variant={vendor.shops.status === 'approved' ? 'default' : 'secondary'}>
                              {vendor.shops.status}
                            </Badge> */}
                          </div>
                        ) : (
                          'No shop'
                        )}
                      </TableCell>
                      <TableCell>
                      <p className="font-medium">{vendor.vendor_name}</p>
                      </TableCell>
                      <TableCell>{vendor.email}</TableCell>
                      
                      <TableCell>
                        <Badge variant={vendor.is_blocked ? 'destructive' : 'default'}>
                          {vendor.is_blocked ? 'Blocked' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(vendor.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={vendor.is_blocked ? "outline" : "destructive"}
                          size="sm"
                          onClick={() => toggleVendorBlock(vendor.id, vendor.is_blocked)}
                        >
                          {vendor.is_blocked ? (
                            <>
                              <UserCheck className="h-4 w-4 mr-1" />
                              Unblock
                            </>
                          ) : (
                            <>
                              <UserX className="h-4 w-4 mr-1" />
                              Block
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                {changeRequests.filter(r => r.status === 'pending').map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex flex-col md:flex-row justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold capitalize">
                            {request.request_type.replace('_', ' ')}
                          </h4>
                          <Badge variant="secondary">{request.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          From: {request.vendors?.email}
                          {request.vendors?.shops?.name && ` (${request.vendors.shops.name})`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2 md:mt-0 mt-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh]">
                            <DialogHeader>
                              <DialogTitle>Request Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              {request.request_type === 'unified_update' ? (
                                <UnifiedRequestViewer 
                                  requestData={request.request_data}
                                  vendorEmail={request.vendors?.email || 'Unknown'}
                                  shopName={request.vendors?.shops?.name}
                                />
                              ) : (
                                <div className="space-y-4">
                                  <h4 className="font-medium capitalize">
                                    {request.request_type.replace('_', ' ')} Request
                                  </h4>
                                  <pre className="bg-muted p-4 rounded text-sm overflow-auto max-h-60">
                                    {JSON.stringify(request.request_data, null, 2)}
                                  </pre>
                                </div>
                              )}
                              <div className="flex gap-2 pt-4 border-t">
                                <Button 
                                  onClick={() => handleChangeRequest(request.id, 'approve')}
                                  className="flex-1"
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                                <Button 
                                  variant="destructive"
                                  onClick={() => handleChangeRequest(request.id, 'reject')}
                                  className="flex-1"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          size="sm"
                          onClick={() => handleChangeRequest(request.id, 'approve')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive"
                          size="sm"
                          onClick={() => handleChangeRequest(request.id, 'reject')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {changeRequests.filter(r => r.status === 'pending').length === 0 && (
                  <p className="text-muted-foreground">No pending change requests.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}