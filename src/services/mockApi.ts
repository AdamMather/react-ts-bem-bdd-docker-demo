import { Address, Contact, Vehicle } from '../types';

type QueryParams = Record<string, string>;

interface RequestOptions {
  params?: QueryParams;
  data?: { ids?: number[]; selectedIds?: number[] };
}

const normalizePath = (url: string): string => {
  if (!url) {
    return '';
  }

  try {
    return new URL(url, 'http://local.mock').pathname;
  } catch {
    return url;
  }
};

const toDate = (value: Date | string): Date => {
  if (value instanceof Date) {
    return value;
  }

  return new Date(value);
};

let nextContactId = 4;
let nextAddressId = 4;
let nextVehicleId = 4;

let contacts: Contact[] = [
  {
    id: 1,
    first_name: 'Alice',
    last_name: 'Morris',
    telephone: '02079461234',
    mobile: '07700900111',
    email: 'alice.morris@example.com',
    primary_contact: 'email',
  },
  {
    id: 2,
    first_name: 'Ben',
    last_name: 'Hughes',
    telephone: '02079464567',
    mobile: '07700900222',
    email: 'ben.hughes@example.com',
    primary_contact: 'mobile',
  },
  {
    id: 3,
    first_name: 'Chloe',
    last_name: 'Patel',
    telephone: '02079467890',
    mobile: '07700900333',
    email: 'chloe.patel@example.com',
    primary_contact: 'telephone',
  },
];

let addresses: Address[] = [
  {
    id: 1,
    contact_id: 1,
    addressLine1: '10 Fleet Street',
    addressLine2: 'London',
    addressLine3: '',
    addressLine4: '',
    postcode: 'EC4Y 1AA',
    occupyStart: new Date('2021-01-01'),
    occupyEnd: new Date('2023-12-31'),
  },
  {
    id: 2,
    contact_id: 2,
    addressLine1: '12 Deansgate',
    addressLine2: 'Manchester',
    addressLine3: '',
    addressLine4: '',
    postcode: 'M3 2BW',
    occupyStart: new Date('2022-06-01'),
    occupyEnd: new Date('2024-01-31'),
  },
  {
    id: 3,
    contact_id: 3,
    addressLine1: '1 Queen Street',
    addressLine2: 'Bristol',
    addressLine3: '',
    addressLine4: '',
    postcode: 'BS1 4JQ',
    occupyStart: new Date('2020-09-15'),
    occupyEnd: new Date('2025-02-28'),
  },
];

let vehicles: Vehicle[] = [
  {
    id: 1,
    contact_id: 1,
    make: 'Toyota',
    model: 'Corolla',
    registered: new Date('2021-03-10'),
    purchased: new Date('2021-05-01'),
  },
  {
    id: 2,
    contact_id: 2,
    make: 'Ford',
    model: 'Focus',
    registered: new Date('2020-11-15'),
    purchased: new Date('2021-02-20'),
  },
  {
    id: 3,
    contact_id: 3,
    make: 'Tesla',
    model: 'Model 3',
    registered: new Date('2022-08-08'),
    purchased: new Date('2022-09-01'),
  },
];

const vehicleMakes = ['Audi', 'BMW', 'Ford', 'Honda', 'Tesla', 'Toyota', 'Volkswagen'];
const vehicleModels = ['A3', 'Civic', 'Corolla', 'Focus', 'Golf', 'Model 3', 'X5'];

const filterSuggestions = (values: string[], query: string) =>
  values
    .filter((value) => value.toLowerCase().startsWith(query.toLowerCase()))
    .slice(0, 10)
    .map((name) => ({ name }));

const deleteByIds = <T extends { id: number }>(items: T[], ids: number[]) =>
  items.filter((item) => !ids.includes(item.id));

const createDefaultAddress = (contactId: number, firstName: string, lastName: string): Address => ({
  id: nextAddressId++,
  contact_id: contactId,
  addressLine1: `${firstName || 'New'} ${lastName || 'Contact'} House`,
  addressLine2: '1 Example Street',
  addressLine3: 'London',
  addressLine4: '',
  postcode: 'EC1A 1AA',
  occupyStart: new Date('2024-01-01'),
  occupyEnd: new Date('2026-12-31'),
});

const createDefaultVehicle = (contactId: number): Vehicle => ({
  id: nextVehicleId++,
  contact_id: contactId,
  make: 'Toyota',
  model: 'Corolla',
  registered: new Date('2023-04-01'),
  purchased: new Date('2023-05-15'),
});

const mockApi = {
  async get(url: string, options: RequestOptions = {}) {
    const path = normalizePath(url);

    if (path === '/api/contacts') {
      return { data: contacts };
    }

    if (path === '/api/contact/names') {
      return {
        data: contacts.map((contact) => ({
          id: contact.id,
          contact: `${contact.first_name} ${contact.last_name}`.trim(),
        })),
      };
    }

    if (path === '/api/contact/address') {
      return { data: addresses };
    }

    const addressByContact = path.match(/^\/api\/contact\/address\/(\d+)$/);
    if (addressByContact) {
      const contactId = Number(addressByContact[1]);
      return { data: addresses.filter((address) => address.contact_id === contactId) };
    }

    if (path === '/api/vehicles') {
      return { data: vehicles };
    }

    const vehiclesByContact = path.match(/^\/api\/vehicles\/(\d+)$/);
    if (vehiclesByContact) {
      const contactId = Number(vehiclesByContact[1]);
      return { data: vehicles.filter((vehicle) => vehicle.contact_id === contactId) };
    }

    if (path === '/utils/vehiclemake') {
      const query = options.params?.query || '';
      return { data: { suggestions: filterSuggestions(vehicleMakes, query) } };
    }

    if (path === '/utils/vehiclemodel') {
      const query = options.params?.query || '';
      return { data: { suggestions: filterSuggestions(vehicleModels, query) } };
    }

    return { data: [] };
  },

  async post(url: string, data: Contact | Address | Vehicle) {
    const path = normalizePath(url);

    if (path === '/api/contacts') {
      const contact = { ...(data as Contact), id: nextContactId++ };
      contacts = [...contacts, contact];
      addresses = [...addresses, createDefaultAddress(contact.id, contact.first_name, contact.last_name)];
      vehicles = [...vehicles, createDefaultVehicle(contact.id)];
      return { data: contact };
    }

    if (path === '/api/contact/address') {
      const address = { ...(data as Address), id: nextAddressId++, occupyStart: toDate((data as Address).occupyStart as Date | string), occupyEnd: toDate((data as Address).occupyEnd as Date | string) };
      addresses = [...addresses, address];
      return { data: address };
    }

    if (path === '/api/vehicles') {
      const vehicle = { ...(data as Vehicle), id: nextVehicleId++, registered: toDate((data as Vehicle).registered), purchased: toDate((data as Vehicle).purchased) };
      vehicles = [...vehicles, vehicle];
      return { data: vehicle };
    }

    return { data: null };
  },

  async put(url: string, data: Contact | Address | Vehicle) {
    const path = normalizePath(url);

    const contactMatch = path.match(/^\/api\/contacts\/(\d+)$/);
    if (contactMatch) {
      const id = Number(contactMatch[1]);
      contacts = contacts.map((contact) => (contact.id === id ? { ...(data as Contact), id } : contact));
      return { data: null };
    }

    const addressMatch = path.match(/^\/api\/contact\/address\/(\d+)$/);
    if (addressMatch) {
      const id = Number(addressMatch[1]);
      const nextAddress = data as Address;
      addresses = addresses.map((address) =>
        address.id === id
          ? {
              ...nextAddress,
              id,
              occupyStart: toDate(nextAddress.occupyStart as Date | string),
              occupyEnd: toDate(nextAddress.occupyEnd as Date | string),
            }
          : address
      );
      return { data: null };
    }

    const vehicleMatch = path.match(/^\/api\/vehicles\/(\d+)$/);
    if (vehicleMatch) {
      const id = Number(vehicleMatch[1]);
      const nextVehicle = data as Vehicle;
      vehicles = vehicles.map((vehicle) =>
        vehicle.id === id
          ? {
              ...nextVehicle,
              id,
              registered: toDate(nextVehicle.registered),
              purchased: toDate(nextVehicle.purchased),
            }
          : vehicle
      );
      return { data: null };
    }

    return { data: null };
  },

  async delete(url: string, options: RequestOptions = {}) {
    const path = normalizePath(url);
    const ids = options.data?.ids || options.data?.selectedIds || [];

    if (path === '/api/contacts') {
      contacts = deleteByIds(contacts, ids);
      addresses = addresses.filter((address) => !ids.includes(address.contact_id));
      vehicles = vehicles.filter((vehicle) => !ids.includes(vehicle.contact_id));
      return { data: null };
    }

    if (path === '/api/contact/address') {
      addresses = deleteByIds(addresses, ids);
      return { data: null };
    }

    if (path === '/api/vehicles') {
      vehicles = deleteByIds(vehicles, ids);
      return { data: null };
    }

    return { data: null };
  },
};

export default mockApi;
