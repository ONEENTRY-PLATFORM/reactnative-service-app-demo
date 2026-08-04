import type {IAttributeValue} from 'oneentry/dist/base/utils';

// Ported verbatim from nextjs-beauty components/layout/booking-page/types.ts.
// Plain serializable data shapes for the booking wizard.

export interface BookingSalon {
  id: number;
  name: string;
  address: string;
  phone: string;
  schedule?: IAttributeValue | undefined;
}

export interface BookingService {
  id: string;
  category: string;
  name: string;
  duration: string;
  durationMinutes: number | null;
  price: number | null;
  currency: string;
  productId: number | null;
  categoryId: number | null;
}

export interface BookingMaster {
  id: string;
  adminId: number | null;
  name: string;
  grade: string;
  photo: string;
  photoBlur?: string | undefined;
  specialties: string[];
  rating: number;
  reviews: number | null;
  price: number | null;
  bio: string;
  salonIds: number[];
  serviceIds: string[];
  schedule?: IAttributeValue | undefined;
}

export interface BookingData {
  salons: BookingSalon[];
  services: BookingService[];
  masters: BookingMaster[];
}

export type BookingFlow = 'salon-first' | 'specialist-first';
export type StepKey = 'salon' | 'service' | 'specialist' | 'datetime';
