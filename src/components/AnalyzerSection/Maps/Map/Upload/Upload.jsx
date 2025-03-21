import { sendDemoToAnalyzer } from "@/api/api";
import { cn } from "@/lib/utils";
import { useState } from "react";

const Upload = ({ matchId, demoURL, name, setIsUploaded, setAnalyzerId }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleClick = async () => {
    if (isUploading) return;

    setIsUploading(true);
    try {
      const response = await sendDemoToAnalyzer(matchId, demoURL);
      setIsUploaded(true);
      setAnalyzerId(response.demo_id);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className={cn(
        "flex min-w-[220px] select-none items-center justify-center gap-2 rounded border border-solid border-neutral-700 bg-neutral-950 p-2 text-white transition-colors",
        !isUploading && "cursor-pointer",
      )}
      onClick={!isUploading ? handleClick : undefined}
      role="button"
      tabIndex={isUploading ? -1 : 0}
      aria-label={`Upload ${name} to CSAnalyzer.gg`}
      aria-disabled={isUploading}
    >
      {isUploading ? (
        <>
          <span className="size-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
          <span>Uploading...</span>
        </>
      ) : (
        `Upload ${name} to CSAnalyzer.gg`
      )}
    </div>
  );
};

export default Upload;
