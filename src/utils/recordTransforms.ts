import { Address, Vehicle } from '../types';

const toDateOrNow = (value: unknown): Date => (value ? new Date(String(value)) : new Date());

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
    addressLine1: String(source.addressLine1 || source.AddressLine1 || ''),
    addressLine2: String(source.addressLine2 || source.AddressLine2 || ''),
    addressLine3: String(source.addressLine3 || source.AddressLine3 || ''),
    addressLine4: String(source.addressLine4 || source.AddressLine4 || ''),
    postcode: String(source.postcode || source.PostCode || ''),
    occupyStart: toDateOrNow(source.occupyStart),
    occupyEnd: toDateOrNow(source.occupyEnd),
  };
};

export const normalizeVehicle = (raw: Vehicle | null | undefined): Vehicle => {
  const source = (raw || {}) as Record<string, unknown>;

  return {
    id: Number(source.id || 0),
    contact_id: Number(source.contact_id || 0),
    make: String(source.make || ''),
    model: String(source.model || ''),
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
