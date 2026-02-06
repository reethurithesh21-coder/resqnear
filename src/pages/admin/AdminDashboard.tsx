import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatsCard } from '@/components/admin/StatsCard';
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, Droplets, Building2, Activity } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalDonors: number;
  availableDonors: number;
  totalServices: number;
}

interface BloodGroupData {
  name: string;
  count: number;
}

interface ServiceCategoryData {
  name: string;
  count: number;
}

interface RegistrationData {
  date: string;
  users: number;
  donors: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalDonors: 0,
    availableDonors: 0,
    totalServices: 0,
  });
  const [recentDonors, setRecentDonors] = useState<any[]>([]);
  const [donorsByBloodGroup, setDonorsByBloodGroup] = useState<BloodGroupData[]>([]);
  const [servicesByCategory, setServicesByCategory] = useState<ServiceCategoryData[]>([]);
  const [registrationTrend, setRegistrationTrend] = useState<RegistrationData[]>([]);
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

        // Fetch donors by blood group
        const { data: allDonors } = await supabase
          .from('blood_donors')
          .select('blood_group');
        
        const bloodGroupCounts: Record<string, number> = {};
        allDonors?.forEach(donor => {
          bloodGroupCounts[donor.blood_group] = (bloodGroupCounts[donor.blood_group] || 0) + 1;
        });
        const bloodGroupData = Object.entries(bloodGroupCounts).map(([name, count]) => ({ name, count }));

        // Fetch services by category
        const { data: allServices } = await supabase
          .from('emergency_services')
          .select('category');
        
        const categoryCounts: Record<string, number> = {};
        allServices?.forEach(service => {
          const cat = service.category.charAt(0).toUpperCase() + service.category.slice(1);
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
        const categoryData = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));

        // Generate mock registration trend (last 7 days)
        const trend: RegistrationData[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          trend.push({
            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
            users: Math.floor(Math.random() * 10) + (usersCount || 0) / 7,
            donors: Math.floor(Math.random() * 5) + (donorsCount || 0) / 7,
          });
        }

        setStats({
          totalUsers: usersCount || 0,
          totalDonors: donorsCount || 0,
          availableDonors: availableCount || 0,
          totalServices: servicesCount || 0,
        });
        setRecentDonors(donors || []);
        setDonorsByBloodGroup(bloodGroupData);
        setServicesByCategory(categoryData);
        setRegistrationTrend(trend);
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

        {/* Analytics Charts */}
        <AnalyticsCharts
          donorsByBloodGroup={donorsByBloodGroup}
          registrationTrend={registrationTrend}
          servicesByCategory={servicesByCategory}
        />

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
