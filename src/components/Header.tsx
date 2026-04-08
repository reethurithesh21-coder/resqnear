import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Icons } from '@/components/Icons';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { useState } from 'react';
import { Settings, ArrowLeft } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLanguage } from '@/i18n/LanguageContext';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const handleSignOut = async () => {
    await signOut();
    navigate('/home');
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { href: '/home', label: t('nav.home') },
    { href: '/search', label: t('nav.findServices') },
    { href: '/blood-donors', label: t('nav.bloodDonors') },
    ...(user ? [{ href: '/dashboard', label: t('nav.dashboard') }] : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          {location.pathname !== '/' && (
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Link to="/home" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Icons.Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">ResQNear</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive(link.href) ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth + Language */}
        <div className="hidden md:flex items-center gap-2">
          <LanguageSwitcher />
          {isAdmin && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin">
                <Settings className="h-4 w-4 mr-2" />
                {t('nav.admin')}
              </Link>
            </Button>
          )}
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile">
                  <Icons.User className="h-4 w-4 mr-2" />
                  {t('nav.profile')}
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <Icons.LogOut className="h-4 w-4 mr-2" />
                {t('nav.signOut')}
              </Button>
            </>
          ) : (
            <Button size="sm" asChild>
              <Link to="/auth">{t('nav.signIn')}</Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="flex md:hidden items-center gap-1">
          <LanguageSwitcher />
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Icons.Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-lg font-medium transition-colors hover:text-primary ${
                      isActive(link.href) ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium hover:text-primary flex items-center gap-2"
                  >
                    <Settings className="h-5 w-5" />
                    {t('nav.adminPanel')}
                  </Link>
                )}
                <hr className="my-2" />
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-medium hover:text-primary"
                    >
                      {t('nav.profile')}
                    </Link>
                    <Button variant="outline" onClick={handleSignOut}>
                      {t('nav.signOut')}
                    </Button>
                  </>
                ) : (
                  <Button asChild>
                    <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                      {t('nav.signIn')}
                    </Link>
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
