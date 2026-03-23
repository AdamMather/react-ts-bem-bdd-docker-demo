import React, { useEffect, useState} from 'react';
import { Address } from '../../types';
import config from '../../config';
import useFetchRecord from '../../utils/data';
import useDateFormatter from '../../utils/date';
import { createEmptyAddress, normalizeAddress, updateFormValue } from '../../utils/recordTransforms';
import './AddressDetail.css';

interface AddressDetailProps {
  onSaveAddress: (address: Address) => void;
  address?: Address | null;
}

const AddressDetail: React.FC<AddressDetailProps> = ({ onSaveAddress, address }) => {
  const { apiContactNames } = config;
  const {  contactNames, getContactNames } = useFetchRecord();
  const { formatDate } = useDateFormatter();

  const [formAddress, setFormAddress] = useState<Address>(createEmptyAddress());

  useEffect(() => {
    // call api to populate contact names vdetail
    getContactNames(apiContactNames);
    // if record exists, populate form variable state
   if (address) {
      setFormAddress(normalizeAddress(address));
    }
  }, [apiContactNames, address]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormAddress((current) => updateFormValue(current, e));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`formAddress: ${JSON.stringify(formAddress)}`);
    onSaveAddress(formAddress);
  };

  return (
    <form className="detail-form" onSubmit={handleSubmit} aria-label="Address detail form" data-testid="address-detail-form">
      <div className="detail-form__field">
        <label htmlFor="addressContact">Address Contact</label>
        <select id="addressContact" name="contact_id" onChange={handleChange} value={formAddress.contact_id} aria-label="Address Contact" data-testid="address-contact-select">
        <option value="" label="Select Driver" />
        {contactNames.map(contactName => (
          <option key={contactName.id} value={contactName.id}>
            {contactName.contact}
          </option>
        ))}
      </select>
      </div>
      <div className="detail-form__field">
        <label htmlFor="addressLine1">Address Line 1</label>
        <input id="addressLine1" name="addressLine1" type="text" onChange={handleChange} value={formAddress.addressLine1} aria-label="Address Line 1" data-testid="address-line1-input" />
      </div>
      <div className="detail-form__field">
        <label htmlFor="addressLine2">Address Line 2</label>
        <input id="addressLine2" name="addressLine2" type="text" onChange={handleChange} value={formAddress.addressLine2} aria-label="Address Line 2" data-testid="address-line2-input" />
      </div>
      <div className="detail-form__field">
        <label htmlFor="addressLine3">Address Line 3</label>
        <input id="addressLine3" name="addressLine3" type="text" onChange={handleChange} value={formAddress.addressLine3} aria-label="Address Line 3" data-testid="address-line3-input" />
      </div>
      <div className="detail-form__field">
        <label htmlFor="addressLine4">Address Line 4</label>
        <input id="addressLine4" name="addressLine4" type="text" onChange={handleChange} value={formAddress.addressLine4} aria-label="Address Line 4" data-testid="address-line4-input" />
      </div>
      <div className="detail-form__field">
        <label htmlFor="postcode">Post Code</label>
        <input id="postcode" name="postcode" type="text" onChange={handleChange} value={formAddress.postcode} aria-label="Post Code" data-testid="address-postcode-input" />
      </div>
      <div className="detail-form__field">
        <label htmlFor="movedIn">Moved in</label>
        <input id="movedIn" name="occupyStart" type="date" onChange={handleChange} value={formatDate(formAddress.occupyStart)} aria-label="Moved in date" data-testid="address-moved-in-input" />
      </div>
      <div className="detail-form__field">
        <label htmlFor="movedOut">Moved Out</label>
        <input id="movedOut" name="occupyEnd" type="date" onChange={handleChange} value={formatDate(formAddress.occupyEnd)} aria-label="Moved out date" data-testid="address-moved-out-input" />
      </div>
      <button type="submit" aria-label="Save address" data-testid="address-save-button">Save</button>
    </form>
  );
};

export default AddressDetail;
