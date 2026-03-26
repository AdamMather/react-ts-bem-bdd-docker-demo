import { Address, Vehicle } from '../types';

const toDateOrNow = (value: unknown): Date => {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? new Date() : date;
  }

  return new Date();
};

const toText = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return '';
};

const firstText = (...values: unknown[]): string => {
  for (const value of values) {
    const text = toText(value);
    if (text) {
      return text;
    }
  }
  return '';
};

export const createEmptyAddress = (contactId = 0): Address => ({
  id: 0,
  contact_id: contactId,
  addressLine1: '',
  addressLine2: '',
  addressLine3: '',
  addressLine4: '',
  postcode: '',
  occupyStart: new Date(),
  occupyEnd: new Date(),
});

export const createEmptyVehicle = (contactId = 0): Vehicle => ({
  id: 0,
  contact_id: contactId,
  make: '',
  model: '',
  registered: new Date(),
  purchased: new Date(),
});

export const normalizeAddress = (raw: Address | null | undefined): Address => {
  const source = (raw || {}) as Record<string, unknown>;

  return {
    id: Number(source.id || 0),
    contact_id: Number(source.contact_id || 0),
    addressLine1: firstText(source.addressLine1, source.AddressLine1),
    addressLine2: firstText(source.addressLine2, source.AddressLine2),
    addressLine3: firstText(source.addressLine3, source.AddressLine3),
    addressLine4: firstText(source.addressLine4, source.AddressLine4),
    postcode: firstText(source.postcode, source.PostCode),
    occupyStart: toDateOrNow(source.occupyStart),
    occupyEnd: toDateOrNow(source.occupyEnd),
  };
};

export const normalizeVehicle = (raw: Vehicle | null | undefined): Vehicle => {
  const source = (raw || {}) as Record<string, unknown>;

  return {
    id: Number(source.id || 0),
    contact_id: Number(source.contact_id || 0),
    make: toText(source.make),
    model: toText(source.model),
    registered: toDateOrNow(source.registered),
    purchased: toDateOrNow(source.purchased),
  };
};

export const updateFormValue = <T extends object>(
  currentRecord: T,
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
): T => {
  const { name, value } = e.target;
  return { ...currentRecord, [name]: value };
};
