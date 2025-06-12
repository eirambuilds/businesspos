
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { useProducts, Product } from '@/hooks/useProducts';
import { useToast } from '@/hooks/use-toast';

interface DeleteProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteProductModal = ({ product, isOpen, onClose }: DeleteProductModalProps) => {
  const { deleteProduct } = useProducts();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!product) return;

    const result = await deleteProduct(product.id);
    if (result.success) {
      onClose();
      toast({
        title: "Product deleted!",
        description: `${product.product_name} ay na-delete na.`
      });
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Delete Product
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this product? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
          <h4 className="font-semibold">{product.product_name}</h4>
          <p className="text-sm text-muted-foreground">
            {product.product_type} • Stock: {product.stock} • Price: ₱{product.selling_price}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} className="flex-1">
            Delete Product
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
