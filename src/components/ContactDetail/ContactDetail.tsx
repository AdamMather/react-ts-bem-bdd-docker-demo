import React, { useEffect, useState } from 'react';
import config from '../../config';
import { Contact, Address, Vehicle } from '../../types';
import { toggleSelectedId } from '../../utils/ui';
import './ContactDetail.css';
import ListView from '../ListView/ListView';
import ActionBar from '../ActionBar/ActionBar';
import AddressDetail from '../AddressDetail/AddressDetail';
import VehicleDetail from '../VehicleDetail/VehicleDetail';

interface ContactDetailProps {
  onAddAddress: (contactId?: number) => void;
  onAddVehicle: (contactId?: number) => void;
  onSaveContact: (contact: Contact) => void;
  onSaveAddress: (address: Address) => void;
  onSaveVehicle: (vehicle: Vehicle) => void;
  onDeleteAddress: (api: string, selectedIds: number[]) => void;
  onDeleteVehicle: (api: string, selectedIds: number[]) => void;
  selectedVehicles: (selectedIds: number[]) => void;
  contact?: Contact | null;
}

const ContactDetail: React.FC<ContactDetailProps> = ({ onAddAddress, onAddVehicle, onSaveContact, onSaveAddress, onSaveVehicle, onDeleteAddress, onDeleteVehicle, selectedVehicles, contact }) => {

  const { apiAddress, apiVehicles, navContacts, navAddress, navVehicles } = config;
  const [view, setView] = useState(navContacts);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formContact, setFormContact] = useState<Contact>({
    id: 0,
    first_name: '',
    last_name: '',
    telephone: '',
    mobile: '',
    email: '',
    primary_contact: 'telephone',
  });

  const formAddress = 'Address';
  const formVehicle = 'Vehicle';

  useEffect(() => {
    if (contact) {
      setFormContact(contact);
    }
  }, [contact]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormContact({ ...formContact, [name]: value });
    setErrorMessage('');
    setSuccessMessage('');
  };

  const validateContact = (nextContact: Contact): string | null => {
    const isBlank = (value: string) => !value || value.trim() === '';
    const isDigits = (value: string) => /^\d+$/.test(value);
    const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const missingAll =
      isBlank(nextContact.first_name) &&
      isBlank(nextContact.last_name) &&
      isBlank(nextContact.telephone) &&
      isBlank(nextContact.mobile) &&
      isBlank(nextContact.email) &&
      isBlank(nextContact.primary_contact);

    if (missingAll) return 'All fields are required';
    if (isBlank(nextContact.first_name)) return 'Forename is required';
    if (isBlank(nextContact.last_name)) return 'Last Name is required';
    if (!isDigits(nextContact.telephone)) return 'Telephone must be a valid number';
    if (!isDigits(nextContact.mobile)) return 'Mobile must be a valid number';
    if (!isEmail(nextContact.email)) return 'Email must be valid';
    if (isBlank(nextContact.primary_contact)) return 'Primary Contact must be selected';

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationMessage = validateContact(formContact);
    if (validationMessage) {
      setErrorMessage(validationMessage);
      setSuccessMessage('');
      return;
    }

    await Promise.resolve(onSaveContact(formContact));
    setErrorMessage('');
    setSuccessMessage('Contact saved successfully');
  };

  const handleEditAddress = (address: Address) => {
    setSelectedAddress(address);
    setView(navAddress);
  };
  
  const handleEditVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setView(navVehicles);
  };

  const handleSelectAddress = (id: number) => {
    setSelectedIds((prevSelected) => toggleSelectedId(prevSelected, id));
  };

  const handleSelectVehicle = (id: number) => {
    setSelectedIds((prevSelected) => {
      const nextSelected = toggleSelectedId(prevSelected, id);
      selectedVehicles(nextSelected);
      return nextSelected;
    });
  };

  const handleAddAddress = () => {
    onAddAddress(formContact.id || 0);
  };

  const handleAddVehicle = () => {
    onAddVehicle(formContact.id || 0);
  };

  return (
    <div className="home" data-testid="contact-detail-container">
      {
        view === navContacts && (
          <div className="contact-form" role="main" aria-label="Contact details workspace" data-testid="contact-workspace">
            <section className="contact-form__section" aria-labelledby="contact-details-heading" data-testid="contact-details-section">
              <div className="contact-form__section-header">
                <h2 id="contact-details-heading" className="contact-form__heading">Contact Details</h2>
              </div>
              <form className="detail-form" onSubmit={handleSubmit} noValidate aria-describedby="contact-form-status" data-testid="contact-detail-form">
                <div className="contact-form__details">
                  <div className="detail-form__field contact-form__field">
                    <label htmlFor="firstName">Forename</label>
                    <input id="firstName" name="first_name" type="text" onChange={handleChange} value={formContact.first_name} data-testid="contact-first-name-input" aria-label="Forename" aria-invalid={errorMessage === 'Forename is required'} />
                  </div>
                  <div className="detail-form__field contact-form__field">
                    <label htmlFor="lastName">Last Name</label>
                    <input id="lastName" name="last_name" type="text" onChange={handleChange} value={formContact.last_name} data-testid="contact-last-name-input" aria-label="Last Name" aria-invalid={errorMessage === 'Last Name is required'} />
                  </div>
                  <div className="detail-form__field contact-form__field">
                    <label htmlFor="telephone">Telephone</label>
                    <input id="telephone" name="telephone" type="text" onChange={handleChange} value={formContact.telephone} data-testid="contact-telephone-input" aria-label="Telephone" aria-invalid={errorMessage === 'Telephone must be a valid number'} />
                  </div>
                  <div className="detail-form__field contact-form__field">
                    <label htmlFor="mobile">Mobile</label>
                    <input id="mobile" name="mobile" type="text" onChange={handleChange} value={formContact.mobile} data-testid="contact-mobile-input" aria-label="Mobile" aria-invalid={errorMessage === 'Mobile must be a valid number'} />
                  </div>
                  <div className="detail-form__field contact-form__field">
                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" onChange={handleChange} value={formContact.email} data-testid="contact-email-input" aria-label="Email" aria-invalid={errorMessage === 'Email must be valid'} />
                  </div>
                  <div className="detail-form__field contact-form__field">
                    <label htmlFor="primaryContact">Primary Contact</label>
                    <select id="primaryContact" name="primary_contact" onChange={handleChange} value={formContact.primary_contact} data-testid="contact-primary-contact-select" aria-label="Primary Contact" aria-invalid={errorMessage === 'Primary Contact must be selected'}>
                      <option value="" label="Select primary contact" />
                      <option value="telephone" label="Telephone" />
                      <option value="mobile" label="Mobile" />
                      <option value="email" label="Email" />
                    </select>
                  </div>
                </div>
                <button type="submit" className="contact-form__button contact-form__button--primary" data-testid="contact-save-button" aria-label="Save contact">
                  Save
                </button>
                <div id="contact-form-status" aria-live="polite" data-testid="contact-form-status">
                  {errorMessage ? <p className="error-message" role="alert" data-testid="contact-error-message">{errorMessage}</p> : null}
                  {successMessage ? <p className="success-message" data-testid="contact-success-message">{successMessage}</p> : null}
                </div>
              </form>
            </section>

            <section className="contact-form__section" aria-labelledby="address-details-heading" data-testid="address-details-section">
              <div className="contact-form__section-header">
                <h2 id="address-details-heading" className="contact-form__heading">{formAddress} Details</h2>
              </div>
              <ActionBar onAdd={handleAddAddress} onDelete={onDeleteAddress} apiUrl={apiAddress} selectedIds={selectedIds} domain={formAddress} isDeleteDisabled={selectedIds.length === 0} />
              <ListView onSelected={handleSelectAddress} onEdit={handleEditAddress} fields={['addressLine1', 'addressLine2', 'postcode']} selectedIds={selectedIds} apiUrl={`${apiAddress}/${formContact.id}`} />
            </section>

            <section className="contact-form__section" aria-labelledby="vehicle-details-heading" data-testid="vehicle-details-section">
              <div className="contact-form__section-header">
                <h2 id="vehicle-details-heading" className="contact-form__heading">{formVehicle} Details</h2>
              </div>
              <ActionBar onAdd={handleAddVehicle} onDelete={onDeleteVehicle} apiUrl={apiVehicles} selectedIds={selectedIds} domain={formVehicle} isDeleteDisabled={selectedIds.length === 0} />
              <ListView onSelected={handleSelectVehicle} onEdit={handleEditVehicle} fields={['make', 'model', 'registered']} selectedIds={selectedIds} apiUrl={`${apiVehicles}/${formContact.id}`} />
            </section>
          </div>
        )
      }
      { view === navAddress && <AddressDetail onSaveAddress={onSaveAddress} address={selectedAddress} /> }
      { view === navVehicles && <VehicleDetail onSaveVehicle={onSaveVehicle} vehicle={selectedVehicle} /> }
    </div>
  )
};

export default ContactDetail;
