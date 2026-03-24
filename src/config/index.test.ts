import { describe, expect, it } from 'vitest';
import config, { vehicleDetail } from './index';

describe('config', () => {
  it('builds API and navigation config values from the default base url', () => {
    expect(config.apiContacts).toBe('http://127.0.0.1:3001/api/contacts');
    expect(config.apiContactNames).toBe('http://127.0.0.1:3001/api/contact/names');
    expect(config.apiAddress).toBe('http://127.0.0.1:3001/api/contact/address');
    expect(config.apiVehicles).toBe('http://127.0.0.1:3001/api/vehicles');
    expect(config.apiBoardingOwners).toBe('http://127.0.0.1:3001/api/boarding/owners');
    expect(config.apiBoardingSpecies).toBe('http://127.0.0.1:3001/api/boarding/lookups/species');
    expect(config.apiBoardingBreeds).toBe('http://127.0.0.1:3001/api/boarding/lookups/breeds');
    expect(config.apiBoardingVets).toBe('http://127.0.0.1:3001/api/boarding/lookups/vets');
    expect(config.apiBoardingInsuranceProviders).toBe('http://127.0.0.1:3001/api/boarding/lookups/insurance-providers');
    expect(config.utilsVehicleMake).toBe('http://127.0.0.1:3001/utils/vehiclemake');
    expect(config.utilsVehicleModel).toBe('http://127.0.0.1:3001/utils/vehiclemodel');
    expect(config.navContactList).toBe('nav_contact_list');
    expect(config.navVehicleList).toBe('nav_vehicle_list');
    expect(config.navContacts).toBe('nav_contacts');
    expect(config.navAddress).toBe('nav_address');
    expect(config.navVehicles).toBe('nav_vehicles');
    expect(config.navBoardingList).toBe('nav_boarding_list');
    expect(config.navBoardingDetail).toBe('nav_boarding_detail');
  });

  it('exports vehicle detail field metadata', () => {
    expect(vehicleDetail.vehicleMake).toEqual({
      id: 'vehicleMake',
      name: 'make',
      label: 'Make',
      placeholder: 'Please enter the vehicle make',
      ariaLabel: 'Please enter the vehicle make',
    });
    expect(vehicleDetail.vehicleModel).toEqual({
      id: 'vehicleModel',
      name: 'model',
      label: 'Model',
      placeholder: 'Please enter the vehicle model',
      ariaLabel: 'Please enter the vehicle model',
    });
  });
});
