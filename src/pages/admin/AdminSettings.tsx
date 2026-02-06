import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Bell, 
  Globe, 
  Shield,
  Mail,
  Database,
  RefreshCw,
  Save
} from 'lucide-react';

export default function AdminSettings() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    siteName: 'ResQNear',
    contactEmail: 'support@resqnear.com',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    autoApproveServices: false,
    emergencyMessage: '',
  });

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    toast({
      title: 'Settings saved',
      description: 'Your changes have been saved successfully.',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Configure platform settings</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              Basic platform configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Banner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Emergency Banner
            </CardTitle>
            <CardDescription>
              Display an emergency message to all users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyMessage">Emergency Message (leave blank to hide)</Label>
              <Textarea
                id="emergencyMessage"
                placeholder="Enter an emergency message to display on the homepage..."
                value={settings.emergencyMessage}
                onChange={(e) => setSettings(prev => ({ ...prev, emergencyMessage: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* User & Registration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              User & Registration
            </CardTitle>
            <CardDescription>
              Control user registration and access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allowRegistration">Allow New Registrations</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable new user sign-ups
                </p>
              </div>
              <Switch
                id="allowRegistration"
                checked={settings.allowRegistration}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowRegistration: checked }))}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Users must verify their email before accessing the platform
                </p>
              </div>
              <Switch
                id="requireEmailVerification"
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireEmailVerification: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Service Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Service Management
            </CardTitle>
            <CardDescription>
              Configure emergency services settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoApproveServices">Auto-approve Services</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically approve newly added emergency services
                </p>
              </div>
              <Switch
                id="autoApproveServices"
                checked={settings.autoApproveServices}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoApproveServices: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Maintenance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Maintenance Mode
            </CardTitle>
            <CardDescription>
              Put the platform in maintenance mode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="maintenanceMode">Enable Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Only admins can access the platform when enabled
                </p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenanceMode: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Export and manage platform data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full md:w-auto">
              Export All Users Data
            </Button>
            <Button variant="outline" className="w-full md:w-auto ml-0 md:ml-2">
              Export Blood Donors Data
            </Button>
            <Button variant="outline" className="w-full md:w-auto ml-0 md:ml-2">
              Export Services Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
