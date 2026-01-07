import type { Route } from "./+types/home";

import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

import Navbar from "../components/Navbar";
import ResumeCard from "../components/ResumeCard";
import { resumes } from "../../constants";

import { usePuterStore } from "../lib/puter";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumate" },
    { name: "description", content: "Smart resume builder for smart people" },
  ];
}

export default function Home() {
  // State to check loading state from puter store
  // It is getting reset whenever we use some other function, so good to have it here
  const { auth } = usePuterStore();

  // Asking users to first lofin to view the home page.
  // We will redirect the user to login page
  const navigate = useNavigate();

  // Handle redirection to home page once signed in
  // If not signed in, we stay here
  useEffect(() => {
      if(!auth.isAuthenticated) {
          navigate('/auth?next=/');
      }
  }, [auth.isAuthenticated]);

  return (
    // Entire App
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      {/* Hero section */}
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Applications and Resume Ratings</h1>
          <h2>Review your submissions and check AI powered feedback</h2>
        </div>

        {/* Resume we uploaded previously */}
        { resumes.length > 0 && (
          <div className="resumes-section">
            { resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
