// app/register/page.tsx
'use client';

import { authService } from '@/services';
import { useSearchParams } from 'next/navigation';

import React, { useState, FormEvent } from 'react';

const SignUpPage: React.FC = () => {
  const searchParams = useSearchParams();
  // const router = useRouter();

  const [name, setName] = useState(searchParams.get('name') || '');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!name || !email || !password || !phoneNumber) {
      setError('All fields are required.');
      setIsLoading(false);
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    console.log('Form submitted:', { name, email, password, phoneNumber });
    try {
      authService.signUp(email, phoneNumber, password);
      alert('Account created successfully!');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>

      <div className="auth-background-container">
        <div className='auth-background-overlay'></div>
        <div className="auth-box">
          <h1>Sign Up</h1>
          <p>Complete Your Registration</p>
          <form onSubmit={handleSubmit}>
            <div className='form-group'>
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  disabled
                  value={name}
                  autoComplete="name"
                  required
                  placeholder="Name"
                  className="form-input" // Reusing .form-input
                />
              </div>
            </div>

            <div className='form-group'>
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  disabled
                  required
                  value={email}

                  placeholder="Enter email"
                  className="form-input"
                />
              </div>
            </div>

            <div className='form-group'>

              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="form-input"
                />
              </div>

              <div className='form-group'>
                <label htmlFor="confirm-password" className="form-label">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="form-input"
                  />
                </div>
              </div>


            </div>
            <div className="auth-checkbox-container"> {/* New class */}
              <input
                id="show-password"
                name="show-password"
                type="checkbox"
                className="auth-checkbox-input" // New class
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              <label htmlFor="show-password" className="auth-checkbox-label"> {/* New class */}
                Show password
              </label>
            </div>

            <div className='form-group'>
              <label htmlFor="phone" className="form-label">
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="number"
                  autoComplete="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  className="form-input"
                />
              </div>
            </div>



            {error && (
              <div className="error-message flex items-center rounded-lg bg-red-100 p-3 shadow-lg border border-red-300">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L10 8.586 7.707 6.293a1 1 0 00-1.414 1.414L8.586 10l-2.293 2.293a1 1 0 001.414 1.414L10 11.414l2.293 2.293a1 1 0 001.414-1.414L11.414 10l2.293-2.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-red-800 leading-tight">{error}</p>
                </div>
              </div>
            )}

            <div className='mt-4'>
              <button
                type="submit"
                disabled={isLoading}
                className="button-primary full-width-button" // Reusing .button-primary
              >
                {isLoading && (
                  <svg className="auth-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>

          {/* <div className="auth-divider-container">
            <div className="auth-divider-line">
              <div />
            </div>
            <div className="auth-divider-text-wrapper"> 
              <span className="auth-divider-text">Or</span> 
            </div>
          </div>

          <div className="auth-alternative-action">
            Have an account?{' '}
            <Link href="/login" className="auth-link">
            </Link>
          </div> */}
        </div>
      </div>

    </>
  );
};

export default SignUpPage;
