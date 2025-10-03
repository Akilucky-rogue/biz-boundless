import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { VendorModal } from '@/components/VendorModal';

interface Vendor {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  gstin?: string;
  is_active: boolean;
  created_at: string;
}

const Vendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVendors(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch vendors',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddVendor = () => {
    setSelectedVendor(undefined);
    setShowVendorModal(true);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowVendorModal(true);
  };

  const handleDeleteVendor = async (vendorId: string, vendorName: string) => {
    if (window.confirm(`Are you sure you want to delete ${vendorName}?`)) {
      try {
        const { error } = await supabase
          .from('vendors')
          .update({ is_active: false })
          .eq('id', vendorId);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Vendor deleted successfully',
        });
        
        fetchVendors();
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'Failed to delete vendor',
          variant: 'destructive',
        });
      }
    }
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Vendors</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vendors</h1>
          <p className="text-muted-foreground">Manage your supplier relationships</p>
        </div>
        <Button variant="gradient" className="gap-2" onClick={handleAddVendor}>
          <Plus size={20} />
          Add Vendor
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
        <Input
          placeholder="Search vendors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Vendors</p>
                <p className="text-2xl font-bold">{vendors.length}</p>
              </div>
              <Building2 size={20} className="text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Vendors</p>
                <p className="text-2xl font-bold">{vendors.filter(v => v.is_active).length}</p>
              </div>
              <Badge variant="secondary" className="bg-success/10 text-success">Active</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">GST Registered</p>
                <p className="text-2xl font-bold">{vendors.filter(v => v.gstin).length}</p>
              </div>
              <Badge variant="outline">GST</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendors Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Contact</th>
              <th className="text-left p-3 font-medium">Phone</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Outstanding</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.map((vendor) => (
              <tr key={vendor.id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="p-3">
                  <div className="font-medium">{vendor.name}</div>
                  {vendor.gstin && (
                    <div className="text-xs text-muted-foreground">GST: {vendor.gstin}</div>
                  )}
                </td>
                <td className="p-3">{vendor.contact_person || '-'}</td>
                <td className="p-3">{vendor.phone || '-'}</td>
                <td className="p-3 text-sm">{vendor.email || '-'}</td>
                <td className="p-3">
                  <span className="font-medium text-warning">₹0.00</span>
                </td>
                <td className="p-3">
                  <Badge variant={vendor.is_active ? 'secondary' : 'outline'}>
                    {vendor.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="p-3">
                  <div className="flex gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditVendor(vendor)}
                    >
                      <Edit size={14} className="mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleDeleteVendor(vendor.id, vendor.name)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredVendors.length === 0 && (
        <div className="text-center py-12">
          <Building2 size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No vendors found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first vendor.'}
          </p>
          <Button variant="gradient" className="gap-2" onClick={handleAddVendor}>
            <Plus size={20} />
            Add Vendor
          </Button>
        </div>
      )}

      {/* Vendor Modal */}
      <VendorModal 
        open={showVendorModal} 
        onClose={() => {
          setShowVendorModal(false);
          setSelectedVendor(undefined);
          fetchVendors();
        }} 
        vendor={selectedVendor}
      />
    </div>
  );
};

export default Vendors;