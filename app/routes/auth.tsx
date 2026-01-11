import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { usePuterStore } from "../lib/puter";

export const meta = () => ([
    { title: 'Resumate | Auth' },
    { name: 'description', content: 'Log into you account' },
])

const auth = () => {
    // State to check loading state from puter store
    // It is getting reset whenever we use some other function, so good to have it here
    const { isLoading, auth } = usePuterStore();
    const [loginRequested, setLoginRequested] = useState(false);

    // Page redirection for 2 cases:
    // a.) Users not logged in, to sign in
    // b.) Users now logged in, to page of their choice (home if no choice)
    const location = useLocation();
    // Page they want to visit. Extract the first next page they want to visit
    const params = new URLSearchParams(location.search);
    const next = params.get("next") || "/";
    const navigate = useNavigate();

    // Handle redirection in case the user is already signed in.
    // If not signed in, we stay here
    useEffect(() => {
        if (loginRequested && auth.isAuthenticated) {
            navigate(next || "/", { replace: true });
        }
    }, [loginRequested, auth.isAuthenticated, next]);

    
    return (
        <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center
        justify-center">
            {/* This is going to act as our form */}
            <div className="gradient-border shadow-lg">
                <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1>Welcome</h1>
                        <h2>Log In to Continue Your Job Journey</h2>
                    </div>

                    {/* Auth Checking */}
                    <div>
                        { isLoading ? (
                            <button className="auth-button animate-pulse">
                                <p>Signing you in ...</p>
                            </button>
                        ) : (
                                // Inside empty React gragment to render JSX
                                <>
                                    { auth.isAuthenticated ? (
                                        <button className="auth-button" 
                                        onClick={ auth.signOut }>
                                            <p>Log Out</p>
                                        </button>
                                    ) : (
                                        <button className="auth-button" 
                                        onClick={() =>{
                                            setLoginRequested(true);
                                            auth.signIn(); 
                                        }}>
                                            <p>Log In</p>
                                        </button>
                                    )}
                                </>
                            )
                        }
                    </div>
                </section>
            </div>

        </main>
    )
}

export default auth