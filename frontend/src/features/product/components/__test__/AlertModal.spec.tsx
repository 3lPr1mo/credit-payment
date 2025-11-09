import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AlertModal from '../AlertModal';

describe('AlertModal', () => {
  it('should render correctly', () => {
    const mockOnClose = vi.fn();
    
    render(<AlertModal onClose={mockOnClose} />);
    
    // Verificar que el modal se renderiza
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('should display correct text content', () => {
    const mockOnClose = vi.fn();
    
    render(<AlertModal onClose={mockOnClose} />);
    
    // Verificar que los textos se muestran correctamente
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Please verify your information or try again later')).toBeInTheDocument();
  });

  it('should call onClose when Close button is clicked', () => {
    const mockOnClose = vi.fn();
    
    render(<AlertModal onClose={mockOnClose} />);
    
    // Hacer click en el botón Close
    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);
    
    // Verificar que la función onClose fue llamada
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should render the error icon SVG', () => {
    const mockOnClose = vi.fn();
    
    render(<AlertModal onClose={mockOnClose} />);
    
    // Verificar que el SVG se renderiza (buscar por el círculo del ícono)
    const svgIcon = document.querySelector('svg');
    expect(svgIcon).toBeInTheDocument();
    expect(svgIcon).toHaveAttribute('width', '64');
    expect(svgIcon).toHaveAttribute('height', '64');
  });

  it('should have correct CSS classes for styling', () => {
    const mockOnClose = vi.fn();
    
    render(<AlertModal onClose={mockOnClose} />);
    
    // Verificar que las clases CSS están aplicadas
    expect(document.querySelector('.alert-modal-overlay')).toBeInTheDocument();
    expect(document.querySelector('.alert-modal-content')).toBeInTheDocument();
    expect(document.querySelector('.alert-modal-icon')).toBeInTheDocument();
    expect(document.querySelector('.alert-modal-actions')).toBeInTheDocument();
  });

  it('should have primary button styling', () => {
    const mockOnClose = vi.fn();
    
    render(<AlertModal onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button', { name: 'Close' });
    expect(closeButton).toHaveClass('btn-primary');
  });
});
