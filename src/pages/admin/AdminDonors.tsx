import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { Icons } from '@/components/Icons';
import { Search, Trash2 } from 'lucide-react';
import { BLOOD_GROUPS, BloodGroup } from '@/types';
import { toast } from 'sonner';

interface BloodDonor {
  id: string;
  user_id: string;
  full_name: string;
  blood_group: string;
  phone: string;
  area: string;
  city: string;
  is_available: boolean;
  show_contact: boolean;
  created_at: string;
  last_donation_date: string | null;
}

export default function AdminDonors() {
  const [donors, setDonors] = useState<BloodDonor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>('all');

  const fetchDonors = async () => {
    try {
      let query = supabase
        .from('blood_donors')
        .select('*')
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      setDonors(data || []);
    } catch (error) {
      console.error('Error fetching donors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const handleToggleAvailability = async (donor: BloodDonor) => {
    try {
      const { error } = await supabase
        .from('blood_donors')
        .update({ is_available: !donor.is_available })
        .eq('id', donor.id);

      if (error) throw error;
      toast.success(`Donor marked as ${!donor.is_available ? 'available' : 'unavailable'}`);
      fetchDonors();
    } catch (error) {
      console.error('Error updating donor:', error);
      toast.error('Failed to update donor');
    }
  };

  const handleDeleteDonor = async (donorId: string) => {
    try {
      const { error } = await supabase
        .from('blood_donors')
        .delete()
        .eq('id', donorId);

      if (error) throw error;
      toast.success('Donor deleted successfully');
      fetchDonors();
    } catch (error) {
      console.error('Error deleting donor:', error);
      toast.error('Failed to delete donor');
    }
  };

  const filteredDonors = donors.filter((donor) => {
    const matchesSearch =
      donor.full_name.toLowerCase().includes(search.toLowerCase()) ||
      donor.city.toLowerCase().includes(search.toLowerCase()) ||
      donor.area.toLowerCase().includes(search.toLowerCase());
    const matchesBloodGroup =
      bloodGroupFilter === 'all' || donor.blood_group === bloodGroupFilter;
    return matchesSearch && matchesBloodGroup;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Blood Donors</h1>
          <p className="text-muted-foreground">Manage registered blood donors</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle>All Donors ({donors.length})</CardTitle>
              <div className="flex gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search donors..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={bloodGroupFilter} onValueChange={setBloodGroupFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Blood Group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Groups</SelectItem>
                    {BLOOD_GROUPS.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Icons.Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredDonors.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                {search || bloodGroupFilter !== 'all'
                  ? 'No donors found matching your filters'
                  : 'No donors registered yet'}
              </p>
            ) : (
              <div className="divide-y">
                {filteredDonors.map((donor) => (
                  <div
                    key={donor.id}
                    className="flex items-center justify-between py-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-blood flex items-center justify-center text-white font-bold">
                        {donor.blood_group}
                      </div>
                      <div>
                        <p className="font-medium">{donor.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {donor.area}, {donor.city}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {donor.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={donor.is_available ? 'default' : 'secondary'}
                        className={donor.is_available ? 'bg-secondary' : ''}
                      >
                        {donor.is_available ? 'Available' : 'Unavailable'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleAvailability(donor)}
                      >
                        Toggle
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Donor</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {donor.full_name}'s donor
                              profile? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteDonor(donor.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
