import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CreatorStudioPage } from './CreatorStudioPage';

describe('CreatorStudioPage', () => {
  it('renders a stage-first studio with honest integration state', () => {
    render(
      <MemoryRouter>
        <CreatorStudioPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Creator Studio/i)).toBeInTheDocument();
    expect(screen.getByText(/Broadcast off/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start local preview/i })).toBeInTheDocument();
    expect(screen.getAllByText(/External broadcast/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Not configured/i)).toBeInTheDocument();
  });
});
