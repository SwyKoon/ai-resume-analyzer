import type { Route } from "./+types/home";

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";

import Navbar from "../components/Navbar";
import ResumeCard from "../components/ResumeCard";
// import { resumes } from "../../constants";

import { usePuterStore } from "../lib/puter";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumate" },
    { name: "description", content: "Smart resume builder for smart people" },
  ];
}

export default function Home() {
  // State to keep track of resumes and if we are loading them or not
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  // State to check loading state from puter store
  // It is getting reset whenever we use some other function, so good to have it here
  const { auth, kv } = usePuterStore();

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

  // To fetch the resumes only at start so empty dependency array
  useEffect(() => {
    const loadResumes = async () => {
      // We are loading resumes, so loading is true
      setLoadingResumes(true);

      // Fetch resumes here as key-value store. There are many resumes so an array is what
      // we expect 
      const resumes = (await kv.list('resume:*', true)) as KVItem[];

      // Now we get the parsed resumes
      const parsedResumes = resumes?.map((resume) => (
        JSON.parse(resume.value) as Resume
      ));

      console.log("Parsed resumes",parsedResumes);
      // Set the resumes to parsed resumes and loading to false
      setResumes(parsedResumes || []);
      setLoadingResumes(false);
    }

    loadResumes();
  }, []);

  return (
    // Entire App
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      {/* Hero section */}
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Applications and Resume Ratings</h1>

          {/* If we are loading then we let the user know so. If not, then we show them 
          button to upload resume for the first time */}
          { !loadingResumes && resumes.length === 0 ? (
            <h2>No Resumes found. Upload your first Resume to get feedback</h2>  
          ):(
            <h2>Review your submissions and check AI powered feedback</h2>
          )}
        </div>
        {loadingResumes && (
          <div className="flex flex-col items-center justify-center">
            <img src="/images/resume-scan-2.gif" className="w-50" />
          </div>
        )}

        {/* Resume we uploaded previously */}
        { !loadingResumes && resumes.length > 0 && (
          <div className="resumes-section">
            { resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}

        {/* Button to show option to redirect to upload page if no resume found */}
        { !loadingResumes && resumes?.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <Link to="/upload" className="primary-button w-fit text-xl font-semibold">
              Upload Resume
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
