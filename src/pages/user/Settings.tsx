import { useState } from 'react';
import { UserLayout } from '@/components/user/UserLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';
import { 
  Bell, 
  MapPin, 
  Moon, 
  Shield, 
  Smartphone,
  Globe,
  HelpCircle,
  MessageSquare
} from 'lucide-react';

export default function UserSettings() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [settings, setSettings] = useState({
    notifications: true,
    locationTracking: true,
    darkMode: false,
    emergencyAlerts: true,
  });

  const handleSettingChange = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast({
      title: 'Setting updated',
      description: 'Your preference has been saved.',
    });
  };

  return (
    <UserLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t('settings.title')}</h1>
          <p className="text-muted-foreground">{t('settings.subtitle')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t('settings.notifications')}
            </CardTitle>
            <CardDescription>{t('settings.notificationsDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">{t('settings.push')}</Label>
                <p className="text-sm text-muted-foreground">{t('settings.pushDesc')}</p>
              </div>
              <Switch id="notifications" checked={settings.notifications} onCheckedChange={() => handleSettingChange('notifications')} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emergencyAlerts">{t('settings.emergency')}</Label>
                <p className="text-sm text-muted-foreground">{t('settings.emergencyDesc')}</p>
              </div>
              <Switch id="emergencyAlerts" checked={settings.emergencyAlerts} onCheckedChange={() => handleSettingChange('emergencyAlerts')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t('settings.location')}
            </CardTitle>
            <CardDescription>{t('settings.locationDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="locationTracking">{t('settings.locationServices')}</Label>
                <p className="text-sm text-muted-foreground">{t('settings.locationServicesDesc')}</p>
              </div>
              <Switch id="locationTracking" checked={settings.locationTracking} onCheckedChange={() => handleSettingChange('locationTracking')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              {t('settings.appearance')}
            </CardTitle>
            <CardDescription>{t('settings.appearanceDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="darkMode">{t('settings.darkMode')}</Label>
                <p className="text-sm text-muted-foreground">{t('settings.darkModeDesc')}</p>
              </div>
              <Switch id="darkMode" checked={settings.darkMode} onCheckedChange={() => handleSettingChange('darkMode')} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t('settings.privacy')}
            </CardTitle>
            <CardDescription>{t('settings.privacyDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Smartphone className="h-4 w-4 mr-2" />
              {t('settings.devices')}
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Globe className="h-4 w-4 mr-2" />
              {t('settings.dataPolicy')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              {t('settings.help')}
            </CardTitle>
            <CardDescription>{t('settings.helpDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <HelpCircle className="h-4 w-4 mr-2" />
              {t('settings.helpCenter')}
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="h-4 w-4 mr-2" />
              {t('settings.contactSupport')}
            </Button>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground py-4">
          <p>ResQNear v1.0.0</p>
          <p className="mt-1">© 2024 ResQNear. All rights reserved.</p>
        </div>
      </div>
    </UserLayout>
  );
}
