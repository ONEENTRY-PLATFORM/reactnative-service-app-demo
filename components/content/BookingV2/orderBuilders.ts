import type {IOrdersFormData} from 'oneentry/dist/orders/ordersInterfaces';
import {
  ORDER_FIELD_INTERVAL,
  ORDER_FIELD_MASTER,
  ORDER_FIELD_SALON,
} from './orderMarkers';
import type {BookingMaster, BookingSalon, BookingService} from './types';

// Ported from nextjs-beauty components/layout/booking-page/utils/
// buildOrderFormData.ts and buildOrderProducts.ts. The `order` form's set
// carries exactly three fields — master, salon, interval — and rejects any
// extra marker with 400, so keep this list tight.

export interface OrderProduct {
  productId: number;
  quantity: number;
}

export const buildOrderFormData = ({
  salon,
  master,
  interval,
}: {
  salon?: BookingSalon | undefined;
  master?: BookingMaster | undefined;
  interval: [Date, Date];
}): IOrdersFormData[] => {
  const formData: IOrdersFormData[] = [];

  if (master?.adminId) {
    formData.push({
      marker: ORDER_FIELD_MASTER,
      type: 'list',
      value: [master.adminId.toString()],
    } as IOrdersFormData);
  }

  const salonId = salon?.id;
  if (salonId) {
    formData.push({
      marker: ORDER_FIELD_SALON,
      type: 'entity',
      value: [salonId],
    } as IOrdersFormData);
  }

  const [start, end] = interval;
  formData.push({
    marker: ORDER_FIELD_INTERVAL,
    type: 'timeInterval',
    value: [[start.toISOString(), end.toISOString()]],
  } as IOrdersFormData);

  return formData;
};

export const buildOrderProducts = (
  services: BookingService[],
): OrderProduct[] =>
  services
    .filter(sv => sv.productId)
    .map(sv => ({productId: sv.productId as number, quantity: 1}));
