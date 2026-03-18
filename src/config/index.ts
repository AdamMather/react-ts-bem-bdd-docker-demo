const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3001'

const api = {
    contacts: '/api/contacts',
    contactNames: '/api/contact/names',
    contactAddress: '/api/contact/address',
    vehicles: '/api/vehicles',
    boardingOwners: '/api/boarding/owners',
    boardingSpecies: '/api/boarding/lookups/species',
    boardingBreeds: '/api/boarding/lookups/breeds',
    boardingVets: '/api/boarding/lookups/vets',
    boardingInsuranceProviders: '/api/boarding/lookups/insurance-providers'
};

const autocomplete = {
    vehicleMake: '/utils/vehiclemake',
    vehicleModel: '/utils/vehiclemodel'
}

const nav = {
    contactList: 'nav_contact_list',
    vehicleList: 'nav_vehicle_list',
    contacts: 'nav_contacts',
    address: 'nav_address',
    vehicles: 'nav_vehicles',
    boardingList: 'nav_boarding_list',
    boardingDetail: 'nav_boarding_detail'
}

const config = {
    apiContacts: apiBaseUrl + api.contacts,
    apiContactNames: apiBaseUrl + api.contactNames,
    apiAddress: apiBaseUrl + api.contactAddress,
    apiVehicles: apiBaseUrl + api.vehicles,
    apiBoardingOwners: apiBaseUrl + api.boardingOwners,
    apiBoardingSpecies: apiBaseUrl + api.boardingSpecies,
    apiBoardingBreeds: apiBaseUrl + api.boardingBreeds,
    apiBoardingVets: apiBaseUrl + api.boardingVets,
    apiBoardingInsuranceProviders: apiBaseUrl + api.boardingInsuranceProviders,
    //
    utilsVehicleMake: apiBaseUrl + autocomplete.vehicleMake,
    utilsVehicleModel: apiBaseUrl + autocomplete.vehicleModel,
    //
    navContactList: nav.contactList,
    navVehicleList: nav.vehicleList,
    navContacts: nav.contacts,
    navAddress: nav.address,
    navVehicles: nav.vehicles,
    navBoardingList: nav.boardingList,
    navBoardingDetail: nav.boardingDetail
}

export default config;

export const vehicleDetail = {
    vehicleMake: {
        id: 'vehicleMake',
        name: 'make',
        label: 'Make',
        placeholder: 'Please enter the vehicle make',
        ariaLabel: 'Please enter the vehicle make'
      },
      vehicleModel: {
        id: 'vehicleModel',
        name: 'model',
        label: 'Model',
        placeholder: 'Please enter the vehicle model',
        ariaLabel: 'Please enter the vehicle model'
      }
};
