import React, { ChangeEvent } from 'react';
import Input from '../atoms/Input';
import Label from '../atoms/Label';
import styles from './styles/LabelledInput.module.css';

interface LabelledInputProps {
  id: string;
  name: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  list?: string;
  ariaLabel?: string;
  containerClassName?: string;
  inputClassName?: string;
  inputRole?: string;
  ariaExpanded?: boolean;
  ariaControls?: string;
  ariaHaspopup?: string;
  autoComplete?: string;
}

const LabelledInput: React.FC<LabelledInputProps> = ({
  id,
  name,
  label,
  type,
  value,
  onChange,
  placeholder,
  list,
  ariaLabel,
  containerClassName,
  inputClassName,
  inputRole,
  ariaExpanded,
  ariaControls,
  ariaHaspopup,
  autoComplete,
}) => {
  return (
    <div className={`${styles.labelledInput} ${containerClassName ?? ''}`.trim()}>
      <Label htmlFor={id} text={label} />
      <Input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        list={list}
        ariaLabel={ariaLabel}
        className={inputClassName}
        role={inputRole}
        ariaExpanded={ariaExpanded}
        ariaControls={ariaControls}
        ariaHaspopup={ariaHaspopup}
        autoComplete={autoComplete}
      />
    </div>
  );
};

export default LabelledInput;
