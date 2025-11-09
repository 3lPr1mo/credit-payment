import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Backdrop from '../Backdrop';

// Mock component para testear children
const MockChild = ({ onClose, testId }: { onClose?: () => void; testId: string }) => (
    <div data-testid={testId} onClick={onClose}>
        Mock Child
    </div>
);

describe('Backdrop Component', () => {
    const mockOnClose = vi.fn();
    
    beforeEach(() => {
        // Reset document.body.style.overflow before each test
        document.body.style.overflow = '';
        vi.clearAllMocks();
    });

    afterEach(() => {
        // Clean up after each test
        document.body.style.overflow = '';
        cleanup();
    });

    describe('Conditional Rendering', () => {
        it('should render nothing when open is false', () => {
            const { container } = render(
                <Backdrop open={false} onClose={mockOnClose}>
                    <div data-testid="child">Child content</div>
                </Backdrop>
            );
            
            expect(container.firstChild).toBeNull();
            expect(screen.queryByTestId('child')).not.toBeInTheDocument();
        });

        it('should render backdrop when open is true', () => {
            render(
                <Backdrop open={true} onClose={mockOnClose}>
                    <div data-testid="child">Child content</div>
                </Backdrop>
            );
            
            expect(document.querySelector('.confirm-purchase-backdrop')).toBeInTheDocument();
            expect(screen.getByTestId('child')).toBeInTheDocument();
        });
    });

    describe('Body Overflow Management', () => {
        it('should set body overflow to hidden when open is true', () => {
            render(
                <Backdrop open={true} onClose={mockOnClose}>
                    <div>Content</div>
                </Backdrop>
            );
            
            expect(document.body.style.overflow).toBe('hidden');
        });

        it('should restore body overflow when open changes to false', () => {
            const { rerender } = render(
                <Backdrop open={true} onClose={mockOnClose}>
                    <div>Content</div>
                </Backdrop>
            );
            
            expect(document.body.style.overflow).toBe('hidden');
            
            rerender(
                <Backdrop open={false} onClose={mockOnClose}>
                    <div>Content</div>
                </Backdrop>
            );
            
            expect(document.body.style.overflow).toBe('');
        });

        it('should clean up body overflow when component unmounts', () => {
            const { unmount } = render(
                <Backdrop open={true} onClose={mockOnClose}>
                    <div>Content</div>
                </Backdrop>
            );
            
            expect(document.body.style.overflow).toBe('hidden');
            
            unmount();
            
            expect(document.body.style.overflow).toBe('');
        });
    });

    describe('Children Handling', () => {
        it('should pass onClose prop to React element children', () => {
            render(
                <Backdrop open={true} onClose={mockOnClose}>
                    <MockChild testId="mock-child" />
                </Backdrop>
            );
            
            const child = screen.getByTestId('mock-child');
            fireEvent.click(child);
            
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it('should handle non-React element children', () => {
            render(
                <Backdrop open={true} onClose={mockOnClose}>
                    Text content
                    <div data-testid="regular-div">Regular div</div>
                </Backdrop>
            );
            
            expect(screen.getByText('Text content')).toBeInTheDocument();
            expect(screen.getByTestId('regular-div')).toBeInTheDocument();
        });

        it('should handle multiple children', () => {
            render(
                <Backdrop open={true} onClose={mockOnClose}>
                    <MockChild testId="child-1" />
                    <MockChild testId="child-2" />
                    <div data-testid="child-3">Regular child</div>
                </Backdrop>
            );
            
            expect(screen.getByTestId('child-1')).toBeInTheDocument();
            expect(screen.getByTestId('child-2')).toBeInTheDocument();
            expect(screen.getByTestId('child-3')).toBeInTheDocument();
            
            // Both MockChild components should receive onClose
            fireEvent.click(screen.getByTestId('child-1'));
            fireEvent.click(screen.getByTestId('child-2'));
            
            expect(mockOnClose).toHaveBeenCalledTimes(2);
        });
    });

    describe('Click Event Handling', () => {
        it('should stop propagation when clicking on backdrop-content', () => {
            render(
                <Backdrop open={true} onClose={mockOnClose}>
                    <div data-testid="content">Content</div>
                </Backdrop>
            );
            
            const backdropContent = document.querySelector('.backdrop-content');
            expect(backdropContent).toBeInTheDocument();
            
            // Create a spy on the Event prototype's stopPropagation method
            const stopPropagationSpy = vi.fn();
            
            // Mock the event's stopPropagation method
            const originalStopPropagation = Event.prototype.stopPropagation;
            Event.prototype.stopPropagation = stopPropagationSpy;
            
            // Simulate click on backdrop-content
            fireEvent.click(backdropContent!);
            
            expect(stopPropagationSpy).toHaveBeenCalled();
            
            // Restore the original method
            Event.prototype.stopPropagation = originalStopPropagation;
        });
    });

    describe('CSS Classes', () => {
        it('should have correct CSS classes', () => {
            render(
                <Backdrop open={true} onClose={mockOnClose}>
                    <div>Content</div>
                </Backdrop>
            );
            
            const backdrop = document.querySelector('.confirm-purchase-backdrop');
            const backdropContent = document.querySelector('.backdrop-content');
            
            expect(backdrop).toHaveClass('confirm-purchase-backdrop');
            expect(backdropContent).toHaveClass('backdrop-content');
        });
    });

    describe('Edge Cases', () => {
        it('should handle undefined children', () => {
            render(
                <Backdrop open={true} onClose={mockOnClose}>
                    {undefined}
                </Backdrop>
            );
            
            expect(document.querySelector('.confirm-purchase-backdrop')).toBeInTheDocument();
        });

        it('should handle null children', () => {
            render(
                <Backdrop open={true} onClose={mockOnClose}>
                    {null}
                </Backdrop>
            );
            
            expect(document.querySelector('.confirm-purchase-backdrop')).toBeInTheDocument();
        });

        it('should handle empty children', () => {
            render(
                <Backdrop open={true} onClose={mockOnClose}>
                    <div>Content</div>
                </Backdrop>
            );
            
            expect(document.querySelector('.confirm-purchase-backdrop')).toBeInTheDocument();
        });
    });
});
