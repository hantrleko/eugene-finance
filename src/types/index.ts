export type DomainId = 
  | '01-macro' 
  | '02-company' 
  | '03-strategy' 
  | '04-micro' 
  | '05-academic' 
  | '06-explore';

export type TargetGoal = 'academic' | 'company' | 'investment';

export type Stage = 'existing' | 'prototype' | 'planned';

export type AccessMode = 'web' | 'local' | 'private' | 'planned';

export type HostingType = 'static' | 'container' | 'local' | 'planned';

export interface DomainInfo {
  id: DomainId;
  number: string;
  name: string;
  enName: string;
  question: string;
  description: string;
  representativeProjects: string[];
}

export interface QueryProtocol {
  tickerParam?: string; // e.g. "ticker"
  dateParam?: string;   // e.g. "as_of"
  macroParam?: string;  // e.g. "series"
  pairParam?: string;   // e.g. "pair"
  defaultExample?: string;
  description?: string;
}

export interface PrototypeInfo {
  type: 'notebook' | 'doc' | 'model';
  label: string;
  url?: string;
  description: string;
  snippet?: string;
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
  hostingType?: HostingType;
  officialUrl?: string;
  repoUrl?: string;
  isRepoPrivate?: boolean;
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
  prototypeInfo?: PrototypeInfo;
  queryProtocol?: QueryProtocol;
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

export interface ResearchNote {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  author: string;
  playbookId: string;
  playbookLetter: string;
  playbookTitle: string;
  domainId: DomainId;
  domainName: string;
  associatedProjectIds: string[];
  targetGoal: TargetGoal;
  tags: string[];
  summary: string;
  keyFindings: string[];
  metrics?: { label: string; value: string; hint?: string }[];
  contentMarkdown: string;
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

export type ActiveTab = 'workbench' | 'catalog' | 'notes' | 'exploration';
