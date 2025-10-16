import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface InvoiceDetailsModalProps {
  open: boolean;
  onClose: () => void;
  invoiceId: string;
}

export const InvoiceDetailsModal = ({ open, onClose, invoiceId }: InvoiceDetailsModalProps) => {
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && invoiceId) {
      fetchInvoiceDetails();
    }
  }, [open, invoiceId]);

  const fetchInvoiceDetails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers (name, phone, email),
          invoice_items (
            *,
            products (name, unit)
          )
        `)
        .eq('invoice_number', invoiceId)
        .single();

      if (error) throw error;
      setInvoice(data);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      toast({
        title: "Error",
        description: "Failed to load invoice details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrintPDF = () => {
    if (!invoice) return;

    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(24);
      doc.text("INVOICE", 14, 20);
      doc.setFontSize(10);
      doc.text("StoreFlow Store Management", 14, 28);
      
      // Invoice Info
      doc.setFontSize(12);
      doc.text(`Invoice #: ${invoice.invoice_number}`, 140, 20);
      doc.setFontSize(10);
      doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 140, 28);
      
      // Customer Info
      doc.setFontSize(12);
      doc.text("Bill To:", 14, 45);
      doc.setFontSize(10);
      doc.text(invoice.customers?.name || "Walk-in Customer", 14, 52);
      if (invoice.customers?.phone) {
        doc.text(`Phone: ${invoice.customers.phone}`, 14, 58);
      }
      
      // Items Table
      const items = invoice.invoice_items?.map((item: any) => [
        item.products?.name || "Product",
        item.quantity.toString(),
        `₹${item.unit_price.toFixed(2)}`,
        `${item.tax_rate}%`,
        `₹${item.line_total.toFixed(2)}`
      ]) || [];
      
      autoTable(doc, {
        startY: 70,
        head: [['Item', 'Qty', 'Price', 'Tax', 'Total']],
        body: items,
        theme: 'grid',
        headStyles: { fillColor: [147, 51, 234] }
      });
      
      // Totals
      const finalY = (doc as any).lastAutoTable.finalY || 70;
      doc.setFontSize(10);
      doc.text(`Subtotal: ₹${invoice.subtotal.toFixed(2)}`, 140, finalY + 10);
      doc.text(`Tax: ₹${invoice.tax_amount.toFixed(2)}`, 140, finalY + 17);
      if (invoice.discount_amount > 0) {
        doc.text(`Discount: -₹${invoice.discount_amount.toFixed(2)}`, 140, finalY + 24);
      }
      doc.setFontSize(12);
      doc.text(`Total: ₹${invoice.total_amount.toFixed(2)}`, 140, finalY + 31);
      
      // Payment Status
      doc.setFontSize(10);
      doc.text(`Payment Status: ${invoice.payment_status.toUpperCase()}`, 14, finalY + 31);
      
      // Footer
      if (invoice.notes) {
        doc.setFontSize(9);
        doc.text("Notes:", 14, finalY + 45);
        doc.text(invoice.notes, 14, finalY + 51);
      }
      
      doc.save(`Invoice_${invoice.invoice_number}.pdf`);
      
      toast({
        title: "Success",
        description: "Invoice PDF downloaded successfully",
      });
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!invoice) {
    return null;
  }

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
              <h3 className="font-semibold text-lg">{invoice.customers?.name || "Walk-in Customer"}</h3>
              <p className="text-muted-foreground">{new Date(invoice.created_at).toLocaleDateString()}</p>
              {invoice.customers?.phone && (
                <p className="text-sm text-muted-foreground">{invoice.customers.phone}</p>
              )}
            </div>
            <Badge variant="secondary" className={`${
              invoice.payment_status === 'paid' ? 'bg-success/10 text-success' : 
              invoice.payment_status === 'pending' ? 'bg-warning/10 text-warning' : 
              'bg-destructive/10 text-destructive'
            }`}>
              {invoice.payment_status}
            </Badge>
          </div>

          {/* Items */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted p-3 font-medium">Items</div>
            <div className="divide-y">
              {invoice.invoice_items?.map((item: any, index: number) => (
                <div key={index} className="p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.products?.name || "Product"}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} × ₹{item.unit_price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-semibold">₹{item.line_total.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>₹{invoice.tax_amount.toFixed(2)}</span>
            </div>
            {invoice.discount_amount > 0 && (
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>-₹{invoice.discount_amount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg pt-2 border-t">
              <span>Total:</span>
              <span>₹{invoice.total_amount.toFixed(2)}</span>
            </div>
          </div>
          
          {invoice.notes && (
            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="text-sm font-medium mb-1">Notes:</p>
              <p className="text-sm text-muted-foreground">{invoice.notes}</p>
            </div>
          )}

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