import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InvoiceDetailsModalProps {
  open: boolean;
  onClose: () => void;
  invoiceId: string;
}

export const InvoiceDetailsModal = ({ open, onClose, invoiceId }: InvoiceDetailsModalProps) => {
  const { toast } = useToast();

  const handlePrintPDF = () => {
    toast({
      title: "Coming Soon",
      description: "PDF generation will be available soon",
    });
  };

  // Mock invoice data - would be fetched from API
  const mockInvoice = {
    id: invoiceId,
    customer: "John Doe",
    date: "2024-01-10",
    items: [
      { name: "Rice Basmati 1kg", quantity: 2, price: 85, total: 170 },
      { name: "Cooking Oil 1L", quantity: 1, price: 120, total: 120 },
    ],
    subtotal: 290,
    tax: 29,
    total: 319,
    status: "paid"
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invoice Details - {invoiceId}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{mockInvoice.customer}</h3>
              <p className="text-muted-foreground">{mockInvoice.date}</p>
            </div>
            <Badge variant="secondary" className="bg-success/10 text-success">
              {mockInvoice.status}
            </Badge>
          </div>

          {/* Items */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted p-3 font-medium">Items</div>
            <div className="divide-y">
              {mockInvoice.items.map((item, index) => (
                <div key={index} className="p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} × ₹{item.price}
                    </p>
                  </div>
                  <p className="font-semibold">₹{item.total}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{mockInvoice.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>₹{mockInvoice.tax}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg pt-2 border-t">
              <span>Total:</span>
              <span>₹{mockInvoice.total}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button onClick={handlePrintPDF} className="flex-1">
              <Download size={16} className="mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};