import React from 'react';
import AutoCompleteTextbox from './AutoCompleteTextbox';

interface FilterTextboxProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  ariaLabel: string;
  apiUrl?: string;
}

const FilterTextbox: React.FC<FilterTextboxProps> = (props) => {
  return <AutoCompleteTextbox {...props} />;
};

export default FilterTextbox;
