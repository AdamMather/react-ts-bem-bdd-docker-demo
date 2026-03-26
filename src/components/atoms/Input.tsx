import { ChangeEvent, FC } from 'react';
import styles from './styles/Input.module.css';

interface InputProps {
  id: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  list?: string;
  ariaLabel?: string;
  className?: string;
  role?: string;
  ariaExpanded?: boolean;
  ariaControls?: string;
  ariaHaspopup?: string;
  autoComplete?: string;
}

const Input: FC<InputProps> = ({
  id,
  name,
  type,
  value,
  onChange,
  placeholder,
  list,
  ariaLabel,
  className,
  role,
  ariaExpanded,
  ariaControls,
  ariaHaspopup,
  autoComplete,
}) => {
  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      className={`${styles.input} ${className ?? ''}`.trim()}
      placeholder={placeholder}
      list={list}
      aria-label={ariaLabel}
      role={role}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-haspopup={ariaHaspopup}
      autoComplete={autoComplete}
    />
  );
};

export default Input;
