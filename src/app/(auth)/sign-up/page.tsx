// app/register/page.tsx
'use client';

import React, { useState, FormEvent } from 'react';
import Head from 'next/head';
import Link from 'next/link';
// import Image from 'next/image';

// const LOGO_URL = '/ftmk-logo.png';

const RegistrationPage: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [securityQuestion, setSecurityQuestion] = useState<string>('');
  const [securityAnswer, setSecurityAnswer] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!name || !email || !password || !phoneNumber || !securityQuestion || !securityAnswer) {
      setError('All fields are required.');
      setIsLoading(false);
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setIsLoading(false);
      return;
    }

    console.log('Form submitted:', { name, email, password, phoneNumber, securityQuestion, securityAnswer });
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Account created successfully! (This is a simulation)');
    } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
    
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Account - FTMK</title>
        <meta name="description" content="Create your FTMK account" />
      </Head>
      <div className="auth-page-container"> {/* New class */}
        <div className="auth-content-wrapper"> {/* New class */}
          <div className="auth-logo"> {/* New class */}
            <h1>FTMK</h1> {/* Example text logo */}
          </div>
          <h2 className="auth-main-title"> {/* New class */}
            Create your Account
          </h2>

          <div className="form-container mt-8"> {/* Reusing .form-container */}
            <form className="space-y-6" onSubmit={handleSubmit}> {/* Tailwind for spacing */}
              <div>
                <label htmlFor="name" className="form-label"> {/* Reusing .form-label */}
                  Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Siti Hajar Binti Azi Shaufi"
                    className="form-input" // Reusing .form-input
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="b032010441@student.utem.edu.my"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Password and Phone Number (Side-by-side on larger screens using Tailwind grid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6"> {/* Tailwind grid for layout */}
                <div>
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
                </div>

                <div>
                  <label htmlFor="phone" className="form-label">
                    Phone Number
                  </label>
                  <div className="mt-1">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter your phone number"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="security-question" className="form-label">
                  Security Question
                </label>
                <div className="mt-1">
                  <input
                    id="security-question"
                    name="security-question"
                    type="text"
                    required
                    value={securityQuestion}
                    onChange={(e) => setSecurityQuestion(e.target.value)}
                    placeholder="e.g., What is your mother's maiden name?"
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="security-answer" className="form-label">
                  Answer
                </label>
                <div className="mt-1">
                  <input
                    id="security-answer"
                    name="security-answer"
                    type="text"
                    required
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    placeholder="Answer"
                    className="form-input"
                  />
                </div>
              </div>

              {error && (
                <div className="error-message p-4 flex items-center rounded-md"> {/* Reusing .error-message */}
                  <div className="flex-shrink-0">
                     <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style={{ color: '#721c24' }}>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L10 8.586 7.707 6.293a1 1 0 00-1.414 1.414L8.586 10l-2.293 2.293a1 1 0 001.414 1.414L10 11.414l2.293 2.293a1 1 0 001.414-1.414L11.414 10l2.293-2.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium" style={{ color: '#721c24' }}>{error}</p>
                  </div>
                </div>
              )}

              <div>
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

            <div className="auth-divider-container"> {/* New class */}
              <div className="auth-divider-line"> {/* New class */}
                <div />
              </div>
              <div className="auth-divider-text-wrapper"> {/* New class */}
                <span className="auth-divider-text">Or</span> {/* New class */}
              </div>
            </div>

            <div className="auth-alternative-action"> {/* New class */}
              Have an account?{' '}
              <Link href="/login" className="auth-link"> {/* New class */}
                  Go to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegistrationPage;
