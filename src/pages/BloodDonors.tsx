import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { DonorCard } from '@/components/DonorCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/Icons';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { supabase } from '@/integrations/supabase/client';
import { BloodDonor, BloodGroup, BLOOD_GROUPS } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';

const BloodDonors = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { latitude, longitude } = useGeolocation();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState(searchParams.get('register') === 'true' ? 'register' : 'search');
  const [donors, setDonors] = useState<BloodDonor[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<BloodGroup | 'all'>('all');
  
  const [formData, setFormData] = useState({
    blood_group: '' as BloodGroup | '',
    full_name: '',
    phone: '',
    area: '',
    city: '',
    is_available: true,
    show_contact: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [existingDonor, setExistingDonor] = useState<BloodDonor | null>(null);

  // Fetch donors
  useEffect(() => {
    const fetchDonors = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('blood_donors')
          .select('*')
          .eq('is_available', true)
          .eq('show_contact', true);

        if (selectedBloodGroup !== 'all') {
          query = query.eq('blood_group', selectedBloodGroup);
        }

        const { data, error } = await query;
        if (error) throw error;

        let donorsWithDistance = (data as BloodDonor[]) || [];
        if (latitude && longitude) {
          donorsWithDistance = donorsWithDistance.map(donor => {
            if (donor.latitude && donor.longitude) {
              const distance = calculateDistance(latitude, longitude, donor.latitude, donor.longitude);
              return { ...donor, distance };
            }
            return donor;
          }).sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        }

        setDonors(donorsWithDistance);
      } catch (error) {
        console.error('Error fetching donors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonors();
  }, [selectedBloodGroup, latitude, longitude]);

  // Check if user already registered as donor
  useEffect(() => {
    const checkExistingDonor = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('blood_donors')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setExistingDonor(data as BloodDonor);
        setFormData({
          blood_group: data.blood_group as BloodGroup,
          full_name: data.full_name,
          phone: data.phone,
          area: data.area,
          city: data.city,
          is_available: data.is_available,
          show_contact: data.show_contact,
        });
      }
    };
    checkExistingDonor();
  }, [user]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth?redirect=/blood-donors?register=true');
      return;
    }
    if (!formData.blood_group || !formData.full_name || !formData.phone || !formData.area || !formData.city) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const donorData = {
        user_id: user.id,
        blood_group: formData.blood_group,
        full_name: formData.full_name,
        phone: formData.phone,
        area: formData.area,
        city: formData.city,
        is_available: formData.is_available,
        show_contact: formData.show_contact,
        latitude: latitude || null,
        longitude: longitude || null,
      };

      if (existingDonor) {
        const { error } = await supabase.from('blood_donors').update(donorData).eq('id', existingDonor.id);
        if (error) throw error;
        toast({ title: 'Profile updated!', description: 'Your donor profile has been updated successfully.' });
      } else {
        const { error } = await supabase.from('blood_donors').insert(donorData);
        if (error) throw error;
        toast({ title: 'Registration successful!', description: 'Thank you for registering as a blood donor.' });
      }
      setActiveTab('search');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Something went wrong.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blood">
              <Icons.Droplets className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('blood.title')}</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {t('blood.subtitle')}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-3xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">{t('blood.findDonors')}</TabsTrigger>
            <TabsTrigger value="register">
              {existingDonor ? t('blood.myProfile') : t('blood.registerDonor')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4 mt-6">
            <div className="flex gap-3">
              <Select 
                value={selectedBloodGroup} 
                onValueChange={(value) => setSelectedBloodGroup(value as BloodGroup | 'all')}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('blood.bloodGroup')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('blood.allGroups')}</SelectItem>
                  {BLOOD_GROUPS.map((group) => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Icons.Loader2 className="h-8 w-8 animate-spin text-blood" />
              </div>
            ) : donors.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Icons.Droplets className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('blood.noDonors')}</p>
                <Button 
                  variant="link" 
                  className="mt-2 text-blood"
                  onClick={() => setActiveTab('register')}
                >
                  {t('blood.beFirst')}
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {donors.map((donor) => (
                  <DonorCard key={donor.id} donor={donor} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="register" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {existingDonor ? t('blood.updateProfile') : t('blood.registerTitle')}
                </CardTitle>
                <CardDescription>
                  {existingDonor ? t('blood.updateDesc') : t('blood.registerDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!user && (
                  <div className="bg-muted rounded-lg p-4 mb-6 text-center">
                    <p className="text-muted-foreground mb-3">{t('blood.signInRequired')}</p>
                    <Button onClick={() => navigate('/auth?redirect=/blood-donors?register=true')}>
                      {t('blood.signInContinue')}
                    </Button>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="blood_group">{t('blood.bloodGroup')} *</Label>
                      <Select 
                        value={formData.blood_group} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, blood_group: value as BloodGroup }))}
                        disabled={!user}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('blood.bloodGroup')} />
                        </SelectTrigger>
                        <SelectContent>
                          {BLOOD_GROUPS.map((group) => (
                            <SelectItem key={group} value={group}>{group}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="full_name">{t('blood.fullName')} *</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        placeholder={t('blood.fullName')}
                        disabled={!user}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('blood.phone')} *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+1 234 567 8900"
                        disabled={!user}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="area">{t('blood.area')} *</Label>
                      <Input
                        id="area"
                        value={formData.area}
                        onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                        placeholder={t('blood.area')}
                        disabled={!user}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">{t('blood.city')} *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder={t('blood.city')}
                      disabled={!user}
                    />
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="is_available">{t('blood.available')}</Label>
                        <p className="text-sm text-muted-foreground">{t('blood.availableDesc')}</p>
                      </div>
                      <Switch
                        id="is_available"
                        checked={formData.is_available}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_available: checked }))}
                        disabled={!user}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="show_contact">{t('blood.showContact')}</Label>
                        <p className="text-sm text-muted-foreground">{t('blood.showContactDesc')}</p>
                      </div>
                      <Switch
                        id="show_contact"
                        checked={formData.show_contact}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_contact: checked }))}
                        disabled={!user}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-blood hover:bg-blood/90"
                    disabled={!user || submitting}
                  >
                    {submitting ? (
                      <>
                        <Icons.Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {existingDonor ? t('blood.updating') : t('blood.registering')}
                      </>
                    ) : (
                      existingDonor ? t('blood.updateBtn') : t('blood.registerBtn')
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default BloodDonors;
