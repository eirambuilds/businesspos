
import React, { useState, useEffect } from 'react';
import { useProducts, Product } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditProductModal = ({ product, isOpen, onClose }: EditProductModalProps) => {
  const { updateProduct } = useProducts();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Product>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        product_name: product.product_name,
        product_type: product.product_type,
        product_size: product.product_size,
        quantity_per_pack: product.quantity_per_pack,
        puhunan_per_pack: product.puhunan_per_pack,
        selling_price: product.selling_price,
        stock: product.stock
      });
    }
  }, [product]);

  const calculateValues = () => {
    const puhunanEach = (formData.puhunan_per_pack || 0) / (formData.quantity_per_pack || 1);
    const tubo = (formData.selling_price || 0) - puhunanEach;
    return { puhunanEach, tubo };
  };

  const handleSave = async () => {
    if (!product) return;

    const { puhunanEach, tubo } = calculateValues();
    
    const updatedData = {
      ...formData,
      puhunan_each: puhunanEach,
      tubo: tubo
    };

    const result = await updateProduct(product.id, updatedData);
    if (result.success) {
      onClose();
      toast({
        title: "Product updated!",
        description: "Na-update na ang product details."
      });
    }
  };

  if (!product) return null;

  const { puhunanEach, tubo } = calculateValues();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="product-name">Product Name</Label>
            <Input
              id="product-name"
              value={formData.product_name || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="product-type">Type</Label>
              <Input
                id="product-type"
                value={formData.product_type || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, product_type: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="product-size">Size</Label>
              <Input
                id="product-size"
                value={formData.product_size || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, product_size: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="quantity-per-pack">Qty per Pack</Label>
              <Input
                id="quantity-per-pack"
                type="number"
                value={formData.quantity_per_pack || 1}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity_per_pack: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div>
              <Label htmlFor="puhunan-per-pack">Puhunan per Pack</Label>
              <Input
                id="puhunan-per-pack"
                type="number"
                step="0.01"
                value={formData.puhunan_per_pack || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, puhunan_per_pack: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="selling-price">Selling Price</Label>
              <Input
                id="selling-price"
                type="number"
                step="0.01"
                value={formData.selling_price || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, selling_price: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-800 p-3 rounded">
            <div>Puhunan Each: ₱{puhunanEach.toFixed(2)}</div>
            <div>Profit Each: ₱{tubo.toFixed(2)}</div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
