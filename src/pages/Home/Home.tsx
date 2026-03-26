import React, { useState } from 'react';
import ActionBar from '../../components/ActionBar/ActionBar';
import ListView from '../../components/ListView/ListView';
import ContactDetail from '../../components/ContactDetail/ContactDetail';
import AddressDetail from '../../components/AddressDetail/AddressDetail';
import VehicleDetail from '../../components/VehicleDetail/VehicleDetail';
import config from '../../config';
import useFetchRecord from '../../utils/data';
import { Contact, Address, Vehicle } from '../../types';
import { deleteEntityRecords, saveEntityRecord } from '../../utils/recordActions';
import { createEmptyAddress, createEmptyVehicle } from '../../utils/recordTransforms';
import { toggleSelectedId, useTimedBanner } from '../../utils/ui';
import './Home.css';

const Home: React.FC = () => {
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
  const [view, setView] = useState(navContactList);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { bannerMessage, showBanner } = useTimedBanner();

  const handleAddContact = () => {
    setSelectedContact(null);
    setView(navContacts);
  };

  const handleAddAddress = (contactId = 0) => {
    setSelectedAddress(createEmptyAddress(contactId));
    setView(navAddress);
  };

  const handleAddVehicle = (contactId = 0) => {
    setSelectedVehicle(createEmptyVehicle(contactId));
    setView(navVehicles);
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setView(navContacts);
  };

  const handleSelectContact = (id: number) => {
    setSelectedIds((prevSelected) => toggleSelectedId(prevSelected, id));
  };

  const handleDeleteContacts = (_apiUrl?: string, ids: number[] = selectedIds) => {
    void deleteEntityRecords({
      apiUrl: apiContacts,
      ids,
      onDeleted: () => setSelectedIds([]),
      refresh: (apiUrl) => {
        void fetchRecord(apiUrl);
      },
      errorMessage: 'Failed to delete contacts:',
    });
  };

  const handleSaveContact = (contact: Contact) => {
    void saveEntityRecord({
      apiUrl: apiContacts,
      record: contact,
      entityLabel: 'Contact',
      onSaved: () => setView(navContactList),
      showBanner,
      errorMessage: 'Error saving contact record:',
    });
  };

  const handleSelectedVehicle = (arrIds : number[]) => {
    setSelectedIds(arrIds);
  };

  const handleSaveAddress = (address: Address) => {
    void saveEntityRecord({
      apiUrl: apiAddress,
      record: address,
      entityLabel: 'Address',
      onSaved: () => setView(navContactList),
      refresh: (apiUrl) => {
        void fetchRecord(apiUrl);
      },
      showBanner,
      errorMessage: 'Error saving address record:',
    });
  };

  const handleSaveVehicle = (vehicle: Vehicle) => {
    void saveEntityRecord({
      apiUrl: apiVehicles,
      record: vehicle,
      entityLabel: 'Vehicle',
      onSaved: () => setView(navContactList),
      refresh: (apiUrl) => {
        void fetchRecord(apiUrl);
      },
      showBanner,
      errorMessage: 'Error saving vehicle record:',
    });
  };

  const handleDeleteAction = (apiUrl: string, ids: number[] = selectedIds) => {
    void deleteEntityRecords({
      apiUrl,
      ids,
      payloadKey: 'selectedIds',
      onDeleted: () => setSelectedIds([]),
      refresh: (nextUrl) => {
        void fetchRecord(nextUrl);
      },
      errorMessage: 'Failed to delete items:',
    });
  };

  return (
    <div className="home" role="application" aria-label="Contact management application" data-testid="home-page">
      {bannerMessage ? (
        <output className="home__banner" aria-live="polite" aria-atomic="true" data-testid="save-banner">
          {bannerMessage}
        </output>
      ) : null}
      {view === navContactList && (
        <>
          <ActionBar onAdd={handleAddContact} onDelete={handleDeleteContacts} apiUrl={apiContacts} selectedIds={selectedIds} domain={'Contact'} isDeleteDisabled={selectedIds.length === 0} />
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
