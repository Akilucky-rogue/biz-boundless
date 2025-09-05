import { useState } from "react";
import { Search, Plus, Receipt, Calendar, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSales } from "@/hooks/useSales";
import { useAuth } from "@/hooks/useAuth";

export default function Sales() {
  const [searchTerm, setSearchTerm] = useState("");
  const { invoices, loading, todaysRevenue, todaysInvoices } = useSales();
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <Card className="text-center max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-destructive">Access Restricted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Only administrators can access sales and financial data.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const salesData = invoices.map(invoice => ({
    id: invoice.invoice_number,
    customer: invoice.customers?.name || "Walk-in Customer",
    amount: invoice.total_amount,
    items: invoice.invoice_items?.length || 0,
    date: new Date(invoice.created_at).toLocaleDateString(),
    time: new Date(invoice.created_at).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    status: invoice.payment_status,
    paymentMethod: "cash" // We can enhance this later with actual payment method tracking
  }));


  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-success-light text-success";
      case "pending": return "bg-warning-light text-warning";
      case "overdue": return "bg-destructive/10 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "cash": return "💵";
      case "upi": return "📱";
      case "credit": return "💳";
      default: return "💰";
    }
  };

  const filteredSales = salesData.filter(sale =>
    sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20 pt-4">
      <div className="px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Sales</h1>
          <p className="text-muted-foreground">Track invoices and manage transactions</p>
        </div>

        {/* Today's Summary */}
        <div className="bg-gradient-primary rounded-xl p-4 mb-6 text-primary-foreground">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Today's Sales</h2>
            <Calendar size={20} className="text-primary-foreground/80" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold">
                {loading ? "Loading..." : `₹${todaysRevenue.toLocaleString()}`}
              </p>
              <p className="text-sm text-primary-foreground/80">Total Revenue</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {loading ? "..." : todaysInvoices.length}
              </p>
              <p className="text-sm text-primary-foreground/80">Transactions</p>
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search sales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter size={18} />
          </Button>
          <Button className="bg-gradient-primary hover:opacity-90" variant="gradient">
            <Plus size={18} className="mr-2" />
            New Invoice
          </Button>
        </div>

        {/* Sales List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading sales data...</p>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No sales found</p>
            </div>
          ) : (
            filteredSales.map((sale) => (
            <div key={sale.id} className="bg-card rounded-xl p-4 shadow-sm border border-border/50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Receipt size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{sale.id}</h3>
                    <p className="text-sm text-muted-foreground">{sale.customer}</p>
                    <p className="text-xs text-muted-foreground">{sale.date} • {sale.time}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sale.status)}`}>
                  {sale.status}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-semibold text-success text-lg">₹{sale.amount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Items</p>
                  <p className="font-semibold text-foreground">{sale.items} products</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment</p>
                  <p className="font-semibold text-foreground">
                    {getPaymentMethodIcon(sale.paymentMethod)} {sale.paymentMethod.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-3 pt-3 border-t border-border/30">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Print PDF
                </Button>
              </div>
            </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}