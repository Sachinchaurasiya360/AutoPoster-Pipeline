import { JobUrlForm } from "@/components/job-url-form";

export default function NewJobPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Job</h1>
        <p className="text-muted-foreground mt-1">
          Paste a job URL to scrape and extract details automatically
        </p>
      </div>
      <JobUrlForm />
    </div>
  );
}
