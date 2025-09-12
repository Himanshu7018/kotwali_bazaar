import { useState, useEffect, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { Plus, Trash2, Eye, Save, Upload, X, Store, Package, MapPin, Star, ImageIcon, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

interface Shop {
  id: string;
  name: string;
  description: string;
  image_url: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  operating_hours: string | any;
  google_maps_link?: string;
  google_rating_link?: string;
  services_offered?: string[];
}

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  image_url: string;
  category_id: string;
  availability: boolean;
  quantity?: number;
  is_vegetarian?: boolean;
  _isNew?: boolean;
  _isDeleted?: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface UnifiedVendorFormProps {
  vendorId: string;
  onSubmit: () => void;
  editingRequestId?: string;
  initialData?: any;
}

interface VendorData {
  id: string;
  owner_name?: string;
  email: string;
}

export function UnifiedVendorForm({ vendorId, onSubmit, editingRequestId, initialData }: UnifiedVendorFormProps) {
  const [shop, setShop] = useState<Shop | null>(null);
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImages, setUploadingImages] = useState<{ [key: string]: boolean }>({});
  const [shopImagePreview, setShopImagePreview] = useState<string>('');
  const [productImagePreviews, setProductImagePreviews] = useState<{ [key: number]: string }>({});
  const [shopImageFile, setShopImageFile] = useState<File | null>(null);
  const [productImageFiles, setProductImageFiles] = useState<{ [key: number]: File }>({});
  const { toast } = useToast();
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Form state
  const [vendorFormData, setVendorFormData] = useState<Partial<VendorData>>({});
  const [shopFormData, setShopFormData] = useState<Partial<Shop>>({});
  const [productFormData, setProductFormData] = useState<Product[]>([]);
  const [originalProducts, setOriginalProducts] = useState<Product[]>([]);
  const [isDesktop, setIsDesktop] = useState(false);


  const availableServices = [
    'Pickup',
    'Home Delivery',
    'Dine In',
    'Online Ordering',
    'Catering',
    'Party Orders'
  ];
  useEffect(() => {
    const checkScreen = () => setIsDesktop(window.innerWidth >= 768); // md breakpoint
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    if (editingRequestId && initialData) {
      // Load data from existing change request
      setShopFormData(initialData.shop_update || {});
      setProductFormData([
        ...initialData.products?.add || [],
        ...initialData.products?.update || []
      ]);
    } else {
      fetchVendorData();
    }
    fetchCategories();
  }, [vendorId, editingRequestId, initialData]);

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
      // Get vendor's shop and details
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', vendorId)
        .single();

      if (!vendorData) return;

      setVendor(vendorData);
      setVendorFormData({
        owner_name: vendorData.owner_name || '',
        email: vendorData.email
      });

      if (!vendorData.shop_id) return;

      // Fetch shop details
      const { data: shopData } = await supabase
        .from('shops')
        .select('*')
        .eq('id', vendorData.shop_id)
        .single();

      if (shopData) {
        setShop(shopData as Shop);
        setShopFormData({
          ...shopData,
          operating_hours: typeof shopData.operating_hours === 'string' ? shopData.operating_hours : '',
          services_offered: shopData.services_offered || []
        });
        if (shopData.image_url) {
          setShopImagePreview(shopData.image_url);
        }
      }

      // Fetch products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', vendorData.shop_id)
        .order('created_at', { ascending: false });

      if (productsData) {
        setProducts(productsData);
        setProductFormData(productsData);
        setOriginalProducts(productsData);
        // Set image previews for existing products
        const previews: { [key: number]: string } = {};
        productsData.forEach((product, index) => {
          if (product.image_url) {
            previews[index] = product.image_url;
          }
        });
        setProductImagePreviews(previews);
      }
    } catch (error) {
      console.error('Error fetching vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNewProduct = () => {
    const newProduct: Product = {
      name: '',
      description: '',
      price: 0,
      discount: 0,
      image_url: '',
      category_id: '',
      availability: true,
      quantity: 0,
      is_vegetarian: true,
      _isNew: true
    };
    setProductFormData([...productFormData, newProduct]);
  };

  const updateProduct = (index: number, field: keyof Product, value: any) => {
    const updated = [...productFormData];
    updated[index] = { ...updated[index], [field]: value };
    setProductFormData(updated);
  };

  const deleteProduct = (index: number) => {
    const updated = [...productFormData];
    if (updated[index].id) {
      // Mark existing product for deletion
      updated[index] = { ...updated[index], _isDeleted: true };
    } else {
      // Remove new product completely
      updated.splice(index, 1);
      // Also remove from previews
      const newPreviews = { ...productImagePreviews };
      delete newPreviews[index];
      setProductImagePreviews(newPreviews);
    }
    setProductFormData(updated);
  };

  // Modified uploadImage to only compress and return file, actual upload done on submit with proper naming
  const compressImageFile = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.1,
      maxWidthOrHeight: 1024,
      initialQuality: 0.9,
      useWebWorker: true
    };
    return await imageCompression(file, options);
  };

  // Upload image to Supabase storage with given filename
  const uploadImageToStorage = async (file: File, fileName: string) => {
    const { error: uploadError } = await supabase.storage
      .from('marketplace-images')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('marketplace-images')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  // Handle shop image upload - only compress and store file locally, upload on submit
  const handleShopImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setShopImagePreview(previewUrl);
    setShopImageFile(file);
  };

  // Handle product image upload - only compress and store file locally, upload on submit
  const handleProductImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setProductImagePreviews(prev => ({ ...prev, [index]: previewUrl }));
    setProductImageFiles(prev => ({ ...prev, [index]: file }));
  };



  const removeShopImage = () => {
    setShopFormData(prev => ({ ...prev, image_url: '' }));
    setShopImagePreview('');
  };

  const removeProductImage = (index: number) => {
    updateProduct(index, 'image_url', '');
    setProductImagePreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[index];
      return newPreviews;
    });
  };

  const handleServiceToggle = (service: string, checked: boolean) => {
    setShopFormData(prev => ({
      ...prev,
      services_offered: checked
        ? [...(prev.services_offered || []), service]
        : (prev.services_offered || []).filter(s => s !== service)
    }));
  };

  const hasProductChanged = (product: Product, originalProduct?: Product) => {
    if (!originalProduct) return product._isNew;

    const fieldsToCheck = ['name', 'description', 'price', 'discount', 'image_url', 'category_id', 'quantity', 'is_vegetarian'];
    return fieldsToCheck.some(field => product[field as keyof Product] !== originalProduct[field as keyof Product]);
  };

  const submitUnifiedRequest = async () => {
    try {
      // Upload shop image if a new file is selected
      let updatedShopFormData = { ...shopFormData };
      if (shopImageFile) {
        try {
          const compressedFile = await compressImageFile(shopImageFile);
          const fileExt = compressedFile.name.split('.').pop();
          const fileName = `shop-${Date.now()}.${fileExt}`;
          const publicUrl = await uploadImageToStorage(compressedFile, fileName);
          // Update shop image_url in form data
          updatedShopFormData = {
            ...updatedShopFormData,
            image_url: publicUrl
          };
        } catch (uploadError) {
          toast({
            title: "Upload failed",
            description: "Failed to upload shop image. Please try again.",
            variant: "destructive"
          });
          return; // Stop submission on upload failure
        }
      }

      // Upload product images first if any new files are selected
      const updatedProductFormData = [...productFormData];
      for (const [indexStr, file] of Object.entries(productImageFiles)) {
        const index = parseInt(indexStr);
        if (file) {
          try {
            const compressedFile = await compressImageFile(file);
            const fileExt = compressedFile.name.split('.').pop();
            const fileName = `product-${index}-${Date.now()}.${fileExt}`;
            const publicUrl = await uploadImageToStorage(compressedFile, fileName);
            // Update product image_url in form data
            updatedProductFormData[index] = {
              ...updatedProductFormData[index],
              image_url: publicUrl
            };
          } catch (uploadError) {
            toast({
              title: "Upload failed",
              description: `Failed to upload image for product ${index + 1}. Please try again.`,
              variant: "destructive"
            });
            return; // Stop submission on upload failure
          }
        }
      }

      // Filter products that actually changed
      const changedProducts = updatedProductFormData.filter(p => {
        if (p._isNew || p._isDeleted) return true;
        const original = originalProducts.find(op => op.id === p.id);
        return hasProductChanged(p, original);
      });

      // Prepare the unified request data - convert to JSON-compatible format
      const requestData = {
        vendor_update: vendorFormData,
        shop_update: shopFormData,
        products: {
          add: changedProducts.filter(p => p._isNew && !p._isDeleted).map(p => {
            const { _isNew, _isDeleted, ...cleanProduct } = p;
            return cleanProduct;
          }),
          update: changedProducts.filter(p => p.id && !p._isNew && !p._isDeleted).map(p => {
            const { _isNew, _isDeleted, ...cleanProduct } = p;
            return cleanProduct;
          }),
          delete: changedProducts.filter(p => p._isDeleted).map(p => p.id).filter(Boolean)
        }
      };

      if (editingRequestId) {
        // Update existing change request
        await supabase.from('change_requests')
          .update({
            request_data: requestData as any,
            status: 'pending'
          })
          .eq('id', editingRequestId);

        toast({
          title: "Request Updated",
          description: "Your change request has been updated and resubmitted for admin review."
        });
      } else {
        // Submit new unified change request
        await supabase.from('change_requests').insert({
          vendor_id: vendorId,
          request_type: 'unified_update',
          request_data: requestData as any
        });

        toast({
          title: "Request Submitted",
          description: "Your unified shop and product update request has been submitted for admin review."
        });
      }

      onSubmit();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit request.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <ResizablePanelGroup
        direction={isDesktop ? "horizontal" : "vertical"}
        className="flex h-full md:h-screen"
      >
        {/* Form Panel */}
        <ResizablePanel defaultSize={60} minSize={40}>
          <div className="p-4 lg:p-6 h-full overflow-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                {editingRequestId ? 'Edit Change Request' : 'Update Shop & Products'}
              </h2>
              <p className="text-muted-foreground">
                {editingRequestId ? 'Modify your existing request and resubmit' : 'Make all your changes in one submission'}
              </p>
            </div>

            {/* Vendor Details Section */}
            <Card className="mb-6 border-2">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Store className="h-5 w-5" />
                  Vendor Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Owner Name */}
                <div className="space-y-2">
                  <Label htmlFor="owner-name" className="text-sm font-medium">Owner Name *</Label>
                  <Input
                    id="owner-name"
                    value={vendorFormData.owner_name || ''}
                    onChange={(e) => setVendorFormData({ ...vendorFormData, owner_name: e.target.value })}
                    placeholder="Enter the owner's name"
                    className="h-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shop Details Section */}
            <Card className="mb-6 border-2">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Store className="h-5 w-5" />
                  Shop Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Shop Name */}
                <div className="space-y-2">
                  <Label htmlFor="shop-name" className="text-sm font-medium">Shop Name *</Label>
                  <Input
                    id="shop-name"
                    value={shopFormData.name || ''}
                    onChange={(e) => setShopFormData({ ...shopFormData, name: e.target.value })}
                    placeholder="Enter your shop name"
                    className="h-10"
                  />
                </div>

                {/* Shop Image */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Shop Image</Label>
                  <div className="flex flex-col gap-3">
                    {(shopFormData.image_url || shopImagePreview) ? (
                      <div className="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                        <img
                          src={shopImagePreview || shopFormData.image_url}
                          alt="Shop preview"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={removeShopImage}
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleShopImageUpload}
                      className="hidden"
                      id="shop-gallery-upload"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleShopImageUpload}
                      className="hidden"
                      id="shop-camera-upload"
                    />
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('shop-gallery-upload')?.click()}
                        disabled={uploadingImages.shop}
                        className="flex-1"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingImages.shop ? 'Uploading...' : (shopFormData.image_url ? 'Change from Gallery' : 'Upload from Gallery')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('shop-camera-upload')?.click()}
                        disabled={uploadingImages.shop}
                        className="flex-1"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        {uploadingImages.shop ? 'Uploading...' : (shopFormData.image_url ? 'Change Photo' : 'Take Photo')}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* About Shop */}
                <div className="space-y-2">
                  <Label htmlFor="shop-description" className="text-sm font-medium">
                    About Shop
                    <span className="text-xs text-gray-500 ml-1">
                      ({(shopFormData.description || '').length}/250)
                    </span>
                  </Label>
                  <Textarea
                    id="shop-description"
                    value={shopFormData.description || ''}
                    onChange={(e) => {
                      if (e.target.value.length <= 250) {
                        setShopFormData({ ...shopFormData, description: e.target.value });
                      }
                    }}
                    placeholder="Tell customers about your shop..."
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Contact Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="shop-phone" className="text-sm font-medium">Contact Phone *</Label>
                    <Input
                      id="shop-phone"
                      value={shopFormData.contact_phone || ''}
                      onChange={(e) => setShopFormData({ ...shopFormData, contact_phone: e.target.value })}
                      placeholder="Enter phone number"
                      className="h-10"
                    />
                  </div>

                  {/* Contact Email */}
                  <div className="space-y-2">
                    <Label htmlFor="shop-email" className="text-sm font-medium">Contact Email</Label>
                    <Input
                      id="shop-email"
                      type="email"
                      value={shopFormData.contact_email || ''}
                      onChange={(e) => setShopFormData({ ...shopFormData, contact_email: e.target.value })}
                      placeholder="shop@example.com"
                      className="h-10"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="shop-address" className="text-sm font-medium">Address</Label>
                  <Textarea
                    id="shop-address"
                    value={shopFormData.address || ''}
                    onChange={(e) => setShopFormData({ ...shopFormData, address: e.target.value })}
                    placeholder="Enter your shop address"
                    rows={2}
                    className="resize-none"
                  />
                </div>

                {/* Timings */}
                <div className="space-y-2">
                  <Label htmlFor="shop-timings" className="text-sm font-medium">Timings</Label>
                  <Input
                    id="shop-timings"
                    value={shopFormData.operating_hours || ''}
                    onChange={(e) => setShopFormData({ ...shopFormData, operating_hours: e.target.value })}
                    placeholder="e.g., 9:00 AM - 10:00 PM"
                    className="h-10"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Google Maps Link */}
                  <div className="space-y-2">
                    <Label htmlFor="google-maps" className="text-sm font-medium flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Google Maps Link
                    </Label>
                    <Input
                      id="google-maps"
                      type="url"
                      value={shopFormData.google_maps_link || ''}
                      onChange={(e) => setShopFormData({ ...shopFormData, google_maps_link: e.target.value })}
                      placeholder="https://maps.google.com/..."
                      className="h-10"
                    />
                  </div>

                  {/* Google Rating Link */}
                  <div className="space-y-2">
                    <Label htmlFor="google-rating" className="text-sm font-medium flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Google Rating Link
                    </Label>
                    <Input
                      id="google-rating"
                      type="url"
                      value={shopFormData.google_rating_link || ''}
                      onChange={(e) => setShopFormData({ ...shopFormData, google_rating_link: e.target.value })}
                      placeholder="https://g.page/..."
                      className="h-10"
                    />
                  </div>
                </div>

                {/* Services Offered */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Services Offered</Label>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {availableServices.map((service) => (
                      <div key={service} className="flex items-center space-x-2">
                        <Checkbox
                          id={`service-${service}`}
                          checked={(shopFormData.services_offered || []).includes(service)}
                          onCheckedChange={(checked) => handleServiceToggle(service, checked as boolean)}
                        />
                        <Label htmlFor={`service-${service}`} className="text-sm">
                          {service}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Section */}
            <Card className="border-2">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5" />
                  Products
                </CardTitle>
                <Button onClick={addNewProduct} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {productFormData.map((product, index) => (
                  !product._isDeleted && (
                    <div key={index} className="border-2 rounded-lg p-4 lg:p-6 space-y-4 bg-gray-50/50">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <h4 className="font-semibold text-base">Product {index + 1}</h4>
                          {product._isNew && <Badge variant="secondary">New</Badge>}
                          {!product._isNew && <Badge variant="outline">Existing</Badge>}
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteProduct(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Product Image */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Product Image</Label>
                        <div className="flex flex-col gap-3">
                          {(product.image_url || productImagePreviews[index]) ? (
                            <div className="relative w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                              <img
                                src={productImagePreviews[index] || product.image_url}
                                alt="Product preview"
                                className="w-full h-full object-cover"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeProductImage(index)}
                                className="absolute top-1 right-1 h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white">
                              <ImageIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleProductImageUpload(e, index)}
                            className="hidden"
                            id={`product-gallery-upload-${index}`}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handleProductImageUpload(e, index)}
                            className="hidden"
                            id={`product-camera-upload-${index}`}
                          />
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById(`product-gallery-upload-${index}`)?.click()}
                              disabled={uploadingImages[`product-${index}`]}
                              className="flex-1"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {uploadingImages[`product-${index}`] ? 'Uploading...' : (product.image_url ? 'Change from Gallery' : 'Upload from Gallery')}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById(`product-camera-upload-${index}`)?.click()}
                              disabled={uploadingImages[`product-${index}`]}
                              className="flex-1"
                            >
                              <Camera className="h-4 w-4 mr-2" />
                              {uploadingImages[`product-${index}`] ? 'Uploading...' : (product.image_url ? 'Change Photo' : 'Take Photo')}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Product Name */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Product Name *</Label>
                          <Input
                            value={product.name}
                            onChange={(e) => updateProduct(index, 'name', e.target.value)}
                            placeholder="Enter product name"
                            className="h-10"
                          />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Category *</Label>
                          <Select
                            value={product.category_id}
                            onValueChange={(value) => updateProduct(index, 'category_id', value)}
                          >
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Price (₹) *</Label>
                          <Input
                            type="number"
                            value={product.price}
                            onChange={(e) => updateProduct(index, 'price', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="h-10"
                            min="0"
                            step="0.01"
                          />
                        </div>

                        {/* Discount */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Discount (%)</Label>
                          <Input
                            type="number"
                            value={product.discount}
                            onChange={(e) => updateProduct(index, 'discount', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            className="h-10"
                            min="0"
                            max="100"
                          />
                        </div>

                        {/* Quantity */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Quantity Available</Label>
                          <Input
                            type="number"
                            value={product.quantity || 0}
                            onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value) || 0)}
                            placeholder="0"
                            className="h-10"
                            min="0"
                          />
                        </div>

                        {/* Veg/Non-Veg - Only show for Food and Beverages category */}
                        {(() => {
                          const selectedCategory = categories.find(cat => cat.id === product.category_id);
                          const isFoodCategory = selectedCategory?.name?.toLowerCase().includes('food') ||
                            selectedCategory?.name?.toLowerCase().includes('beverage');
                          return isFoodCategory ? (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Food Type</Label>
                              <RadioGroup
                                value={product.is_vegetarian ? "veg" : "non-veg"}
                                onValueChange={(value) => updateProduct(index, 'is_vegetarian', value === "veg")}
                                className="flex gap-6"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="veg" id={`veg-${index}`} />
                                  <Label htmlFor={`veg-${index}`} className="text-sm">
                                    🟢 Vegetarian
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="non-veg" id={`non-veg-${index}`} />
                                  <Label htmlFor={`non-veg-${index}`} className="text-sm">
                                    🔴 Non-Vegetarian
                                  </Label>
                                </div>
                              </RadioGroup>
                            </div>
                          ) : null;
                        })()}
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Product Description</Label>
                        <Textarea
                          value={product.description}
                          onChange={(e) => updateProduct(index, 'description', e.target.value)}
                          placeholder="Describe your product..."
                          rows={3}
                          className="resize-none"
                        />
                      </div>
                    </div>
                  )
                ))}
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-end">
              <Button onClick={submitUnifiedRequest} size="lg" className="h-12 px-8">
                <Save className="h-4 w-4 mr-2" />
                {editingRequestId ? 'Update Request' : 'Submit All Changes'}
              </Button>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Live Preview Panel */}
        <ResizablePanel defaultSize={40} minSize={30}>
          <div className="p-4 lg:p-6 h-full overflow-auto bg-muted/30">
            <div className="mb-4">
              <h3 className="text-lg font-semibold flex items-center text-gray-800">
                <Eye className="h-4 w-4 mr-2" />
                Customer View Preview
              </h3>
            </div>

            {/* Shop Preview */}
            <Card className="mb-4 border-2">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {(shopFormData.image_url || shopImagePreview) ? (
                      <img
                        src={shopImagePreview || shopFormData.image_url}
                        alt="Shop"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Store className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xl font-bold text-gray-800 truncate">
                      {shopFormData.name || 'Your Shop Name'}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      📞 {shopFormData.contact_phone || 'Contact Phone'}
                    </p>
                    {shopFormData.operating_hours && (
                      <p className="text-sm text-gray-600">🕒 {shopFormData.operating_hours}</p>
                    )}
                  </div>
                </div>

                {shopFormData.description && (
                  <p className="text-gray-700 mb-4 leading-relaxed">{shopFormData.description}</p>
                )}

                <div className="grid gap-2 text-sm">
                  {shopFormData.address && (
                    <p className="text-gray-600 flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      {shopFormData.address}
                    </p>
                  )}

                  {shopFormData.contact_email && (
                    <p className="text-gray-600">✉️ {shopFormData.contact_email}</p>
                  )}

                  {shopFormData.services_offered && shopFormData.services_offered.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {shopFormData.services_offered.map(service => (
                        <Badge key={service} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 mt-3">
                    {shopFormData.google_maps_link && (
                      <Badge variant="outline" className="text-xs">
                        📍 Maps
                      </Badge>
                    )}
                    {shopFormData.google_rating_link && (
                      <Badge variant="outline" className="text-xs">
                        ⭐ Reviews
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Preview */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800">
                Products ({productFormData.filter(p => !p._isDeleted).length})
              </h4>

              {productFormData.filter(p => !p._isDeleted).map((product, index) => (
                <Card key={index} className="p-4">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {(product.image_url || productImagePreviews[index]) ? (
                        <img
                          src={productImagePreviews[index] || product.image_url}
                          alt="Product"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold text-gray-800 truncate">
                          {product.name || `Product ${index + 1}`}
                        </h5>
                        {(() => {
                          const selectedCategory = categories.find(cat => cat.id === product.category_id);
                          const isFoodCategory = selectedCategory?.name?.toLowerCase().includes('food') ||
                            selectedCategory?.name?.toLowerCase().includes('beverage');
                          return isFoodCategory ? (
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{
                              backgroundColor: product.is_vegetarian ? '#4ade80' : '#ef4444'
                            }}></div>
                          ) : null;
                        })()}
                      </div>

                      {product.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">₹{product.price || 0}</span>
                          {product.discount && product.discount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {product.discount}% OFF
                            </Badge>
                          )}
                        </div>

                        {product.quantity !== undefined && (
                          <span className="text-xs text-gray-500">
                            Qty: {product.quantity}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {productFormData.filter(p => !p._isDeleted).length === 0 && (
                <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No products added yet</p>
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}