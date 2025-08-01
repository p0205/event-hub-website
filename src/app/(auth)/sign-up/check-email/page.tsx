'use client';

import { authService } from '@/services';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, FormEvent, useEffect } from 'react';

interface UserSignUpDTO {
    id: number;
    email: string;
    name: string;
}

const CheckEmailPage: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [verificationCode, setVerificationCode] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
    const [showVerificationForm, setShowVerificationForm] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [resendTimer, setResendTimer] = useState<number>(0);
    const [canResend, setCanResend] = useState<boolean>(true);

    const router = useRouter();

    // Timer effect for resend button
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => {
                    if (prev <= 1) {
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!email) {
            setError('Enter your UTEM email.');
            setIsLoading(false);
            return;
        }

        try {
            const isValidEmail = await authService.checkEmail(email);
            if (isValidEmail) {
                // Email is valid, now send verification code
                await sendVerificationCode();
                setShowVerificationForm(true);
            }
        } catch (err: unknown) {
            if (err instanceof Error && err.message === 'UserAlreadyRegistered') {
                setError('User with this email is already registered. Please log in instead.');
            } else if (err instanceof Error && err.message === 'EmailNotFound') {
                setError('Email not found in the university database. Please use a valid UTEM email.');
            } else {
                setError('An unexpected error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const sendVerificationCode = async () => {
        try {
            // Call your API to send verification code
            // await authService.sendVerificationCode(email);
            
            // Start the resend timer (60 seconds)
            setResendTimer(60);
            setCanResend(false);
            setError(null);
        } catch (err) {
            setError('Failed to send verification code. Please try again.');
        }
    };

    const handleVerificationSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!verificationCode) {
            setError('Enter the verification code.');
            setIsLoading(false);
            return;
        }

        try {
            const user = await authService.verifyCode(email, verificationCode);
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
        } catch (err: unknown) {
            if (err instanceof Error && err.message === 'UserAlreadyRegistered') {
                setError('User with this email is already registered. Please log in instead.');
            } else if (err instanceof Error && err.message === 'EmailNotFound') {
                setError('Invalid verification code. Please check and try again.');
            } else {
                setError('Invalid verification code. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!canResend) return;
        
        setIsLoading(true);
        try {
            await sendVerificationCode();
        } catch (err) {
            setError('Failed to resend verification code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToEmail = () => {
        setShowVerificationForm(false);
        setVerificationCode('');
        setError(null);
        setResendTimer(0);
        setCanResend(true);
    };

    return (
        <div className="auth-background-container">
            <div className='auth-background-overlay'></div>
            <div className="auth-box">
                <h1>Event Hub</h1>
                <p>Sign Up</p>
                
                {!showVerificationForm ? (
                    // Email verification form
                    <form onSubmit={handleEmailSubmit}>
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
                                {isLoading ? 'Verifying Email...' : 'Send Verification Code'}
                            </button>
                        </div>
                    </form>
                ) : (
                    // Verification code form
                    <form onSubmit={handleVerificationSubmit}>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-4">
                                We've sent a verification code to <strong>{email}</strong>
                            </p>
                            <button
                                type="button"
                                onClick={handleBackToEmail}
                                className="text-sm text-blue-600 hover:text-blue-800 mb-4"
                            >
                                ← Change email address
                            </button>
                        </div>

                        <div className='form-group'>
                            <label htmlFor="verificationCode" className="form-label">
                                Verification Code
                            </label>
                            <div className="mt-1">
                                <input
                                    id="verificationCode"
                                    name="verificationCode"
                                    type="text"
                                    required
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    className="form-input"
                                    maxLength={6}
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

                        <div className="space-y-3">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="button-primary full-width-button"
                            >
                                {isLoading ? 'Verifying Code...' : 'Verify Code'}
                            </button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleResendCode}
                                    disabled={!canResend || isLoading}
                                    className={`text-sm ${canResend ? 'text-blue-600 hover:text-blue-800' : 'text-gray-400 cursor-not-allowed'}`}
                                >
                                    {canResend ? 'Resend verification code' : `Resend in ${resendTimer}s`}
                                </button>
                            </div>
                        </div>
                    </form>
                )}

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