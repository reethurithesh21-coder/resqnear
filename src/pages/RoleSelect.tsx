import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/Icons';
import { User, Shield } from 'lucide-react';

export default function RoleSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-3xl space-y-8">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            onClick={() => navigate('/auth')}
            className="p-8 cursor-pointer hover:border-primary hover:shadow-lg transition-all group"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Continue as User</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Find nearby emergency services, hospitals & blood donors
                </p>
              </div>
              <Button className="w-full mt-2">User Sign In</Button>
            </div>
          </Card>

          <Card
            onClick={() => navigate('/admin/login')}
            className="p-8 cursor-pointer hover:border-primary hover:shadow-lg transition-all group"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                <Shield className="h-8 w-8 text-secondary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Continue as Admin</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage services, donors and platform settings
                </p>
              </div>
              <Button variant="outline" className="w-full mt-2">
                Admin Sign In
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
