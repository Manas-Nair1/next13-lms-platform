// @ts-nocheck
"use client";

import toast from "react-hot-toast";

import { UploadDropzone } from "@/lib/uploadthing";
import { ourFileRouter } from "@/app/api/uploadthing/core";

interface FileUploadProps {
  onChange: (url?: string, filename?: string) => void; // Update onChange to accept filename
  endpoint: keyof typeof ourFileRouter;
};

export const FileUpload = ({
  onChange,
  endpoint
}: FileUploadProps) => {
  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        // Log the entire response to inspect its structure
        console.log("Upload Response:", res);
        
        // Check if the response contains any uploaded files
        if (res && res.length > 0) {
          // Extract the file name based on the actual structure of res
          const uploadedFile = res[0]; // Assuming res is an array and we want the first uploaded file

          // If there's a name property or similar in the response
          const fileName = uploadedFile.name || uploadedFile.fileName || uploadedFile.originalFilename; // Adjust based on actual property names
          
          // Log the uploaded file name
          console.log("Uploaded File Name:", fileName);

          // Call onChange with the URL of the uploaded file and the filename
          onChange(uploadedFile.url, fileName);
        } else {
          console.log("No files uploaded or response is empty.");
        }
      }}
      onUploadError={(error: Error) => {
        toast.error(`${error?.message}`);
      }}
    />
  );
}