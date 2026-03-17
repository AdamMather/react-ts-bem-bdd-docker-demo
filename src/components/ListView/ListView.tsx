// src/components/ListView/ListView.tsx
import React, { useState, useEffect } from 'react';
import { Contact, Vehicle } from '../../types';
import apiClient from '../../services/apiClient';
import ListViewSearch from '../organisms/ListViewSearch';
import './ListView.css';

interface ListViewProps {
  onSelected: (id: number) => void;
  onEdit: (record: Contact | Vehicle) => void;
  fields: string[];
  selectedIds: number[];
  apiUrl: string;
}

const ListView: React.FC<ListViewProps> = ({ onSelected, onEdit, fields, selectedIds, apiUrl }) => {
  const [attributes, setAttributes] = useState<string[]>();
  const [list, setList] = useState<Contact[] | Vehicle[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchList(apiUrl);
  }, [apiUrl, selectedIds]); // Empty dependency array to run effect only once on component mount

  // Fetch list from server when component mounts
  const fetchList = async (api: string) => {
    console.log(`api: ${api}`);
    try {
      const response = await apiClient.get(api);
      const data = response.data;
      if (data.length > 0) {
        setAttributes(Object.keys(data[0]));
      }
      setList(data);
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

    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }

    if (value == null) {
      return '';
    }

    return String(value);
  };

  return (
    <div className="list-view" role="region" aria-label="Searchable list" data-testid="list-view">
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
    return (
      <tr key={record.id} data-testid={`list-row-${record.id}`}>
        <td className="list-view__select-col">
          <input
            type="checkbox"
            checked={selectedIds.includes(record.id)}
            onChange={() => onSelected(record.id)}
            aria-label={`Select ${record[fields[1]]} ${record[fields[2]]}`}
            data-testid={`select-row-${record.id}`}
          />
        </td>
        <td>{renderCellValue(record[fields[0]])}</td>
        <td>{renderCellValue(record[fields[1]])}</td>
        <td>{renderCellValue(record[fields[2]])}</td>
        <td className="list-view__actions-col">
          <button
            className="list-view__link-button"
            onClick={() => onEdit(record)}
            aria-label={`Edit record ${record.id}`}
            data-testid={`edit-row-${record.id}`}
          >
            Edit
          </button>
        </td>
      </tr>
    );
  })}
</tbody>
      </table>
    </div>
  );
};

export default ListView;
