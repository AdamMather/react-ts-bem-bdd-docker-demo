import React from 'react';
import { Link } from 'react-router-dom';
import './ActionBar.css';

interface ActionBarProps {
  onDelete: (apiUrl: string, selectedIds: number[]) => void;
  onAdd: () => void;
  apiUrl?: string;
  selectedIds: number[];
  domain: string;
  isDeleteDisabled: boolean;
  linkTo?: string;
  linkLabel?: string;
}

const ActionBar: React.FC<ActionBarProps> = ({
  onAdd,
  onDelete,
  apiUrl,
  selectedIds,
  domain,
  isDeleteDisabled,
  linkTo,
  linkLabel
}) => {
 
 
  console.log(`selectedIds: ${selectedIds}`);

  return (
    <div className="action-bar" role="toolbar" aria-label={`${domain} actions`} data-testid={`${domain.toLowerCase()}-action-bar`}>
      {linkTo && linkLabel ? (
        <Link className="action-bar__link" to={linkTo} aria-label={linkLabel}>
          {linkLabel}
        </Link>
      ) : null}
      <button
        className="action-bar__button"
        onClick={onAdd}
        aria-label={`Add new ${domain}`}
        data-testid={`add-${domain.toLowerCase()}-button`}
      >
        Add New {domain}
      </button>
      <button
        className="action-bar__button"
        onClick={() => { onDelete(apiUrl, selectedIds) } }
        disabled={isDeleteDisabled}
        aria-label={`Delete selected ${domain} records`}
        data-testid={`delete-${domain.toLowerCase()}-button`}
      >
        Delete
      </button>
    </div>
  );
} 

export default ActionBar;
