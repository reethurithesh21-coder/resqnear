import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

interface AnalyticsChartsProps {
  donorsByBloodGroup: { name: string; count: number }[];
  registrationTrend: { date: string; users: number; donors: number }[];
  servicesByCategory: { name: string; count: number }[];
}

const BLOOD_COLORS = {
  'A+': 'hsl(0, 84%, 60%)',
  'A-': 'hsl(0, 70%, 50%)',
  'B+': 'hsl(20, 84%, 60%)',
  'B-': 'hsl(20, 70%, 50%)',
  'AB+': 'hsl(280, 84%, 60%)',
  'AB-': 'hsl(280, 70%, 50%)',
  'O+': 'hsl(142, 76%, 45%)',
  'O-': 'hsl(142, 60%, 35%)',
};

const CATEGORY_COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(0, 84%, 60%)', 'hsl(45, 93%, 47%)', 'hsl(280, 84%, 60%)'];

export function AnalyticsCharts({ donorsByBloodGroup, registrationTrend, servicesByCategory }: AnalyticsChartsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Registration Trend */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Registration Trend (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={registrationTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="users"
                  name="New Users"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary) / 0.3)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="donors"
                  name="New Donors"
                  stroke="hsl(0, 84%, 60%)"
                  fill="hsl(0, 84%, 60%, 0.3)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Blood Group Distribution */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Donors by Blood Group</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donorsByBloodGroup}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {donorsByBloodGroup.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={BLOOD_COLORS[entry.name as keyof typeof BLOOD_COLORS] || CATEGORY_COLORS[index % CATEGORY_COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Services by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Services by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={servicesByCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="name" type="category" className="text-xs" width={80} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="count" name="Count" radius={[0, 4, 4, 0]}>
                  {servicesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
