import React, { FC } from 'react';
import LabelledInput from '../molecules/LabelledInput';
import styles from './styles/AutoCompleteTextbox.module.css';
import useFetchRecord from '../../utils/data';

interface AutoCompleteTextboxProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  placeholder?: string;
  ariaLabel: string;
  apiUrl: string;
}

const AutoCompleteTextbox: FC<AutoCompleteTextboxProps> = ({ id, name, label, value, onChange, placeholder = '', ariaLabel, apiUrl }) => {
  const { suggestions, setSuggestions, fetchSuggestions } = useFetchRecord();
  const hasSuggestions = suggestions.length > 0;
  const datalistId = `${id}-datalist`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const inputValue = e.target.value;
    onChange(e);

    if (inputValue.length > 0) {
      fetchSuggestions(apiUrl, inputValue);
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div className={`${styles['autocomplete-textbox']} ${hasSuggestions ? styles['autocomplete-textbox--open'] : ''}`.trim()}>
      <div className={styles['autocomplete-textbox__control']}>
        <LabelledInput
          id={id}
          name={name}
          label={label}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          ariaLabel={ariaLabel}
          list={datalistId}
          containerClassName={styles['autocomplete-textbox__field']}
          inputClassName={styles['autocomplete-textbox__input']}
          autoComplete="off"
        />
        <span className={styles['autocomplete-textbox__icon']} aria-hidden="true" />
      </div>
      {hasSuggestions ? (
        <datalist id={datalistId} data-testid={`${name}-suggestions`}>
          {suggestions.map((suggestion) => (
            <option key={`${name}-${suggestion}`} value={suggestion} />
          ))}
        </datalist>
      ) : null}
    </div>
  );
};

export default AutoCompleteTextbox;
