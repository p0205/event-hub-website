// app/login/page.tsx
'use client';

import React, { useState, FormEvent } from 'react';
import Head from 'next/head';
import Link from 'next/link';
// import Image from 'next/image'; // If you have a logo

// const LOGO_URL = '/ftmk-logo.png'; // Path to your logo

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!email || !password) {
            setError('Email and password are required.');
            setIsLoading(false);
            return;
        }

        console.log('Login attempt:', { email, password });
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            alert('Login successful! (This is a simulation)');
            // router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Login - FTMK</title>
                <meta name="description" content="Login to your FTMK account" />
            </Head>
            <div className="auth-page-container"> {/* New class from global.css */}
                <div className="auth-content-wrapper"> {/* New class from global.css */}
                    <div className="auth-logo"> {/* New class from global.css */}
                        {/* Replace with your actual logo or text */}
                        {/* <Image src={LOGO_URL} alt="FTMK Logo" width={150} height={75} onError={(e) => e.currentTarget.src = 'https://placehold.co/150x75/e0e0e0/757575?text=FTMK+Logo'} /> */}
                        <h1>FTMK</h1> {/* Example text logo */}
                    </div>
                    <h2 className="auth-main-title"> {/* New class from global.css */}
                        Sign in to your account
                    </h2>

                    <div className="form-container mt-8"> {/* Reusing .form-container, mt-8 for spacing */}
                        <form className="space-y-6" onSubmit={handleSubmit}> {/* Tailwind for spacing between form elements */}
                            <div>
                                <label htmlFor="email" className="form-label"> {/* Reusing .form-label */}
                                    Email address
                                </label>
                                <div className="mt-1"> {/* Tailwind for margin */}
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="form-input" // Reusing .form-input
                                    />
                                </div>
                            </div>

                            <div>
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

                            {error && (
                                // Using your existing .error-message, adding padding and icon structure via Tailwind/inline styles
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

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    // Reusing .button-primary and adding .full-width-button for layout
                                    className="button-primary full-width-button"
                                >
                                    {isLoading && (
                                        <svg className="auth-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                    {isLoading ? 'Signing In...' : 'Sign In'}
                                </button>
                            </div>
                        </form>

                        <div className="auth-alternative-action"> {/* New class */}
                            <Link href="/register" className="auth-link"> {/* New class */}
                                Don't have an account? Sign up
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginPage;
