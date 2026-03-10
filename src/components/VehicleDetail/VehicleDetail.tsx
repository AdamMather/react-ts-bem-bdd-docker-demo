import React, { useEffect, useState } from 'react';
import { Vehicle } from '../../types';
import config, { vehicleDetail } from '../../config';
import useFetchRecord from '../../utils/data';
import useDateFormatter from '../../utils/date';
import './VehicleDetail.css';
import AutoCompleteTextbox from '../organisms/AutoCompleteTextbox';

interface VehicleDetailProps {
  onSaveVehicle: (vehicle: Vehicle) => void;
  vehicle?: Vehicle | null;
}

const VehicleDetail: React.FC<VehicleDetailProps> = ({ onSaveVehicle, vehicle }) => {
  const { apiContactNames, utilsVehicleMake, utilsVehicleModel } = config;

  const { contactNames, getContactNames } = useFetchRecord();
  const { formatDate } = useDateFormatter();

  const [formVehicle, setFormVehicle] = useState<Vehicle>({
    id: 0,
    contact_id: 0,
    make: '',
    model: '',
    registered: new Date(),
    purchased: new Date()
  });

  const normalizeVehicle = (raw: Vehicle | null | undefined): Vehicle => {
    const source = (raw || {}) as Record<string, unknown>;

    return {
      id: Number(source.id || 0),
      contact_id: Number(source.contact_id || 0),
      make: String(source.make || ''),
      model: String(source.model || ''),
      registered: source.registered ? new Date(String(source.registered)) : new Date(),
      purchased: source.purchased ? new Date(String(source.purchased)) : new Date(),
    };
  };

  const vehicleMake = vehicleDetail.vehicleMake;
  const vehicleModel = vehicleDetail.vehicleModel;

  useEffect(() => {
    // call api to populate contact names vdetail
    getContactNames(apiContactNames);
    // if record exists, populate form variable state
    if (vehicle) {
      setFormVehicle(normalizeVehicle(vehicle));
    }
  }, [apiContactNames, vehicle]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormVehicle({ ...formVehicle, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`formVehicle: ${JSON.stringify(formVehicle)}`);
    onSaveVehicle(formVehicle);
  };

  return (
    <form className="detail-form" onSubmit={handleSubmit} autoComplete="off" aria-label="Vehicle detail form" data-testid="vehicle-detail-form">
      <input autoComplete="false" name="hidden" type="text" className={"detail-form__invisible"} aria-hidden="true" tabIndex={-1} />
      <div className="detail-form__field">
        <label htmlFor="vehicleContact">Vehicle Contact</label>
        <select id="vehicleContact" name="contact_id" onChange={handleChange} value={formVehicle.contact_id} aria-label="Vehicle Contact" data-testid="vehicle-contact-select">
          <option value="" label="Select Driver" />
          {contactNames.map(contactName => (
            <option key={contactName.id} value={contactName.id}>
              {contactName.contact}
            </option>
          ))}
        </select>
      </div>
      <AutoCompleteTextbox id={vehicleMake.id} name={vehicleMake.name} onChange={handleChange} label={vehicleMake.label} value={formVehicle.make} placeholder={vehicleMake.placeholder} ariaLabel={vehicleMake.ariaLabel} apiUrl={utilsVehicleMake} />
      <AutoCompleteTextbox id={vehicleModel.id} name={vehicleModel.name} onChange={handleChange} label={vehicleModel.label} value={formVehicle.model} placeholder={vehicleModel.placeholder} ariaLabel={vehicleModel.ariaLabel} apiUrl={utilsVehicleModel} />
      {/* <div className="detail-form__field">
        <label htmlFor="make">Make</label>
        <input id="make" name="make" type="text" onChange={handleChange} value={formVehicle.make} />
      </div>
      <div className="detail-form__field">
        <label htmlFor="model">Model</label>
        <input id="model" name="model" type="text" onChange={handleChange} value={formVehicle.model} />
      </div> */}
      <div className="detail-form__field">
        <label htmlFor="registered">Registered</label>
        <input id="registered" name="registered" type="date" onChange={handleChange} value={formatDate(formVehicle.registered)} aria-label="Registered date" data-testid="vehicle-registered-input" />
      </div>
      <div className="detail-form__field">
        <label htmlFor="purchased">Purchased</label>
        <input id="purchased" name="purchased" type="date" onChange={handleChange} value={formatDate(formVehicle.purchased)} aria-label="Purchased date" data-testid="vehicle-purchased-input" />
      </div>
      <button type="submit" aria-label="Save vehicle" data-testid="vehicle-save-button">Save</button>
    </form>
  );
};

export default VehicleDetail;
