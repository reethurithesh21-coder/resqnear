import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatsCard } from '@/components/admin/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, Droplets, Building2, Activity } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalDonors: number;
  availableDonors: number;
  totalServices: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalDonors: 0,
    availableDonors: 0,
    totalServices: 0,
  });
  const [recentDonors, setRecentDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch profiles count
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch donors count
        const { count: donorsCount } = await supabase
          .from('blood_donors')
          .select('*', { count: 'exact', head: true });

        // Fetch available donors count
        const { count: availableCount } = await supabase
          .from('blood_donors')
          .select('*', { count: 'exact', head: true })
          .eq('is_available', true);

        // Fetch services count
        const { count: servicesCount } = await supabase
          .from('emergency_services')
          .select('*', { count: 'exact', head: true });

        // Fetch recent donors
        const { data: donors } = await supabase
          .from('blood_donors')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        setStats({
          totalUsers: usersCount || 0,
          totalDonors: donorsCount || 0,
          availableDonors: availableCount || 0,
          totalServices: servicesCount || 0,
        });
        setRecentDonors(donors || []);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of ResQNear platform</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<Users className="h-5 w-5" />}
            description="Registered users"
          />
          <StatsCard
            title="Blood Donors"
            value={stats.totalDonors}
            icon={<Droplets className="h-5 w-5" />}
            description={`${stats.availableDonors} currently available`}
          />
          <StatsCard
            title="Emergency Services"
            value={stats.totalServices}
            icon={<Building2 className="h-5 w-5" />}
            description="Active listings"
          />
          <StatsCard
            title="Platform Status"
            value="Active"
            icon={<Activity className="h-5 w-5" />}
            description="All systems operational"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Blood Donor Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : recentDonors.length === 0 ? (
                <p className="text-muted-foreground">No donors registered yet</p>
              ) : (
                <div className="space-y-3">
                  {recentDonors.map((donor) => (
                    <div
                      key={donor.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blood flex items-center justify-center text-white font-bold text-sm">
                          {donor.blood_group}
                        </div>
                        <div>
                          <p className="font-medium">{donor.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {donor.city}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          donor.is_available
                            ? 'bg-secondary/20 text-secondary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {donor.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a
                href="/admin/donors"
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Droplets className="h-5 w-5 text-blood" />
                <span>Manage Blood Donors</span>
              </a>
              <a
                href="/admin/services"
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Building2 className="h-5 w-5 text-primary" />
                <span>Add Emergency Service</span>
              </a>
              <a
                href="/admin/users"
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Users className="h-5 w-5 text-secondary" />
                <span>View All Users</span>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
