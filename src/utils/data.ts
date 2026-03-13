import { useState } from 'react';
import { Contact, ContactNames } from '../types';
import apiClient from '../services/apiClient';

const useFetchRecord = () => {
  //
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactNames, setContactNames] = useState<ContactNames[]>([]);
  //
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const fetchRecord = async (api: string) => {
    try {
      const response = await apiClient.get(api);
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const getContactNames = async (api: string) => {
    try {
      const response = await apiClient.get(api);
      setContactNames(response.data);
    } catch (error) {
      console.error('Error fetching contact names:', error);
    }
  };

  const fetchSuggestions = async (api: string, query: string) => {
    try {
        const response = await apiClient.get(api, {
            params: { query: query }
        });
        setSuggestions(response.data.suggestions.map((item: { name: string }) => item.name));
    } catch (error) {
        console.error('Error fetching suggestions:', error);
    }
};

  return { contacts, contactNames, suggestions, setSuggestions, fetchRecord, getContactNames, fetchSuggestions };
};

export default useFetchRecord;
