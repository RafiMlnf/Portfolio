import { getGitHubProjects } from "@/lib/github";
import ProjectsClient from "./ProjectsClient";

export default async function Projects() {
  const projects = await getGitHubProjects();
  return <ProjectsClient initialProjects={projects} />;
}
