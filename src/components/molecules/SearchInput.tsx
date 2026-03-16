import React from 'react';
import Input from '../atoms/Input';

interface SearchInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  testId?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  id,
  name,
  value,
  onChange,
  placeholder = 'Search...',
  ariaLabel = 'Search',
  className,
  testId,
}) => {
  return (
    <Input
      id={id}
      name={name}
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      ariaLabel={ariaLabel}
      className={className}
      testId={testId}
    />
  );
};

export default SearchInput;
