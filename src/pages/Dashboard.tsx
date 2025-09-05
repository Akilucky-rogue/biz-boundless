import { StatsCard } from "@/components/StatsCard";
import { 
  DollarSign, 
  Package, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  ShoppingCart
} from "lucide-react";
import { useInventory } from "@/hooks/useInventory";
import { useSales } from "@/hooks/useSales";
import { useCustomers } from "@/hooks/useCustomers";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { stockSummary, loading: inventoryLoading } = useInventory();
  const { invoices, todaysRevenue, todaysInvoices, loading: salesLoading } = useSales();
  const { customers, loading: customersLoading } = useCustomers();
  const navigate = useNavigate();

  const loading = inventoryLoading || salesLoading || customersLoading;

  // Calculate real stats
  const lowStockItems = stockSummary.filter(item => item.status === 'low_stock').length;
  const outOfStockItems = stockSummary.filter(item => item.status === 'out_of_stock').length;
  const criticalAlerts = outOfStockItems;

  const stats = [
    {
      title: "Today's Sales",
      value: loading ? "Loading..." : `₹${todaysRevenue.toLocaleString()}`,
      change: `${todaysInvoices.length} transactions today`,
      changeType: "positive" as const,
      icon: DollarSign,
      gradient: true
    },
    {
      title: "Inventory Items",
      value: loading ? "Loading..." : stockSummary.length.toString(),
      change: `${lowStockItems} low stock items`,
      changeType: lowStockItems > 0 ? "negative" as const : "positive" as const,
      icon: Package
    },
    {
      title: "Active Customers",
      value: loading ? "Loading..." : customers.length.toString(),
      change: "Total registered",
      changeType: "neutral" as const,
      icon: Users
    },
    {
      title: "Stock Alerts",
      value: loading ? "Loading..." : (lowStockItems + outOfStockItems).toString(),
      change: `${criticalAlerts} critical`,
      changeType: criticalAlerts > 0 ? "negative" as const : "positive" as const,
      icon: AlertTriangle
    }
  ];

  const recentSales = loading ? [] : invoices.slice(0, 3).map(invoice => ({
    id: invoice.id,
    customer: invoice.customers?.name || "Walk-in Customer",
    amount: `₹${invoice.total_amount.toLocaleString()}`,
    time: new Date(invoice.created_at).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
  }));

  return (
    <div className="min-h-screen bg-background pb-20 pt-4">
      <div className="px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, manage your store efficiently</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changeType={stat.changeType}
              icon={stat.icon}
              gradient={stat.gradient}
            />
          ))}
        </div>

        {/* Recent Sales */}
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Sales</h2>
            <TrendingUp size={20} className="text-success" />
          </div>
          <div className="space-y-3">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <ShoppingCart size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{sale.customer}</p>
                    <p className="text-xs text-muted-foreground">{sale.time}</p>
                  </div>
                </div>
                <p className="font-semibold text-success">{sale.amount}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button 
              className="p-4 bg-muted/50 rounded-lg text-left hover:bg-muted transition-colors"
              onClick={() => navigate('/inventory')}
            >
              <Package className="text-primary mb-2" size={20} />
              <p className="font-medium text-foreground">Add Inventory</p>
              <p className="text-xs text-muted-foreground">Manage stock levels</p>
            </button>
            <button 
              className="p-4 bg-muted/50 rounded-lg text-left hover:bg-muted transition-colors"
              onClick={() => navigate('/customers')}
            >
              <Users className="text-secondary mb-2" size={20} />
              <p className="font-medium text-foreground">New Customer</p>
              <p className="text-xs text-muted-foreground">Add customer details</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}