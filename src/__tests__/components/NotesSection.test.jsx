import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import NotesSection from '../../components/NotesSection';

// Mock i18nManager
const { mockT } = vi.hoisted(() => {
  const translations = {
    en: {
      'sections.notes': 'Notes',
    },
  };

  return {
    mockT: vi.fn((key) => translations.en[key] || key),
  };
});

vi.mock('../../managers/i18nManager', () => ({
  i18nManager: {
    t: mockT,
  },
}));

describe('Notes Section', () => {
  let user;
  const defaultProps = {
    notes: '',
    onNotesChange: vi.fn(),
    initialExpanded: true,
    onExpandedChange: vi.fn(),
  };

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  describe('Notes are editable', () => {
    it('should apply handwritten font class to field', () => {
      render(<NotesSection {...defaultProps} />);

      const textarea = document.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveClass('notes-handwritten');
    });

    it('should display notes field', () => {
      render(<NotesSection {...defaultProps} />);

      const textarea = document.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveValue('');
    });

    it('should allow editing', () => {
      render(<NotesSection {...defaultProps} />);

      const textarea = document.querySelector('textarea');
      fireEvent.change(textarea, {
        target: { value: 'This is a note about the adventure' },
      });

      expect(defaultProps.onNotesChange).toHaveBeenCalledWith(
        'This is a note about the adventure'
      );
    });

    it('should display existing notes', () => {
      const notesValue =
        'Remember to buy potions\nCheck the map for hidden paths';
      render(<NotesSection {...defaultProps} notes={notesValue} />);

      const textarea = document.querySelector('textarea');
      expect(textarea.value).toBe(notesValue);
    });

    it('should update notes when text is changed', () => {
      const { rerender } = render(
        <NotesSection {...defaultProps} notes="Initial note" />
      );

      const textarea = document.querySelector('textarea');
      expect(textarea.value).toBe('Initial note');

      const newValue = 'Updated note with more details';
      fireEvent.change(textarea, { target: { value: newValue } });
      expect(defaultProps.onNotesChange).toHaveBeenCalledWith(newValue);

      rerender(<NotesSection {...defaultProps} notes={newValue} />);
      expect(textarea.value).toBe(newValue);
    });
  });

  describe('Notes are saved to state', () => {
    it('should save notes when textarea value changes', () => {
      render(<NotesSection {...defaultProps} />);

      const textarea = document.querySelector('textarea');
      fireEvent.change(textarea, { target: { value: 'New note' } });

      expect(defaultProps.onNotesChange).toHaveBeenCalledWith('New note');
    });
  });

  describe('User-facing text is translated', () => {
    it('should display translated section title', () => {
      render(<NotesSection {...defaultProps} />);

      const sectionTitle = screen.getByText('Notes');
      expect(sectionTitle).toBeInTheDocument();
      expect(mockT).toHaveBeenCalledWith('sections.notes');
    });
  });
});
