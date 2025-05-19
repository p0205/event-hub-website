'use client';

import { authService } from '@/services';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import React, { useState, FormEvent } from 'react';


const CheckEmailPage: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!email) {
            setError('Enter your UTEM email.');
            setIsLoading(false);
            return;
        }

        try {
            const user = await authService.checkEmail(email);
            if (user) {
                const query = new URLSearchParams({
                    email: user.email,
                    name: user.name,
                    id: String(user.id)
                }).toString();

                router.push(`/sign-up?${query}`);
            } else {
                throw new Error('User data is null.');
            }

            // const query = new URLSearchParams({
            //     email: "user.email",
            //     name:" user.name",
            //     id: "String(user.id)"
            // }).toString();
            // router.push(`/sign-up?${query}`);
   
        } catch (err: any) {
            if (err.message === 'UserAlreadyRegistered') {
                setError('User with this email is already registered. Please log in instead.');
            } else if (err.message === 'EmailNotFound') {
                setError('Email not found in the university database. Please use a valid UTEM email.');
            } else {
                setError('An unexpected error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-background-container">
            <div className='auth-background-overlay'></div>
            <div className="auth-box">
                <h1>Event Hub</h1>
                <p>Sign Up</p>
                <form onSubmit={handleSubmit}>
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
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your UTeM email"
                                className="form-input"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="error-message p-4 flex items-center rounded-md">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" style={{ color: '#721c24' }}>
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L10 8.586 7.707 6.293a1 1 0 00-1.414 1.414L8.586 10l-2.293 2.293a1 1 0 001.414 1.414L10 11.414l2.293 2.293a1 1 0 001.414-1.414L11.414 10l2.293-2.293z" clipRule="evenodd" />
                            </svg>
                            <div className="ml-3">
                                <p className="text-sm font-medium" style={{ color: '#721c24' }}>{error}</p>
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="button-primary full-width-button"
                        >
                            {isLoading ? 'Verifying Email...' : 'Next'}
                        </button>
                    </div>
                </form>

                <div className="auth-divider-container">
                    <div className="auth-divider-line"></div>
                </div>

                <div className="auth-alternative-action">
                    Already have an account?{' '}
                    <Link href="/sign-in" className="auth-link">Log in</Link>
                </div>
            </div>
        </div>
    );
};

export default CheckEmailPage;
