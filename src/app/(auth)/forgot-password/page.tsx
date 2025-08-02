'use client';

import { authService } from '@/services';
import Link from 'next/link';
import React, { useState, FormEvent, useEffect } from 'react';



const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [verificationCode, setVerificationCode] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState<'email' | 'otp' | 'password' | 'success'>('email');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [resendTimer, setResendTimer] = useState<number>(0);
    const [canResend, setCanResend] = useState<boolean>(true);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

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

    const validatePassword = (password: string): string | null => {
        if (password.length < 8) {
            return 'Password must be at least 8 characters long.';
        }
        if (!/(?=.*[a-z])/.test(password)) {
            return 'Password must contain at least one lowercase letter.';
        }
        if (!/(?=.*[A-Z])/.test(password)) {
            return 'Password must contain at least one uppercase letter.';
        }
        if (!/(?=.*\d)/.test(password)) {
            return 'Password must contain at least one number.';
        }
        if (!/(?=.*[@$!%*?&])/.test(password)) {
            return 'Password must contain at least one special character (@$!%*?&).';
        }
        return null;
    };

    const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!email) {
            setError('Please enter your email address.');
            setIsLoading(false);
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            setIsLoading(false);
            return;
        }

        try {
            const message = await authService.requestResetPasswordOTP(email);
            setSuccessMessage(message);
            setCurrentStep('otp');
            setError(null);
            // Start the resend timer (60 seconds)
            setResendTimer(60);
            setCanResend(false);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleOTPSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!verificationCode) {
            setError('Please enter the verification code.');
            setIsLoading(false);
            return;
        }

        try {
            const valid = await authService.verifyResetPasswordCode(email, verificationCode);
            if (valid) {
      
                setCurrentStep('password');
                setError(null);
            } else {
                throw new Error('Verification failed.');
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Invalid verification code. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!newPassword || !confirmPassword) {
            setError('Please fill in all required fields.');
            setIsLoading(false);
            return;
        }

        // Validate password strength
        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            setError(passwordError);
            setIsLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            setIsLoading(false);
            return;
        }

        try {
            const message = await authService.resetPassword(email, newPassword);
            setSuccessMessage(message);
            setCurrentStep('success');
            setError(null);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to reset password. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!canResend) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const message = await authService.requestResetPasswordOTP(email);
            setSuccessMessage(message);
            setResendTimer(60);
            setCanResend(false);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to resend OTP. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToEmail = () => {
        setCurrentStep('email');
        setVerificationCode('');
        setError(null);
        setResendTimer(0);
        setCanResend(true);
    };

    const handleBackToOTP = () => {
        setCurrentStep('otp');
        setNewPassword('');
        setConfirmPassword('');
        setError(null);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    // Success step
    if (currentStep === 'success') {
        return (
            <div className="auth-background-container">
                <div className='auth-background-overlay'></div>
                <div className="auth-box">
                    <div className="text-center">
                        <div className="mb-4">
                            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" fill="none"/>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 24l4 4 8-8"/>
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-green-600 mb-2">Password Reset Successful!</h1>
                        <p className="text-gray-600 mb-4">
                            {successMessage}
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            You can now sign in with your new password.
                        </p>
                        <Link href="/sign-in" className="button-primary full-width-button">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-background-container">
            <div className='auth-background-overlay'></div>
            <div className="auth-box">
                <h1>Event Hub</h1>
                <p>Reset Your Password</p>

                {/* Step 1: Email Input */}
                {currentStep === 'email' && (
                    <>
                        <p className="text-sm text-gray-600 mb-6">
                            Enter your email address and we'll send you an OTP to reset your password.
                        </p>

                        <form onSubmit={handleEmailSubmit}>
                            <div className='form-group'>
                                <label htmlFor="email" className="form-label">
                                    Email Address
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
                                        placeholder="Enter your email address"
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
                                    {isLoading ? 'Sending OTP...' : 'Send OTP'}
                                </button>
                            </div>
                        </form>
                    </>
                )}

                {/* Step 2: OTP Verification */}
                {currentStep === 'otp' && (
                    <>
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

                        <form onSubmit={handleOTPSubmit}>
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
                                    {isLoading ? 'Verifying...' : 'Verify Code'}
                                </button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        disabled={!canResend || isLoading}
                                        className={`text-sm ${canResend ? 'text-blue-600 hover:text-blue-800' : 'text-gray-400 cursor-not-allowed'}`}
                                    >
                                        {canResend ? 'Resend OTP' : `Resend in ${resendTimer}s`}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </>
                )}

                {/* Step 3: New Password */}
                {currentStep === 'password' && (
                    <>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-4">
                                Email verified! Enter your new password.
                            </p>
                           
                        </div>

                        <form onSubmit={handlePasswordSubmit}>
                            <div className='form-group'>
                                <label htmlFor="newPassword" className="form-label">
                                    New Password
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        id="newPassword"
                                        name="newPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter your new password"
                                        className="form-input pr-10"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={togglePasswordVisibility}
                                    >
                                        {showPassword ? (
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className='form-group'>
                                <label htmlFor="confirmPassword" className="form-label">
                                    Confirm New Password
                                </label>
                                <div className="mt-1 relative">
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm your new password"
                                        className="form-input pr-10"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={toggleConfirmPasswordVisibility}
                                    >
                                        {showConfirmPassword ? (
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Password Requirements */}
                            <div className="mb-4 p-3 bg-gray-50 rounded-md">
                                <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                                <ul className="text-xs text-gray-600 space-y-1">
                                    <li className={`flex items-center gap-2 ${newPassword.length >= 8 ? 'text-green-600' : ''}`}>
                                        <span className={`w-2 h-2 rounded-full ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                        At least 8 characters
                                    </li>
                                    <li className={`flex items-center gap-2 ${/(?=.*[a-z])/.test(newPassword) ? 'text-green-600' : ''}`}>
                                        <span className={`w-2 h-2 rounded-full ${/(?=.*[a-z])/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                        One lowercase letter
                                    </li>
                                    <li className={`flex items-center gap-2 ${/(?=.*[A-Z])/.test(newPassword) ? 'text-green-600' : ''}`}>
                                        <span className={`w-2 h-2 rounded-full ${/(?=.*[A-Z])/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                        One uppercase letter
                                    </li>
                                    <li className={`flex items-center gap-2 ${/(?=.*\d)/.test(newPassword) ? 'text-green-600' : ''}`}>
                                        <span className={`w-2 h-2 rounded-full ${/(?=.*\d)/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                        One number
                                    </li>
                                    <li className={`flex items-center gap-2 ${/(?=.*[@$!%*?&])/.test(newPassword) ? 'text-green-600' : ''}`}>
                                        <span className={`w-2 h-2 rounded-full ${/(?=.*[@$!%*?&])/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                        One special character (@$!%*?&)
                                    </li>
                                </ul>
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
                                    {isLoading ? 'Resetting Password...' : 'Reset Password'}
                                </button>
                            </div>
                        </form>
                    </>
                )}

                <div className="auth-divider-container">
                    <div className="auth-divider-line"></div>
                </div>

                
            </div>
        </div>
    );
};

export default ForgotPasswordPage;