import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/Icons';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Profile, BloodDonor, SavedLocation } from '@/types';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [donorProfile, setDonorProfile] = useState<BloodDonor | null>(null);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=/profile');
      return;
    }

    if (user) {
      fetchUserData();
    }
  }, [user, authLoading, navigate]);

  const fetchUserData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData as Profile);
        setFormData({
          full_name: profileData.full_name || '',
          phone: profileData.phone || '',
        });
      }

      // Fetch donor profile
      const { data: donorData } = await supabase
        .from('blood_donors')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (donorData) {
        setDonorProfile(donorData as BloodDonor);
      }

      // Fetch saved locations
      const { data: locationsData } = await supabase
        .from('saved_locations')
        .select('*')
        .eq('user_id', user.id);

      if (locationsData) {
        setSavedLocations(locationsData as SavedLocation[]);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteSavedLocation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_locations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSavedLocations(prev => prev.filter(loc => loc.id !== id));
      toast({
        title: 'Location removed',
        description: 'Saved location has been removed.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to remove location.',
        variant: 'destructive',
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/home');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center items-center py-24">
          <Icons.Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <Icons.LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="donor">Donor Status</TabsTrigger>
            <TabsTrigger value="saved">Saved Locations</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details here.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  <Button type="submit" disabled={updating}>
                    {updating ? (
                      <>
                        <Icons.Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      'Update Profile'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="donor">
            <Card>
              <CardHeader>
                <CardTitle>Blood Donor Status</CardTitle>
                <CardDescription>
                  {donorProfile 
                    ? 'You are registered as a blood donor.'
                    : 'You are not registered as a blood donor yet.'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {donorProfile ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-blood/10 rounded-lg">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blood text-white font-bold text-xl">
                        {donorProfile.blood_group}
                      </div>
                      <div>
                        <p className="font-semibold">{donorProfile.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {donorProfile.area}, {donorProfile.city}
                        </p>
                        <p className="text-sm">
                          Status: {donorProfile.is_available ? (
                            <span className="text-secondary font-medium">Available</span>
                          ) : (
                            <span className="text-muted-foreground">Unavailable</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/blood-donors?register=true')}>
                      Edit Donor Profile
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Icons.Droplets className="h-12 w-12 mx-auto mb-4 text-blood opacity-50" />
                    <p className="text-muted-foreground mb-4">
                      Register as a blood donor to help save lives in emergencies.
                    </p>
                    <Button 
                      className="bg-blood hover:bg-blood/90"
                      onClick={() => navigate('/blood-donors?register=true')}
                    >
                      Register as Donor
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved">
            <Card>
              <CardHeader>
                <CardTitle>Saved Locations</CardTitle>
                <CardDescription>Your saved emergency service locations.</CardDescription>
              </CardHeader>
              <CardContent>
                {savedLocations.length === 0 ? (
                  <div className="text-center py-6">
                    <Icons.MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">
                      No saved locations yet. Save locations from the search page for quick access.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedLocations.map((location) => (
                      <div key={location.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Icons.MapPin className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">{location.name}</p>
                            <p className="text-sm text-muted-foreground">{location.address}</p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteSavedLocation(location.id)}
                        >
                          <Icons.X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ProfilePage;
