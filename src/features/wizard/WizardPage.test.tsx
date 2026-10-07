import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Registration } from './types.ts';
import WizardPage from './WizardPage.tsx';

type User = ReturnType<typeof userEvent.setup>;

const next = (user: User) => user.click(screen.getByRole('button', { name: 'Next' }));

async function fillPersonal(user: User) {
  await user.type(screen.getByLabelText('Full name'), 'Asha Menon');
  await user.type(screen.getByLabelText('Email'), 'asha@example.com');
  await user.type(screen.getByLabelText('Phone'), '9876543210');
}

async function fillAddress(user: User, postalCode = '682011') {
  await user.selectOptions(screen.getByLabelText('Country'), 'India');
  await user.type(screen.getByLabelText('City'), 'Kochi');
  await user.type(screen.getByLabelText('Postal code'), postalCode);
}

async function fillPreferences(user: User) {
  await user.click(screen.getByLabelText('Pro'));
  await user.type(screen.getByLabelText('Skills'), 'React{Enter}');
}

describe('WizardPage', () => {
  it('blocks Next on an invalid step and shows linked errors', async () => {
    const user = userEvent.setup();
    render(<WizardPage />);

    await next(user);

    expect(screen.getByRole('heading', { name: 'Personal info' })).toBeInTheDocument();
    const name = screen.getByLabelText('Full name');
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name).toHaveAccessibleDescription('Name is required.');
    expect(screen.getByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Phone is required.')).toBeInTheDocument();

    await user.type(name, 'Asha');
    expect(screen.queryByText('Name is required.')).not.toBeInTheDocument();
  });

  it('requires a 6-digit postal code for India', async () => {
    const user = userEvent.setup();
    render(<WizardPage />);
    await fillPersonal(user);
    await next(user);

    await fillAddress(user, '6820');
    await next(user);
    expect(screen.getByLabelText('Postal code')).toHaveAccessibleDescription(
      'Indian postal codes must be exactly 6 digits.',
    );

    await user.type(screen.getByLabelText('Postal code'), '11');
    await next(user);
    expect(screen.getByRole('heading', { name: 'Preferences' })).toBeInTheDocument();
  });

  it('keeps entered values when going back and marks progress', async () => {
    const user = userEvent.setup();
    render(<WizardPage />);
    await fillPersonal(user);
    await next(user);

    expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
    expect(screen.getByRole('listitem', { current: 'step' })).toHaveTextContent('Address');

    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByLabelText('Full name')).toHaveValue('Asha Menon');
    expect(screen.getByLabelText('Email')).toHaveValue('asha@example.com');
  });

  it('adds and removes skills and requires at least one', async () => {
    const user = userEvent.setup();
    render(<WizardPage />);
    await fillPersonal(user);
    await next(user);
    await fillAddress(user);
    await next(user);

    await user.click(screen.getByLabelText('Team'));
    await user.type(screen.getByLabelText('Skills'), 'CSS{Enter}');
    await user.type(screen.getByLabelText('Skills'), 'css{Enter}');
    expect(screen.getAllByRole('button', { name: /^Remove/ })).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Remove CSS' }));
    await next(user);
    expect(screen.getByText('Add at least one skill.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Preferences' })).toBeInTheDocument();
  });

  it('restores the step and values after a refresh', async () => {
    const user = userEvent.setup();
    const first = render(<WizardPage />);
    await fillPersonal(user);
    await next(user);
    await user.type(screen.getByLabelText('City'), 'Kochi');
    first.unmount();

    render(<WizardPage />);
    expect(screen.getByRole('heading', { name: 'Address' })).toBeInTheDocument();
    expect(screen.getByLabelText('City')).toHaveValue('Kochi');
  });

  it('edits from the review step, submits and clears the saved progress', async () => {
    const user = userEvent.setup();
    let submitted: Registration | undefined;
    const submit = (data: Registration) => {
      submitted = data;
      return Promise.resolve();
    };
    render(<WizardPage submit={submit} />);
    await fillPersonal(user);
    await next(user);
    await fillAddress(user);
    await next(user);
    await fillPreferences(user);
    await next(user);

    expect(screen.getByRole('heading', { name: 'Review' })).toBeInTheDocument();
    expect(screen.getByText('Kochi')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Edit Address' }));
    const city = screen.getByLabelText('City');
    await user.clear(city);
    await user.type(city, 'Thrissur');
    await next(user);
    await next(user);

    expect(screen.getByText('Thrissur')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText("You're registered!")).toBeInTheDocument();
    expect(submitted?.address.city).toBe('Thrissur');
    expect(submitted?.preferences.skills).toEqual(['React']);
    expect(JSON.parse(sessionStorage.getItem('q3.step') ?? '""')).toBe('personal');

    await user.click(screen.getByRole('button', { name: 'Start a new registration' }));
    expect(screen.getByLabelText('Full name')).toHaveValue('');
  });
});
