import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/Icons';
import { User, Shield } from 'lucide-react';
import hospitalBg from '@/assets/hospital-bg.jpg';

export default function RoleSelect() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative bg-cover bg-center"
      style={{ backgroundImage: `url(${hospitalBg})` }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />

      <div className="w-full max-w-3xl space-y-8 relative z-10">
        {/* Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <Icons.Heart className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Welcome to ResQNear</h1>
          <p className="text-muted-foreground">
            Choose how you want to continue
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          <Card
            onClick={() => navigate('/auth')}
            className="p-8 cursor-pointer backdrop-blur-md border-border/50 hover:border-primary hover:shadow-lg transition-all group flex flex-col"
            style={{ backgroundColor: 'hsl(40 60% 92% / 0.6)' }}
          >
            <div className="flex flex-col items-center text-center h-full flex-1">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <User className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mt-4">Continue as User</h2>
              <p className="text-sm text-muted-foreground mt-1 min-h-[40px]">
                Find nearby emergency services, hospitals & blood donors
              </p>
              <Button className="w-full mt-auto">User Sign In</Button>
            </div>
          </Card>

          <Card
            onClick={() => navigate('/admin/login')}
            className="p-8 cursor-pointer backdrop-blur-md border-border/50 hover:border-primary hover:shadow-lg transition-all group flex flex-col"
            style={{ backgroundColor: 'hsl(40 60% 92% / 0.6)' }}
          >
            <div className="flex flex-col items-center text-center h-full flex-1">
              <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                <Shield className="h-8 w-8 text-secondary" />
              </div>
              <h2 className="text-xl font-semibold mt-4">Continue as Admin</h2>
              <p className="text-sm text-muted-foreground mt-1 min-h-[40px]">
                Manage services, donors and platform settings
              </p>
              <Button variant="outline" className="w-full mt-auto">
                Admin Sign In
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
