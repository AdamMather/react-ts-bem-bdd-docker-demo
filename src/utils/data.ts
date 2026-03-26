import { useState } from 'react';
import { Contact, ContactNames } from '../types';
import apiClient from '../services/apiClient';

type SuggestionResponse = {
  suggestions: Array<{ name: string }>;
};

const useFetchRecord = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactNames, setContactNames] = useState<ContactNames[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const loadIntoState = async <T>(api: string, onSuccess: (data: T) => void, errorLabel: string) => {
    try {
      const response = await apiClient.get(api);
      onSuccess(response.data);
    } catch (error) {
      console.error(errorLabel, error);
    }
  };

  const fetchRecord = async (api: string) => {
    await loadIntoState<Contact[]>(api, setContacts, 'Error fetching records:');
  };

  const getContactNames = async (api: string) => {
    await loadIntoState<ContactNames[]>(api, setContactNames, 'Error fetching contact names:');
  };

  const fetchSuggestions = async (api: string, query: string) => {
    try {
      const response = await apiClient.get(api, {
        params: { query },
      });
      setSuggestions((response.data as SuggestionResponse).suggestions.map((item) => item.name));
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  return { contacts, contactNames, suggestions, setSuggestions, fetchRecord, getContactNames, fetchSuggestions };
};

export default useFetchRecord;
