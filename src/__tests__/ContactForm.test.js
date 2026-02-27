/** @format */

import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import Contact from '../components/Contact';
import '@testing-library/jest-dom';

jest.mock('../animations/FadeIn', () => ({ children }) => (
  <div>{children}</div>
));

describe('Contact Component - Advanced Logic Tests', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('should show loading state and then success message', async () => {
    render(<Contact />);

    fireEvent.change(screen.getByPlaceholderText(/Your name/i), {
      target: { name: 'name', value: 'Murphy Xue' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Your.email@example.com/i), {
      target: { name: 'email', value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Tell me about your ideas/i), {
      target: { name: 'message', value: 'This is a valid test message.' },
    });

    const submitBtn = screen.getByRole('button', { name: /Send Message/i });
    fireEvent.click(submitBtn);

    //  Loading status
    expect(screen.getByText(/Sending.../i)).toBeInTheDocument();

    // wait for 1s Promise resolve
    //
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    //
    expect(
      await screen.findByText(/Message sent successfully!/i),
    ).toBeInTheDocument();

    //
    expect(screen.getByPlaceholderText(/Your name/i).value).toBe('');
  });

  test('success message should disappear after 5 seconds', async () => {
    render(<Contact />);

    fireEvent.change(screen.getByPlaceholderText(/Your name/i), {
      target: { name: 'name', value: 'Murphy' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Your.email@example.com/i), {
      target: { name: 'email', value: 'a@b.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Tell me about your ideas/i), {
      target: { name: 'message', value: '1234567890' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));

    //
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText(/Message sent successfully!/i)).toBeInTheDocument();

    // advanced 5s，clean Timer
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(
      screen.queryByText(/Message sent successfully!/i),
    ).not.toBeInTheDocument();
  });

  test('should validate email format and show error', async () => {
    render(<Contact />);

    const emailInput = screen.getByPlaceholderText(/Your.email@example.com/i);
    fireEvent.change(emailInput, {
      target: { name: 'email', value: 'invalidemail' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Send Message/i }));

    expect(
      await screen.findByText(/Please enter a valid email/i),
    ).toBeInTheDocument();
  });
});
