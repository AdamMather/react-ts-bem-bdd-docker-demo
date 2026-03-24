import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ActionBar from './ActionBar';

describe('ActionBar', () => {
  it('renders add and delete actions for the requested domain', () => {
    render(
      <ActionBar
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        apiUrl="/api/contacts"
        selectedIds={[1, 2]}
        domain="Contact"
        isDeleteDisabled={false}
      />
    );

    expect(screen.getByTestId('contact-action-bar')).toHaveAttribute('aria-label', 'Contact actions');
    expect(screen.getByTestId('add-contact-button')).toHaveTextContent('Add New Contact');
    expect(screen.getByTestId('delete-contact-button')).not.toBeDisabled();
  });

  it('invokes the add and delete handlers with the selected ids', () => {
    const onAdd = vi.fn();
    const onDelete = vi.fn();

    render(
      <ActionBar
        onAdd={onAdd}
        onDelete={onDelete}
        apiUrl="/api/contacts"
        selectedIds={[4, 5]}
        domain="Contact"
        isDeleteDisabled={false}
      />
    );

    fireEvent.click(screen.getByTestId('add-contact-button'));
    fireEvent.click(screen.getByTestId('delete-contact-button'));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith('/api/contacts', [4, 5]);
  });

  it('disables delete when requested', () => {
    render(
      <ActionBar
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        apiUrl="/api/contacts"
        selectedIds={[]}
        domain="Contact"
        isDeleteDisabled
      />
    );

    expect(screen.getByTestId('delete-contact-button')).toBeDisabled();
  });
});
