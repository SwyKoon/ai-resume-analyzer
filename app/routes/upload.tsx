import { useState } from 'react'
import { useNavigate } from 'react-router';

import Navbar from '~/components/Navbar'
import FileUploader from '~/components/FileUploader';

import { usePuterStore } from '~/lib/puter';
import { convertPdfToImage } from '~/lib/pdf2img';
import { generateUUID } from '~/lib/utils';

import { prepareInstructions } from '../../constants';

const upload = () => {
    // To know whether we are processing the upload or not, we use useState
    const [isProcessing, setIsProcessing] = useState(false);
    // Status Text to load when uploading file
    const [statusText, setStatusText] = useState('');
    // file stores the currently selected file.
    // null is used when no file is selected or upload fails.
    const [file, setFile] = useState<File | null>(null);

    // Puter store functionalities in these objects
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    // To navigate to other pages from here
    const navigate = useNavigate();

    // Accepts file or type null
    const handleFileSelect = (file: File | null) => {
        // set file to the file we drag and drop else set null
        setFile(file);
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget.closest('form');
        if(!form) return;
        const formData = new FormData(form);

        // Extarct imp. details from form data and cast them as string so we do not face any
        // errors when we send them to handleAnalyze.
        // Otherwise we get error that FormEntryValue, which is default type of these values
        // here with formData.get, cannot be converted to string in handleAnalyze.
        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if(!file) return;
        
        // If file exists, then we send it to a special function we crated called 
        // handleAnalyze which will accept an object
        handleAnalyze({
            companyName,
            jobTitle,
            jobDescription,
            file
        })
    }

    const handleAnalyze = async ({companyName, jobTitle, jobDescription, file}: {
        companyName: string,
        jobTitle: string,
        jobDescription: string,
        file: File
    }) => {
        setIsProcessing(true);
        setStatusText('Uploading file...');
        // Passing only 1 file in array cause File array is what upload accepts
        const uploadedFile = await fs.upload([file]);
        if(!uploadedFile) return setStatusText("Error: Failed to upload file");

        setStatusText('Converting Resume to image...');
        const imageFile = await convertPdfToImage(file);

        if(!imageFile.file) return setStatusText("Error: Failed to convert resume to image");

        setStatusText('Uploading Image...');
        const uploadedImage = await fs.upload([imageFile.file]);
        if(!uploadedImage) return setStatusText("Error: Failed to upload image");

        setStatusText('Preparing data...');

        // AI Analysis. First generate a new UUID, then format data to be passed to AI
        const uuid = generateUUID();
        const data = {
            id: uuid,
            resumePath: uploadedFile.path,
            imagePath: uploadedImage.path,
            companyName, jobTitle, jobDescription,
            // We are leaving it empty for now, but will fill it with AI later on
            feedback: ''
        }

        // Use Puter's kv storage to store data
        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        setStatusText('Analyzing Resume...');

        // AI Analysis
        const feedback = await ai.feedback(
            uploadedFile.path, 
            prepareInstructions({ jobTitle, jobDescription })
        );
        
        if(!feedback) return setStatusText("Error: Failed to analyze resume");

        const feedbackText = typeof feedback.message.content === 'string' 
            ? feedback.message.content 
            : feedback.message.content[0].text;

        // Set the feedback in data object and update the AI feedback in kv store
        data.feedback = JSON.parse(feedbackText);
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setStatusText('Analysis complete, redirecting...');
        console.log(data);
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            {/* Hero section */}
            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream Job</h1>
                    {/* This text changes based on processing. So only headings are shown 
                    here. We could have written form here but just for clarity purpose */}
                    { isProcessing ? (
                        <>
                            <h2>{ statusText }</h2>
                            <img src="/images/resume-scan.gif" className="w-full" />
                        </>
                    ) : (
                        <h2>Drop your Resume for ATS score and improvement tips</h2>
                    )}

                    {/* If not processing, then in addition to the h2, about ATS score, we
                    display this form. This form exists only when not processing */}
                    { !isProcessing && (
                        <form id='upload-form' onSubmit={ handleSubmit } 
                        className='flex flex-col gap-4 mt-8'>
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" id='company-name' name='company-name' placeholder="Company Name" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" id='job-title' name='job-title' placeholder="Job Title" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={ 5 } id='job-description' name='job-description' placeholder="Job Description" />
                            </div>

                            <div className="form-div">
                                <label htmlFor="Uploader">Upload Resume</label>
                                <FileUploader file={ file } onFileSelect={ handleFileSelect } />
                            </div>

                            <button className='primary-button' type="submit">
                                Analyze Resume
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    )
}

export default upload