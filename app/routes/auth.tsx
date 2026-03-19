import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

import { usePuterStore } from "../lib/puter";

export const meta = () => ([
    { title: 'Resumate | Auth' },
    { name: 'description', content: 'Log into you account' },
])

const Auth = () => {
    // State to check loading state from puter store
    // It is getting reset whenever we use some other function, so good to have it here
    const { isLoading, auth } = usePuterStore();

    // Page redirection for 2 cases:
    // a.) Users not logged in, to sign in
    // b.) Users now logged in, to page of their choice (home if no choice)
    const location = useLocation();
    // Page they want to visit. Extract the first next page they want to visit
    const next = location.search.split('next=')[1];
    const navigate = useNavigate();

    // Handle redirection in case the user is already signed in.
    useEffect(() => {
        if(auth.isAuthenticated) {
            navigate(next);
        }
    }, [auth.isAuthenticated, next]);

    
    return (
        <main className="auth-split-container">
            {/* Left Side: Marketing & Illustration */}
            <div className="auth-left hidden lg:flex">
                <div className="relative z-10">
                    <p className="tag-accent">Next Gen Intelligence</p>
                    <h1 className="auth-heading">
                        Precision Analysis.<br />
                        Powered by AI.
                    </h1>
                    <p className="auth-subtext">
                        The world's most advanced AI resume analyzer. Unlock 
                        your career potential with data-driven insights.
                    </p>
                </div>

                {/* Illustration Wrapper */}
                <div className="absolute bottom-0 left-0 w-full h-[45%] flex items-end justify-center pointer-events-none">
                    <img 
                        src="/images/resume technician.png" 
                        alt="Resume Technician" 
                        className="w-[75%] h-auto object-contain opacity-90"
                    />
                </div>
                
                {/* Decorative background shapes if needed - can be added via CSS or here */}
            </div>

            {/* Right Side: Auth Card with Rotation */}
            <div className="auth-right">
                <div className="auth-card animate-rotate-y z-20">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <p className="text-gray-500 font-medium">Welcome Back</p>
                        <h2 className="text-2xl font-semibold text-gray-800">
                            Log In to Continue Your Job Journey
                        </h2>
                    </div>

                    <div className="w-full mt-4">
                        { isLoading ? (
                            <button className="auth-button animate-pulse w-full !text-lg py-4">
                                <p>Signing you in ...</p>
                            </button>
                        ) : (
                            <button 
                                className="auth-button w-full !text-xl py-5 shadow-xl hover:scale-[1.02] transition-transform" 
                                onClick={ auth.isAuthenticated ? auth.signOut : auth.signIn }
                            >
                                <p>{ auth.isAuthenticated ? 'Log Out' : 'Get Started Now' }</p>
                            </button>
                        )}
                    </div>

                    <p className="tos-text">
                        By continuing, you agree to our <a href="#" className="underline hover:text-indigo-600 transition-colors">Terms of Service</a>
                    </p>
                </div>
            </div>
        </main>
    )
}

export default Auth