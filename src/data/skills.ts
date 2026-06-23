import type { TechStack, Skill } from './schema'

/**
 * Tech stack (two marquee rows) and professional skillsets.
 * Edit THIS file to add/update a tool or skill. Validated at load time
 * (see ./index.ts). `icon` is an asset key resolved via getIcon()/getSkill().
 */
export const techStackData: TechStack = {
  row1: [
    { name: 'JavaScript', icon: 'javascript' },
    { name: 'Dart', icon: 'dart' },
    { name: 'Discord', icon: 'discord' },
    { name: 'Django', icon: 'django' },
    { name: 'Docker', icon: 'docker' },
    { name: 'Figma', icon: 'figma' },
    { name: 'Flutter', icon: 'flutter' },
    { name: 'Gemini', icon: 'gemini' },
    { name: 'GitHub', icon: 'github' },
    { name: 'GPT', icon: 'gpt' },
    { name: 'Postman', icon: 'postman' },
  ],
  row2: [
    { name: 'IntelliJ', icon: 'ij' },
    { name: 'Java', icon: 'java' },
    { name: 'Python', icon: 'python' },
    { name: 'React', icon: 'react' },
    { name: 'Selenium', icon: 'selenium' },
    { name: 'Spring Boot', icon: 'springboot' },
    { name: 'Tailwind', icon: 'tailwind' },
    { name: 'Ubuntu', icon: 'ubuntu' },
    { name: 'VS Code', icon: 'vsc' },
    { name: 'WordPress', icon: 'wordpress' },
    { name: 'Node.js', icon: 'nodejs' },
  ],
}

export const skillsData: Skill[] = [
  { name: 'Frontend Development', icon: 'frontend' },
  { name: 'Backend Development', icon: 'backend' },
  { name: 'Database Management', icon: 'database' },
  { name: 'Mobile Development', icon: 'mobile' },
  { name: 'UI/UX Design', icon: 'design' },
  { name: 'DevOps', icon: 'devops' },
  { name: 'Project Management', icon: 'management' },
  { name: 'AI & Machine Learning', icon: 'ai' },
]
