import { useState } from "react";
import { Download, Calendar, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSales } from "@/hooks/useSales";
import { useInventory } from "@/hooks/useInventory";
import { useCustomers } from "@/hooks/useCustomers";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const ReportsActions = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { invoices } = useSales();
  const { stockSummary } = useInventory();
  const { customers } = useCustomers();

  const handleExportPDF = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text("StoreFlow - Business Report", 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
      
      // Sales Summary
      doc.setFontSize(14);
      doc.text("Sales Summary", 14, 40);
      
      const salesData = invoices.map((inv, idx) => [
        idx + 1,
        inv.invoice_number,
        inv.customers?.name || "Walk-in",
        `₹${inv.total_amount.toFixed(2)}`,
        new Date(inv.created_at).toLocaleDateString(),
        inv.payment_status
      ]);
      
      autoTable(doc, {
        startY: 45,
        head: [['#', 'Invoice', 'Customer', 'Amount', 'Date', 'Status']],
        body: salesData,
        theme: 'grid',
        headStyles: { fillColor: [147, 51, 234] }
      });
      
      // Inventory Summary
      const finalY = (doc as any).lastAutoTable.finalY || 45;
      doc.setFontSize(14);
      doc.text("Inventory Summary", 14, finalY + 15);
      
      const inventoryData = stockSummary.slice(0, 20).map((item, idx) => [
        idx + 1,
        item.product_name,
        item.total_stock.toString(),
        item.unit,
        `₹${item.selling_price.toFixed(2)}`,
        item.status
      ]);
      
      autoTable(doc, {
        startY: finalY + 20,
        head: [['#', 'Product', 'Stock', 'Unit', 'Price', 'Status']],
        body: inventoryData,
        theme: 'grid',
        headStyles: { fillColor: [147, 51, 234] }
      });
      
      doc.save(`StoreFlow_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Export Completed",
        description: "PDF report has been downloaded",
      });
    } catch (error) {
      console.error("PDF Export Error:", error);
      toast({
        title: "Export Failed",
        description: "Unable to export PDF",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setLoading(true);
    try {
      // Create CSV content
      let csvContent = "Sales Report\n\n";
      csvContent += "Invoice,Customer,Amount,Date,Status\n";
      
      invoices.forEach(inv => {
        csvContent += `${inv.invoice_number},"${inv.customers?.name || 'Walk-in'}",${inv.total_amount},${new Date(inv.created_at).toLocaleDateString()},${inv.payment_status}\n`;
      });
      
      csvContent += "\n\nInventory Report\n\n";
      csvContent += "Product,Stock,Unit,Price,Status\n";
      
      stockSummary.forEach(item => {
        csvContent += `"${item.product_name}",${item.total_stock},${item.unit},${item.selling_price},${item.status}\n`;
      });
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `StoreFlow_Report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export Completed", 
        description: "CSV report has been downloaded",
      });
    } catch (error) {
      console.error("CSV Export Error:", error);
      toast({
        title: "Export Failed",
        description: "Unable to export CSV",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleReport = () => {
    toast({
      title: "Coming Soon",
      description: "Report scheduling will be available soon",
    });
  };

  const handleAdvancedAnalytics = () => {
    toast({
      title: "Coming Soon", 
      description: "Advanced analytics dashboard will be available soon",
    });
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button 
        variant="outline" 
        className="justify-start" 
        onClick={handleExportPDF}
        disabled={loading}
      >
        <Download size={16} className="mr-2" />
        Export PDF
      </Button>
      <Button 
        variant="outline" 
        className="justify-start"
        onClick={handleExportCSV}
        disabled={loading}
      >
        <Download size={16} className="mr-2" />
        Export CSV
      </Button>
      <Button 
        variant="outline" 
        className="justify-start"
        onClick={handleScheduleReport}
      >
        <Calendar size={16} className="mr-2" />
        Schedule Report
      </Button>
      <Button 
        variant="outline" 
        className="justify-start"
        onClick={handleAdvancedAnalytics}
      >
        <BarChart3 size={16} className="mr-2" />
        Advanced Analytics
      </Button>
    </div>
  );
};