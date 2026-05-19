import { GitHubContributor } from "@/types/github";

export async function getContributors(): Promise<GitHubContributor[]> {
  const headers: Record<string, string> = {};
  
  // Only add auth header if token is configured
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN !== "your_github_token_here") {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(
    "https://api.github.com/repos/Vaibhav-kesarwani/100-reactjs-projects/contributors",
    {
      headers,
      next: { revalidate: 3600 }, // Revalidate every hour
    }
  );

  if (!res.ok) {
    const errorData = await res.text();
    console.error(`GitHub API Error: ${res.status} ${res.statusText}`, errorData);
    throw new Error(`Failed to fetch contributors: ${res.status} ${res.statusText}. Please ensure GITHUB_TOKEN is set in .env.local`);
  }

  const data: GitHubContributor[] = await res.json();
  return data;
}