import React, { useState } from 'react';
import ActionBar from '../../components/ActionBar/ActionBar';
import ListView from '../../components/ListView/ListView';
import ContactDetail from '../../components/ContactDetail/ContactDetail';
import AddressDetail from '../../components/AddressDetail/AddressDetail';
import VehicleDetail from '../../components/VehicleDetail/VehicleDetail';
import config from '../../config';
import useFetchRecord from '../../utils/data';
import { Contact, Address, Vehicle } from '../../types';
import mockApi from '../../services/mockApi';
import './Home.css';

const Home: React.FC = () => {
  // Destructure config properties
  const {
    apiContacts,
    apiAddress,
    apiVehicles,
    navContactList,
    navContacts,
    navAddress,
    navVehicles
  } = config;

  const { fetchRecord } = useFetchRecord();

  //
  const [view, setView] = useState(navContactList);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleAddContact = () => {
    setSelectedContact(null);
    setView(navContacts);
  };

  const handleAddAddress = (contactId = 0) => {
    setSelectedAddress({
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
    setView(navAddress);
  };

  const handleAddVehicle = (contactId = 0) => {
    setSelectedVehicle({
      id: 0,
      contact_id: contactId,
      make: '',
      model: '',
      registered: new Date(),
      purchased: new Date(),
    });
    setView(navVehicles);
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setView(navContacts);
  };

  const handleSelectContact = (id: number) => {
    setSelectedIds((prevSelected) =>
      prevSelected.includes(id) ? prevSelected.filter((contactId) => contactId !== id) : [...prevSelected, id]
    );
  };

  const handleDeleteContacts = async (_apiUrl?: string, ids: number[] = selectedIds) => {
    if (ids.length === 0) return;

    await mockApi.delete(apiContacts, {
      data: { ids },
    });
    setSelectedIds([]);
    fetchRecord(apiContacts);
  };

  const handleSaveContact = async (contact: Contact) => {
    try {
      if (contact.id) {
        console.log('contact update...');
        console.log(`path: ${apiContacts} id: ${contact.id}`);
        await mockApi.put(`${apiContacts}/${contact.id}`, contact);
        console.log('update successful!');
      } else {
        console.log('create contact...');
        await mockApi.post(apiContacts, contact);
        console.log('successfully created!');
      }
      // Refresh the list view
      console.log('record successfully saved!')
      setView(navContactList);
    } catch (error) {
      console.error('Error saving contact record:', error);
    }
  };

  const handleSelectedVehicle = (arrIds : number[]) => {
    setSelectedIds(arrIds);
    console.log(`Home - handle selected vehicles: ${selectedIds}`)
  }

  const handleSaveAddress = async (address: Address) => {
    try {
      if (address.id) {
        console.log('address update...');
        console.log(`path: ${apiAddress} id: ${address.id}`);
        await mockApi.put(`${apiAddress}/${address.id}`, address);
        console.log('update successful!');
      } else {
        console.log('create address...');
        await mockApi.post(apiAddress, address);
        console.log('successfully created!');
      }
      fetchRecord(apiAddress);
      // Refresh the list view
      console.log('record successfully saved!')
      setView(navAddress);
    } catch (error) {
      console.error('Error saving address record:', error);
    }
  };

  const handleSaveVehicle = async (vehicle: Vehicle) => {
    try {
      if (vehicle.id) {
        console.log('vehicle update...');
        console.log(`path: ${apiVehicles} id: ${vehicle.id}`);
        await mockApi.put(`${apiVehicles}/${vehicle.id}`, vehicle);
        console.log('update successful!');
      } else {
        console.log('create vehicle...');
        await mockApi.post(apiVehicles, vehicle);
        console.log('successfully created!');
      }
      fetchRecord(apiVehicles);
      // Refresh the list view
      console.log('record successfully saved!')
      setView(navContacts);
    } catch (error) {
      console.error('Error saving vehicle record:', error);
    }
  };

  console.log(`vehicle api: ${apiVehicles}/${selectedContact?.id}`)

  const handleDeleteAction = async (apiUrl: string, ids: number[] = selectedIds) => {
    console.log(`delete async action apiURL: ${apiUrl}`);
    console.log(`selected ids: ${ids}`);
    if (ids.length === 0) return;

    console.log(`selectedIds not empty array...`);

    try {
      await mockApi.delete(apiUrl, {
        data: { selectedIds: ids },
      });
      setSelectedIds([]);
      fetchRecord(apiUrl);
      console.log(`selectedIds deleted successfully...`);
    } catch (error) {
      console.error('Failed to delete items:', error);
    }
  };

  return (
    <div className="home" role="application" aria-label="Contact management application" data-testid="home-page">
      {view === navContactList && (
        <>
          <ActionBar
            onAdd={handleAddContact}
            onDelete={handleDeleteContacts}
            apiUrl={apiContacts}
            selectedIds={selectedIds}
            domain={'Contact'}
            isDeleteDisabled={selectedIds.length === 0}
            linkTo="/stock-control"
            linkLabel="Stock Control"
          />
          <ListView onSelected={handleSelectContact} onEdit={handleEditContact} fields={['first_name', 'last_name', 'email']} selectedIds={selectedIds} apiUrl={apiContacts}/>
        </>
      )}
      {view === navContacts && <ContactDetail onAddAddress={handleAddAddress} onAddVehicle={handleAddVehicle} onSaveContact={handleSaveContact} onSaveAddress={handleSaveAddress} onSaveVehicle={handleSaveVehicle} onDeleteAddress={handleDeleteAction} onDeleteVehicle={handleDeleteAction} selectedVehicles={handleSelectedVehicle} contact={selectedContact} />}
      {view === navAddress && <AddressDetail onSaveAddress={handleSaveAddress} address={selectedAddress} />}
      {view === navVehicles && <VehicleDetail onSaveVehicle={handleSaveVehicle} vehicle={selectedVehicle} />}
    </div>
  );
};

export default Home;
