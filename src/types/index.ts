// src/types/index.ts
export interface Contact {
    id: number;
    first_name: string;
    last_name: string;
    telephone: string;
    mobile: string;
    email: string;
    primary_contact: string;
}

export interface ContactNames {
  id: number;
  contact: string;
}

export interface Address {
  id: number;
  contact_id: number;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  addressLine4: string;
  postcode: string;
  occupyStart?: Date;
  occupyEnd?: Date;
}

export interface Vehicle {
  id: number;
  contact_id: number;
  make: string;
  model: string;
  registered: Date;
  purchased: Date;
}