# TODO: Implement Product Image Upload and Approval Features

## Tasks
- [x] Modify UnifiedVendorForm.tsx to store compressed image files locally instead of uploading immediately
- [x] Update image upload logic to use proper naming convention (product_id-pending.extension for existing products, temp name for new products)
- [x] Move image upload to form submit instead of immediate upload
- [x] Update AdminPanel.tsx to rename images from -pending to -approved on approval
- [x] Ensure shop image upload works with camera and gallery
- [x] Test that DB queries happen on form submit
- [x] Verify no other functionality is broken

## Dependent Files
- src/components/vendor/UnifiedVendorForm.tsx
- src/pages/AdminPanel.tsx

## Followup Steps
- Test full flow: upload image, submit request, approve, check naming
- Test camera/gallery upload for shop and product images
- Ensure previews work without immediate upload
