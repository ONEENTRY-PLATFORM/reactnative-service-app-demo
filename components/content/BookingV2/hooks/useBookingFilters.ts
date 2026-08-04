import {useMemo} from 'react';
import {ANY_MASTER, CATEGORY_ORDER} from '../constants';
import type {
  BookingData,
  BookingFlow,
  BookingMaster,
  BookingSalon,
  BookingService,
} from '../types';

// Ported verbatim from nextjs-beauty components/layout/booking-page/hooks/
// useBookingFilters.ts. Pure derivation over CMS data + selection — the
// wizard's cross-filter engine.

export interface BookingFiltersInput {
  data: BookingData;
  flow: BookingFlow | null;
  salon: number | null;
  serviceIds: string[];
  master: string;
  categoryFilter: string;
}

export interface BookingFiltersState {
  categories: string[];
  filteredMasters: BookingMaster[];
  filteredSalons: BookingSalon[];
  filteredServices: BookingService[];
}

export const useBookingFilters = ({
  data,
  flow,
  salon,
  serviceIds,
  master,
  categoryFilter,
}: BookingFiltersInput): BookingFiltersState => {
  const {salons, services, masters} = data;

  const categories = useMemo(() => {
    const present = new Set(services.map(s => s.category));
    return [
      'All',
      ...CATEGORY_ORDER.filter(c => present.has(c)),
      ...[...present].filter(c => !CATEGORY_ORDER.includes(c)),
    ];
  }, [services]);

  const filteredMasters = useMemo(() => {
    return masters.filter(m => {
      if (
        flow === 'salon-first' &&
        salon &&
        m.salonIds.length > 0 &&
        !m.salonIds.includes(salon)
      ) {
        return false;
      }
      if (
        serviceIds.length > 0 &&
        m.serviceIds.length > 0 &&
        !serviceIds.some(sid => m.serviceIds.includes(sid))
      ) {
        return false;
      }
      if (categoryFilter !== 'All' && m.serviceIds.length > 0) {
        const matchesCat = m.serviceIds.some(sid => {
          const sv = services.find(x => x.id === sid);
          return sv?.category === categoryFilter;
        });
        if (!matchesCat) return false;
      }
      return true;
    });
  }, [masters, flow, salon, serviceIds, categoryFilter, services]);

  const filteredSalons = useMemo(() => {
    if (!master || master === ANY_MASTER) return salons;
    const m = masters.find(x => x.id === master);
    if (!m || m.salonIds.length === 0) return salons;
    return salons.filter(s => m.salonIds.includes(s.id));
  }, [salons, master, masters]);

  const filteredServices = useMemo(() => {
    if (flow !== 'specialist-first' || !master) return services;
    if (master === ANY_MASTER) {
      return categoryFilter === 'All'
        ? services
        : services.filter(s => s.category === categoryFilter);
    }
    const m = masters.find(x => x.id === master);
    if (!m || m.serviceIds.length === 0) return services;
    return services.filter(s => m.serviceIds.includes(s.id));
  }, [flow, master, masters, services, categoryFilter]);

  return {categories, filteredMasters, filteredSalons, filteredServices};
};
