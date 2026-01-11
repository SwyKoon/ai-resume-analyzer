import { useEffect, useState } from "react";
import { Link } from "react-router"

import ScoreCircle from "./ScoreCircle"

import { usePuterStore } from "~/lib/puter";

// We have to receive props in this manner in TS since TS is type explicit
const ResumeCard = ({resume: { id, companyName, jobTitle, feedback, imagePath }} : {resume: Resume}) => {
  const { fs } = usePuterStore();
  const [resumeUrl, setResumeUrl] = useState('');

  // To fetch real data rather than the dummy we are fetching
  useEffect(() => {
    const loadResume = async () => {
      // Trying to read path of the image of resume and use its url
      const blob = await fs.read(imagePath);
      if(!blob) return;
      let url = URL.createObjectURL(blob);
      setResumeUrl(url);
    }

    loadResume();
  }, [imagePath]);

  return (
    <Link to={ `/resume/${id}` } className="resume-card animate-in fade-in duration-1000">

      {/* Resume card Header */}
      <div className="resume-card-header">
        <div className="flex flex-col gap-2">
          { companyName && <h2 className="text-black! font-bold wrap-break-word">{ companyName }</h2> }
          { jobTitle && <h3 className="text-lg wrap-break-word text-gray-500">{ jobTitle }</h3> }

          {/* If both company name and job title are absent, then only show resume */}
          { !companyName && !jobTitle && <h2 className="text-black! font-bold">Resume</h2> }
        </div>

        {/* Score SVG Logic */}
        <div className="shrink-0">
          <ScoreCircle score={ feedback.overallScore } />
        </div>
      </div>

      {/* Image of resume only if we get the resumeUrl */}
      { resumeUrl && (
        <div className="gradient-border animate-in fade-in duration-1000">
          <div className="w-full h-full">
            <img 
              src={ resumeUrl } 
              alt="resume"
              className="w-full h-87.5 max-sm:h-50 object-cover object-top" 
            />
          </div>
        </div>
      )}

    </Link>
  )
}

export default ResumeCard