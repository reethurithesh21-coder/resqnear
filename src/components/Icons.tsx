import { Hospital, Ambulance, Shield, Flame, Heart, Droplets, Phone, MapPin, Navigation, Star, Clock, User, LogOut, Menu, X, Search, ChevronRight, AlertTriangle, Check, Loader2, Plus, Minus } from 'lucide-react';
import { ServiceCategory } from '@/types';

export const Icons = {
  Hospital,
  Ambulance,
  Shield,
  Flame,
  Heart,
  Droplets,
  Phone,
  MapPin,
  Navigation,
  Star,
  Clock,
  User,
  LogOut,
  Menu,
  X,
  Search,
  ChevronRight,
  AlertTriangle,
  Check,
  Loader2,
  Plus,
  Minus,
} as const;

export function getCategoryIcon(category: ServiceCategory) {
  switch (category) {
    case 'hospital':
      return Hospital;
    case 'ambulance':
      return Ambulance;
    case 'ngo':
      return Heart;
    default:
      return MapPin;
  }
}

export function getCategoryColor(category: ServiceCategory): string {
  switch (category) {
    case 'hospital':
      return 'bg-hospital text-white';
    case 'ambulance':
      return 'bg-ambulance text-white';
    case 'ngo':
      return 'bg-ngo text-white';
    default:
      return 'bg-primary text-primary-foreground';
  }
}
