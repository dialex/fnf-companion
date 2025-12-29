import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Footer from '../../components/Footer';
import packageJson from '../../../package.json';

describe('Footer Section', () => {
  it('should display footer element', () => {
    render(<Footer />);

    const footer = document.querySelector('footer');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass('text-white');
  });

  it('should display the current version number', () => {
    render(<Footer />);

    const versionLink = screen.getByText(`v${packageJson.version}`);
    expect(versionLink).toBeInTheDocument();
    expect(versionLink).toHaveAttribute(
      'href',
      'https://github.com/dialex/fnf-companion'
    );
    expect(versionLink).toHaveAttribute('target', '_blank');
    expect(versionLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should display author link', () => {
    render(<Footer />);

    const authorLink = screen.getByText('Diogo Nunes');
    expect(authorLink).toBeInTheDocument();
    expect(authorLink).toHaveAttribute('href', 'https://diogonunes.com/');
    expect(authorLink).toHaveAttribute('target', '_blank');
    expect(authorLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should have correct styling and structure', () => {
    render(<Footer />);

    const footer = document.querySelector('footer');
    expect(footer).toHaveStyle({
      backgroundColor: 'var(--header-bg)',
      padding: '0.75rem 0',
    });

    const container = footer?.querySelector('.container');
    expect(container).toBeInTheDocument();

    const paragraph = footer?.querySelector('p.content');
    expect(paragraph).toBeInTheDocument();
    expect(paragraph).toHaveClass('mb-0', 'text-center');
  });
});
