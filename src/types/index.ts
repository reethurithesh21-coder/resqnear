export type ServiceCategory = 'hospital' | 'ambulance' | 'police' | 'fire' | 'ngo';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface EmergencyService {
  place_id: string;
  name: string;
  address: string;
  phone?: string;
  latitude: number;
  longitude: number;
  distance?: number;
  rating?: number;
  category: ServiceCategory;
  isOpen?: boolean;
}

export interface BloodDonor {
  id: string;
  user_id: string;
  blood_group: BloodGroup;
  full_name: string;
  phone: string;
  area: string;
  city: string;
  latitude?: number;
  longitude?: number;
  is_available: boolean;
  show_contact: boolean;
  last_donation_date?: string;
  distance?: number;
}

export interface SavedLocation {
  id: string;
  user_id: string;
  place_id: string;
  name: string;
  address?: string;
  phone?: string;
  category: string;
  latitude?: number;
  longitude?: number;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
}

export const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const SERVICE_CATEGORIES: { id: ServiceCategory; label: string; icon: string; searchQuery: string }[] = [
  { id: 'hospital', label: 'Hospitals', icon: 'Hospital', searchQuery: 'hospital' },
  { id: 'ambulance', label: 'Ambulance', icon: 'Ambulance', searchQuery: 'ambulance service' },
  { id: 'police', label: 'Police', icon: 'Shield', searchQuery: 'police station' },
  { id: 'fire', label: 'Fire Station', icon: 'Flame', searchQuery: 'fire station' },
  { id: 'ngo', label: 'NGOs', icon: 'Heart', searchQuery: 'ngo charity organization' },
];

export const EMERGENCY_HOTLINES = [
  { country: 'Universal', number: '112', label: 'Emergency' },
  { country: 'US', number: '911', label: 'Emergency' },
  { country: 'UK', number: '999', label: 'Emergency' },
  { country: 'India', number: '112', label: 'Emergency' },
];
