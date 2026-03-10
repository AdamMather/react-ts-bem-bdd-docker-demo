import React from 'react';
import styles from './styles/Label.module.css';

interface LabelProps {
  htmlFor: string;
  text: string;
}

const Label: React.FC<LabelProps> = ({ htmlFor, text }) => {
  return (
    <label htmlFor={htmlFor} className={styles.label}>
      {text}
    </label>
  );
};

export default Label;
