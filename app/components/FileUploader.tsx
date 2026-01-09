import {useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import { formatSize } from '~/lib/utils';

// Interface for FileUploaderProps
interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
    file: File | null;
}

const FileUploader = ({ onFileSelect, file }: FileUploaderProps) => {
    // We use useCallback to memoize the onDrop function so it does not keep 
    // changing references with every re-render
    const onDrop = useCallback((acceptedFiles : File[]) => {
        // Do something with the files else set null if no file
        const file = acceptedFiles[0] || null; 

        // ?. makes sure that onFileSelect is called only if it exists
        // Calls onFileSelect(file) only if it exists.
        // Prevents runtime errors when parent didn’t pass the prop.
        onFileSelect?.(file);
    }, [onFileSelect]);

    const maxFileSize = 20 * 1024 * 1024;

    const {getRootProps, getInputProps, acceptedFiles} = useDropzone({ 
        onDrop, 
        multiple: false,
        accept: { 'application/pdf': ['.pdf'] },
        maxSize: maxFileSize
    }); 

    return (
        <div className='w-full gradient-border'>
            {/* Logic for drag and drop */}
            <div {...getRootProps()}>
                <input {...getInputProps()} />
                {/* Logic to show how the file looks like when we drag/select it */}
                <div className="space-y-4 cursor-pointer">
                    {/* Logic for if file exists, in which case we display file name and
                    size. Else we display the text to upload file */}
                    { file ? (
                        // By using this stopPrpagation, we stop from uploading another file
                        // and we show the selected file
                        <div className="uploader-selected-file"
                            onClick={ (e) => e.stopPropagation() }>
                            <img src="/images/pdf.png" alt="pdf" className='size-10' />
                            <div className='flex items-center space-x-3'>
                                <div>
                                    <p className="text-sm text-gray-700 font-medium 
                                    truncate max-w-xs">
                                        {  file.name }
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        { formatSize(file.size) }
                                    </p>
                                </div>
                            </div>

                            {/* Button to remove the file. We have to set type button because
                            if we do not do so, then by default button in form submits the 
                            form. The form also will get dubmitted and the onclick we give
                            also gets executed. Submitting for is default browser beahviour */}
                            <button type='button' className='p-2 cursor-pointer' 
                            onClick={ (e) => { 
                                e.stopPropagation();
                                onFileSelect?.(null);
                            }}> 
                                <img src="/icons/cross.svg" alt="remove" className='w-4 h-4' />
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="mx-auto w-16 h-16 flex items-center 
                            justify-center mb-2">
                                <img src="/icons/info.svg" alt="upload" className='size-20' />
                            </div>
                            <p className="text-lg text-gray-500">
                                <span className="font-semibold">
                                    Click here to upload
                                </span> or drag and drop
                            </p>
                            <p className="text-lg text-gray-500">
                                PDF (max { formatSize(maxFileSize) })
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default FileUploader