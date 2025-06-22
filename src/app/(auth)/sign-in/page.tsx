// app/login/page.tsx
'use client';

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';


// import Image from 'next/image'; // If you have a logo

// const LOGO_URL = '/ftmk-logo.png'; // Path to your logo

const SignInPage: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { signIn } = useAuth();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!email || !password) {
            setError('Email and password are required.');
            setIsLoading(false);
            return;
        }

        try {
            console.log("Before signIn");
            await signIn(email, password);
            console.log("After signIn");
            
        } catch (err: unknown) {
            console.log('Login form: Sign in failed', err);
            
            // Handle specific error messages from the API
            let errorMessage = 'An unexpected error occurred. Please try again.';
            
            if (err instanceof Error && err.message) {
                errorMessage = err.message;
            } else if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && 'data' in err.response && err.response.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
                errorMessage = String(err.response.data.message);
            }
            
            console.log('Login form: Setting error message:', errorMessage);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (

            <div className="auth-background-container">
                <div className='auth-background-overlay'></div>
                <div className="auth-box">

                    <h1>Welcome back</h1>
                    <p>Sign in to your account</p>
                    <form onSubmit={handleSubmit}> {/* Tailwind for spacing between form elements */}
                        <div className='form-group'>
                            <label htmlFor="email" className="form-label"> {/* Reusing .form-label */}
                                Email
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
                                    placeholder="Enter email"
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className='form-group'>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label htmlFor="password" className="form-label mb-0"> {/* Reusing .form-label, remove bottom margin if label and link are on same line visually */}
                                    Password
                                </label>
                                <div className="text-sm"> {/* Tailwind for font size */}
                                    <Link href="/forgot-password" className="auth-link"> {/* New class for auth links */}
                                        Forgot your password?
                                    </Link>
                                </div>
                            </div>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="form-input" // Reusing .form-input
                                />
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
                            <label htmlFor="show-password" className='auth-checkbox-label' > {/* New class */}
                                Show password
                            </label>
                        </div>

                        {error && (
                            <div className="error-message p-4 flex items-center rounded-md"> {/* Reusing .error-message, added padding and flex for icon */}
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style={{ color: '#721c24' /* Match error text color */ }}>
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L10 8.586 7.707 6.293a1 1 0 00-1.414 1.414L8.586 10l-2.293 2.293a1 1 0 001.414 1.414L10 11.414l2.293 2.293a1 1 0 001.414-1.414L11.414 10l2.293-2.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium" style={{ color: '#721c24' /* Match error background */ }}>{error}</p>
                                </div>
                            </div>
                        )}

                        <div className='mt-4'>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="button-primary full-width-button"
                            >
                               
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </div>
                    </form>

                    <div className="signup-link">
                        Don&apos;t have an account? {' '}
                        <Link href="/sign-up/check-email">
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>

      
    );
};

export default SignInPage;
