export type DomainId = 
  | '01-macro' 
  | '02-company' 
  | '03-strategy' 
  | '04-micro' 
  | '05-academic' 
  | '06-explore';

export type TargetGoal = 'academic' | 'company' | 'investment';

export type Stage = 'existing' | 'planned';

export type AccessMode = 'web' | 'local' | 'private' | 'planned';

export interface DomainInfo {
  id: DomainId;
  number: string;
  name: string;
  enName: string;
  question: string;
  description: string;
  representativeProjects: string[];
  existingCount: number;
  plannedCount: number;
}

export interface Project {
  id: string;
  name: string;
  enName: string;
  aliases: string[];
  summary: string;
  description: string;
  domainId: DomainId;
  domainNumber: string;
  domainName: string;
  subCategory?: string;
  targetGoals: TargetGoal[];
  methodTags: string[];
  stage: Stage;
  accessMode: AccessMode;
  officialUrl?: string;
  repoUrl?: string;
  localPath?: string;
  verificationStatus: string;
  runCommand?: string;
  inputs: string;
  outputs: string;
  applicableScenes: string;
  techStack: string;
  playbookIds: string[];
  coverImage?: string;
  initialPinned?: boolean;
}

export interface PlaybookStep {
  stepNumber: number;
  title: string;
  purpose: string;
  projectId?: string;
  isExisting: boolean;
  toolName: string;
  actionGuidance: string;
  inputsRequired: string;
  expectedOutput: string;
}

export interface Playbook {
  id: string;
  letter: string;
  title: string;
  enTitle: string;
  subtitle: string;
  finalDeliverable: string;
  deliverableDescription: string;
  steps: PlaybookStep[];
  templateMarkdown: string;
}

export interface MediaItem {
  id: string;
  title: string;
  category: 'podcast' | 'article' | 'video' | 'essay';
  categoryLabel: string;
  date: string;
  summary: string;
  durationOrReadTime: string;
  link?: string;
  highlightTag?: string;
}
