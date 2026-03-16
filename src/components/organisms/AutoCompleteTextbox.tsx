import React, { useEffect, useState, ChangeEvent, FC, MouseEvent } from 'react';
import LabelledInput from '../molecules/LabelledInput';
import styles from './styles/AutoCompleteTextbox.module.css';
import useFetchRecord from '../../utils/data';

interface AutoCompleteTextboxProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  ariaLabel: string;
  apiUrl?: string;
}

const AutoCompleteTextbox: FC<AutoCompleteTextboxProps> = ({ id, name, label, value, onChange, placeholder = '', ariaLabel, apiUrl }) => {
  const [record, setRecord] = useState(value);
  const { suggestions, setSuggestions, fetchSuggestions } = useFetchRecord();
  const isOpen = suggestions.length > 0;
  const listboxId = `${id}-listbox`;


  useEffect(() => {
    setRecord(value);
  }, [value]);
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(e);

    if (inputValue.length > 0 && apiUrl) {
      fetchSuggestions(apiUrl, inputValue);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (e: MouseEvent<HTMLLIElement>) => {

    const mockEvent = {
      target: {
        name: name,
        value: e.currentTarget.innerText
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>
    
    onChange(mockEvent);
    setSuggestions([]);
  };

  return (
    <div className={`${styles['autocomplete-textbox']} ${isOpen ? styles['autocomplete-textbox--open'] : ''}`.trim()}>
      <div className={styles['autocomplete-textbox__control']}>
        <LabelledInput
          id={id}
          name={name}
          label={label}
          type="text"
          value={record}
          onChange={handleChange}
          placeholder={placeholder}
          ariaLabel={ariaLabel}
          containerClassName={styles['autocomplete-textbox__field']}
          inputClassName={styles['autocomplete-textbox__input']}
          inputRole="combobox"
          ariaExpanded={isOpen}
          ariaControls={listboxId}
          ariaHaspopup="listbox"
          autoComplete="off"
        />
        <span className={styles['autocomplete-textbox__icon']} aria-hidden="true" />
      </div>
      {isOpen && (
        <ul
          id={listboxId}
          className={styles['autocomplete-textbox__listbox']}
          role="listbox"
          aria-label={`${label} suggestions`}
          data-testid={`${name}-suggestions`}
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className={styles['autocomplete-textbox__option']}
              onClick={handleSuggestionClick}
              role="option"
              aria-label={`${label} suggestion ${suggestion}`}
              data-testid={`${name}-suggestion-${index}`}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutoCompleteTextbox;
