import { JobFlow } from "@/components/job-flow";

export default function NewJobPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Add Job</h1>
        <p className="text-muted-foreground mt-1">
          Paste a job URL to scrape, edit, generate content, and post — all in one flow.
        </p>
      </div>
      <JobFlow />
    </div>
  );
}
