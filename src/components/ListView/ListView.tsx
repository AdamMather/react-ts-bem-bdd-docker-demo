// src/components/ListView/ListView.tsx
import React, { useState, useEffect } from 'react';
import { BoardingOwnerRecord, Contact, Vehicle } from '../../types';
import apiClient from '../../services/apiClient';
import ListViewSearch from '../organisms/ListViewSearch';
import './ListView.css';

interface ListViewProps {
  onSelected: (id: number) => void;
  onEdit: (record: Contact | Vehicle | BoardingOwnerRecord | Record<string, unknown>) => void;
  fields: string[];
  selectedIds: number[];
  apiUrl: string;
}

const parseRecordId = (record: unknown): number | null => {
  if (!record || typeof record !== 'object') {
    return null;
  }

  const rawId = (record as { id?: unknown }).id;
  if (typeof rawId === 'number' && Number.isFinite(rawId)) {
    return rawId;
  }

  if (typeof rawId === 'string' && rawId.trim()) {
    const asNumber = Number(rawId);
    return Number.isFinite(asNumber) ? asNumber : null;
  }

  return null;
};

const ListView: React.FC<ListViewProps> = ({ onSelected, onEdit, fields, selectedIds, apiUrl }) => {
  const [list, setList] = useState<Array<Contact | Vehicle | BoardingOwnerRecord | Record<string, unknown>>>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchList(apiUrl);
  }, [apiUrl, selectedIds]);

  // Fetch list from server when component mounts
  const fetchList = async (api: string) => {
    try {
      const response = await apiClient.get(api);
      setList(response.data);
    } catch (error) {
      console.error('Error fetching list:', error);
      setList([]);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const filteredList = list.filter(item => {
    // Create an array of values for the specified attributes
    const attributeValues = fields.map(attr => item[attr]).filter(value => typeof value === 'string');

    // Join the values into a single string
    const concatenatedString = attributeValues.join(' ').toLowerCase();

    // Check if the search string is present in the concatenated string
    return concatenatedString.includes(search.toLowerCase());
  });

  const renderCellValue = (value: unknown): string => {
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? '' : value.toISOString().slice(0, 10);
    }

    if (Array.isArray(value)) {
      return value.join(', ');
    }

    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }

    if (value == null) {
      return '';
    }

    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }

    try {
      return JSON.stringify(value);
    } catch {
      return '';
    }
  };

  return (
    <section className="list-view" aria-label="Searchable list" data-testid="list-view">
      <ListViewSearch value={search} onChange={handleSearchChange} />
      <table className="list-view__table" aria-label="Results table" data-testid="list-view-table">
        <thead>
          <tr>
            <th className="list-view__select-col">
              <input type="checkbox" disabled aria-label="Select all records" data-testid="select-all-disabled" />
            </th>
            {fields.map((item) => (
              <th key={item}>{item}</th>
            ))}
            <th className="list-view__actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
  {filteredList.map((record) => {
    const id = parseRecordId(record);
    if (id == null) {
      return null;
    }

    const rowLabel = fields
      .map((field) => record[field])
      .filter((value) => typeof value === 'string' || typeof value === 'number')
      .slice(0, 2)
      .join(' ')
      .trim() || `record ${id}`;

    return (
      <tr key={id} data-testid={`list-row-${id}`}>
        <td className="list-view__select-col">
          <input
            type="checkbox"
            checked={selectedIds.includes(id)}
            onChange={() => onSelected(id)}
            aria-label={`Select ${rowLabel}`}
            data-testid={`select-row-${id}`}
          />
        </td>
        {fields.map((field) => (
          <td key={field}>{renderCellValue(record[field])}</td>
        ))}
        <td className="list-view__actions-col">
          <button
            className="list-view__link-button"
            onClick={() => onEdit(record)}
            aria-label={`Edit record ${id}`}
            data-testid={`edit-row-${id}`}
          >
            Edit
          </button>
        </td>
      </tr>
    );
  })}
</tbody>
      </table>
    </section>
  );
};

export default ListView;
