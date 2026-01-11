import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router"

import { usePuterStore } from "~/lib/puter";

import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";

export const meta = () => ([
    { title: 'Resumate | Review' },
    { name: 'description', content: 'Detailed overview of your Resume' },
])

const resume = () => {
    // To get dynamic parameter 'id' from url
    const { id } = useParams();
    const { auth, isLoading, fs, kv } = usePuterStore();

    // Setting states for imageUrl, resumeUrl and feedback
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const navigate = useNavigate();

    // Handle redirection to auth page if not signed in
    // isLoading = true just means “status unknown or changing”
    // The below line says - Once we are DONE checking, and the user is NOT authenticated 
    // then → redirect”
    useEffect(() => {
        if(!isLoading &&!auth.isAuthenticated) {
            navigate(`/auth?next=/resume/${id}`);
        }
    }, [isLoading]);

    // To load data of resume immediately as soon 'id' changes, we use useEffect for 
    // immediate results. Inside we will use key-value store from puter to get data of 
    // resume. It will be async, as we do not know how long it will take for data to be 
    // stored there. So by using async, we do other tasks while data comes back from store.
    useEffect(() => {
        const loadResume = async () => {
            // This gives access to all resume data
            const resume = await kv.get(`resume:${id}`);
            
            if(!resume) return;
            
            const data = JSON.parse(resume);

            // Puter returns data as Blob. So to read files, we need to convert them to
            // proper format, like PDF blob to pdf file and image blob to image file
            const resumeBlob = await fs.read(data.resumePath);
            if(!resumeBlob) return;

            const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
            const resumeUrl = URL.createObjectURL(pdfBlob);
            setResumeUrl(resumeUrl);

            const imageBlob = await fs.read(data.imagePath);
            if(!imageBlob) return;
            const imageUrl = URL.createObjectURL(imageBlob);
            setImageUrl(imageUrl);

            setFeedback(data.feedback);
            console.log({ resumeUrl, imageUrl, feedback: data.feedback });
        }

        loadResume();
    }, [id]);

  return (
    <main className="pt-0!">
        <nav className="resume-nav">
            <Link to='/' className="back-button">
                <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
                <span className="text-gray-800 text-sm font-semibold">
                    Back to Homepage
                </span>
            </Link>
        </nav>

        {/* The max-lg line is so that on mobile devices, we show important content first.
        (Which in our case is the section for feedback). On desktop, we stack both side by 
        side */}
        <div className="flex flex-row w-full max-lg:flex-col-reverse">
            {/* Section for resume */}
            <section className="feedback-section bg-url('/images/bg-small.svg') bg-cover
            h-full sticky top-0 items-center justify-center">
                { imageUrl && resumeUrl && (
                    <div className="animate-in fade-in duration-1000 
                    gradient-border max-sm:m-0 h-[90%] max-2xl:h-fit w-fit">
                        {/* Give target and attribute for the case when resume has
                        multpile pages or when we want to copy something from the resume we
                        uploaded */}
                        <a href={ resumeUrl } target="_blank" rel="noopener noreferrer">
                            <img 
                                src={ imageUrl }
                                className="w-full h-full object-contain rounded-2xl" 
                                title="resume"
                            />
                        </a>
                    </div>
                )}
            </section>

            {/* Section for feedback */}
            <section className="feedback-section">
                <h2 className="text-4xl text-black! font-bold">Resume Review</h2>
                { feedback ? (
                    <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                        <Summary feedback={ feedback } />
                        <ATS 
                            score={ feedback.ATS.score || 0 } 
                            suggestions={ feedback.ATS.tips || [] } 
                        />
                        <Details feedback={ feedback } />
                    </div>
                ): (
                    <img src="/images/resume-scan-2.gif" className="w-full" />
                )}
            </section>
        </div>
    </main>
  )
}

export default resume