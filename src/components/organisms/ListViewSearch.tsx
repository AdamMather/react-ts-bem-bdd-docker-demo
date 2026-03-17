import React from 'react';

interface ListViewSearchProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  ariaLabel?: string;
  testId?: string;
  className?: string;
}

const ListViewSearch: React.FC<ListViewSearchProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  ariaLabel = 'Search list',
  testId = 'list-view-search',
  className = 'list-view__search',
}) => {
  return (
    <input
      type="text"
      className={className}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      aria-label={ariaLabel}
      data-testid={testId}
    />
  );
};

export default ListViewSearch;
