import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from './DashboardPage';

describe('DashboardPage', () => {
  it('renders the creator command center without fabricated live state', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Creator Command Center/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open Studio/i })).toHaveAttribute('href', '/studio');
    expect(screen.getByText(/Not connected/i)).toBeInTheDocument();
    expect(screen.getByText(/No synthetic live audience/i)).toBeInTheDocument();
  });
});
