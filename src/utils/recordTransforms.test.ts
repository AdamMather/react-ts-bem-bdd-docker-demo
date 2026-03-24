import { describe, expect, it } from 'vitest';
import {
  createEmptyAddress,
  createEmptyVehicle,
  normalizeAddress,
  normalizeVehicle,
  updateFormValue,
} from './recordTransforms';

describe('recordTransforms', () => {
  it('creates empty address and vehicle records for a contact', () => {
    expect(createEmptyAddress(7)).toMatchObject({ id: 0, contact_id: 7, postcode: '' });
    expect(createEmptyVehicle(9)).toMatchObject({ id: 0, contact_id: 9, make: '', model: '' });
  });

  it('normalizes legacy address and vehicle payloads', () => {
    expect(
      normalizeAddress({
        id: 2,
        contact_id: 3,
        AddressLine1: '10 High Street',
        PostCode: 'AB1 2CD',
        occupyStart: '2026-01-02',
        occupyEnd: '2026-01-03',
      } as never)
    ).toMatchObject({
      id: 2,
      contact_id: 3,
      addressLine1: '10 High Street',
      postcode: 'AB1 2CD',
    });

    expect(
      normalizeVehicle({
        id: 4,
        contact_id: 5,
        make: 'Ford',
        model: 'Focus',
        registered: '2026-02-03',
        purchased: '2026-02-04',
      } as never)
    ).toMatchObject({
      id: 4,
      contact_id: 5,
      make: 'Ford',
      model: 'Focus',
    });
  });

  it('updates a form field by name', () => {
    const updated = updateFormValue(
      { name: 'Alice', postcode: 'AB1' },
      {
        target: {
          name: 'postcode',
          value: 'ZZ9',
        },
      } as React.ChangeEvent<HTMLInputElement>
    );

    expect(updated).toEqual({ name: 'Alice', postcode: 'ZZ9' });
  });
});
