import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Heart, Mail, Lock, Eye, EyeOff, Loader2, User, ArrowLeft } from 'lucide-react';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/home';
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  // Load remembered email
  useEffect(() => {
    const remembered = localStorage.getItem('resqnear_remembered_email');
    if (remembered) {
      setFormData(prev => ({ ...prev, email: remembered }));
      setRememberMe(true);
    }
  }, []);

  // Redirect if already logged in
  if (user) {
    navigate(redirect);
    return null;
  }

  const validateForm = () => {
    const newErrors = { email: '', password: '', fullName: '' };
    let isValid = true;

    try {
      emailSchema.parse(formData.email);
    } catch (e: any) {
      newErrors.email = e.errors[0].message;
      isValid = false;
    }

    try {
      passwordSchema.parse(formData.password);
    } catch (e: any) {
      newErrors.password = e.errors[0].message;
      isValid = false;
    }

    if (activeTab === 'signup' && !formData.fullName.trim()) {
      newErrors.fullName = 'Please enter your name';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (activeTab === 'signin') {
        // Remember email
        if (rememberMe) {
          localStorage.setItem('resqnear_remembered_email', formData.email);
        } else {
          localStorage.removeItem('resqnear_remembered_email');
        }

        const { error } = await signIn(formData.email, formData.password);

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setErrors(prev => ({ ...prev, email: 'Invalid email or password' }));
          } else if (error.message.includes('Email not confirmed')) {
            toast({
              title: 'Email not verified',
              description: 'Please check your email and verify your account before signing in.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Sign in failed',
              description: error.message,
              variant: 'destructive',
            });
          }
          return;
        }

        toast({
          title: 'Welcome back!',
          description: 'You have successfully signed in.',
        });
        navigate(redirect);
      } else {
        const { error } = await signUp(formData.email, formData.password, formData.fullName);

        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Account exists',
              description: 'An account with this email already exists. Please sign in instead.',
              variant: 'destructive',
            });
            setActiveTab('signin');
          } else {
            toast({
              title: 'Sign up failed',
              description: error.message,
              variant: 'destructive',
            });
          }
          return;
        }

        toast({
          title: 'Account created!',
          description: 'Please check your email to verify your account before signing in.',
        });
        setActiveTab('signin');
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 animate-pulse" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-secondary/15 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

      {/* Back to home */}
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <div className="w-full max-w-md z-10">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary shadow-lg shadow-primary/30 mb-4 transition-transform hover:scale-105">
            <Heart className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            ResQNear
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {activeTab === 'signin'
              ? 'Welcome back! Sign in to continue.'
              : 'Create an account to get started.'}
          </p>
        </div>

        {/* Glass card */}
        <Card className="backdrop-blur-xl bg-card/80 border-border/50 shadow-2xl shadow-primary/5">
          <CardContent className="p-6 space-y-6">
            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={(v) => {
                setActiveTab(v as 'signin' | 'signup');
                setErrors({ email: '', password: '', fullName: '' });
              }}
            >
              <TabsList className="grid w-full grid-cols-2 bg-muted/60">
                <TabsTrigger value="signin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
                  Sign Up
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name (signup only) */}
              {activeTab === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                      }
                      placeholder="Your full name"
                      className="pl-10 h-11 bg-background/60 border-border/60 focus:border-primary focus:bg-background transition-all"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                      {errors.fullName}
                    </p>
                  )}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="you@example.com"
                    className="pl-10 h-11 bg-background/60 border-border/60 focus:border-primary focus:bg-background transition-all"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  {activeTab === 'signin' && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!formData.email) {
                          setErrors(prev => ({ ...prev, email: 'Enter your email first to reset password' }));
                          return;
                        }
                        try {
                          const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
                            redirectTo: `${window.location.origin}/reset-password`,
                          });
                          if (error) throw error;
                          toast({
                            title: 'Check your email',
                            description: 'We sent you a password reset link.',
                          });
                        } catch {
                          toast({
                            title: 'Error',
                            description: 'Could not send reset email. Please try again.',
                            variant: 'destructive',
                          });
                        }
                      }}
                      className="text-xs text-primary hover:text-primary/80 hover:underline transition-colors"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, password: e.target.value }))
                    }
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-11 bg-background/60 border-border/60 focus:border-primary focus:bg-background transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember me (sign in only) */}
              {activeTab === 'signin' && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                  <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                    Remember me
                  </Label>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-11 text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {activeTab === 'signin' ? 'Signing in…' : 'Creating account…'}
                  </span>
                ) : activeTab === 'signin' ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card/80 px-3 text-muted-foreground">
                  {activeTab === 'signin' ? "Don't have an account?" : 'Already have an account?'}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-10 text-sm border-border/60 hover:bg-accent/50 transition-all"
              onClick={() => {
                setActiveTab(activeTab === 'signin' ? 'signup' : 'signin');
                setErrors({ email: '', password: '', fullName: '' });
              }}
            >
              {activeTab === 'signin' ? 'Create Account' : 'Sign In Instead'}
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing, you agree to ResQNear's{' '}
          <span className="underline cursor-pointer hover:text-foreground transition-colors">Terms</span> and{' '}
          <span className="underline cursor-pointer hover:text-foreground transition-colors">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};

export default Auth;
