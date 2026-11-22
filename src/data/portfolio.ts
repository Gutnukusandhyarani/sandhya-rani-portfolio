/**
 * Edit this file to personalise the portfolio.
 * Keep claims, experience dates, credentials and metrics tied to evidence you can show.
 */
export const profile = {
  name: 'Sandhyarani Guntuku',
  first: 'Sandhyarani',
  initial: 'S',
  email: 'sandhyaraniguntuku15@gmail.com',
  location: 'Hyderabad, Telangana, India',
  timezone: 'Asia/Kolkata',
  links: {
    linkedin: 'https://www.linkedin.com/in/sandhya-rani-g-859b4a22b',
    github: 'https://github.com/Gutnukusandhyarani',
  },
  resume: './resume.pdf',
  roles: ['IT & Technical Support', 'Cloud & Infrastructure', 'Security Operations'],
  availability: 'Open to IT, Cloud & Security opportunities',
  interests: ['Security Monitoring', 'Detection Engineering', 'Application Security'],
};

export const stats = [
  { value: 12, decimals: 0, suffix: '/12', label: 'SentinelOps unit tests passing' },
  { value: 11, decimals: 0, suffix: '/11', label: 'SigmaForge unit tests passing' },
  { value: 6, decimals: 0, suffix: '/6', label: 'Included detection rules validated' },
  { value: 8, decimals: 0, suffix: '/8', label: 'Detection regression cases passing' },
];

export type SkillCategory = { id: string; index: string; title: string; blurb: string; skills: string[] };

export const skillCategories: SkillCategory[] = [
  {
    id: 'monitoring',
    index: '01',
    title: 'Endpoint monitoring',
    blurb: 'Collecting endpoint telemetry, preserving evidence and turning raw events into a consistent investigation view.',
    skills: ['Python', 'Linux auth logs', 'Windows Event Logs', 'JSONL', 'Event normalization', 'SQLite', 'File Integrity Monitoring'],
  },
  {
    id: 'detection',
    index: '02',
    title: 'Detection engineering',
    blurb: 'Building detections as code: rules that can be reviewed, validated, regression-tested and translated for different SIEMs.',
    skills: ['YAML', 'Sigma-like rules', 'MITRE ATT&CK', 'Splunk SPL', 'Microsoft Sentinel KQL', 'Elastic queries', 'Regression testing'],
  },
  {
    id: 'automation',
    index: '03',
    title: 'Security automation',
    blurb: 'Small, auditable automation for repeatable defensive workflows and asset visibility.',
    skills: ['Python CLI', 'PowerShell', 'SHA-256', 'CycloneDX SBOM', 'pip-audit', 'GitHub Actions', 'REST APIs'],
  },
  {
    id: 'appsec',
    index: '04',
    title: 'Application & platform security',
    blurb: 'Areas of continued focus alongside hands-on monitoring and detection work.',
    skills: ['API Security', 'OAuth 2.0', 'JWT', 'CI/CD Security', 'Docker', 'Linux', 'Windows'],
  },
];

export const fundamentals = ['Collect', 'Normalize', 'Detect', 'Validate', 'Investigate'];

export type Metric = { value: string; label: string };
export type Project = {
  id: string;
  index: string;
  title: string;
  year: string;
  kind: string;
  summary: string;
  stack: string[];
  contribution: string[];
  features: string[];
  metrics: Metric[];
  github?: string;
  live?: string;
  localDashboard?: string;
  dashboardPort?: string;
  runCommand?: string;
  collectorCommand?: string;
  motif: 'scan' | 'flow' | 'tenants';
};

export const projects: Project[] = [
  {
    id: 'sentinelops',
    index: '01',
    title: 'SentinelOps',
    year: '2026',
    kind: 'Endpoint Monitoring · SIEM Lab',
    summary: 'A local-first endpoint monitoring and SIEM lab that ingests Linux authentication logs, Windows Event Log exports and JSONL events, normalizes them, runs detections and presents alerts for analyst triage.',
    stack: ['Python', 'SQLite', 'Linux', 'Windows Event Logs', 'PowerShell', 'HTML', 'JavaScript'],
    contribution: [
      'Implemented collectors and parsers for Linux auth logs, Windows event exports and generic JSONL, preserving raw evidence in a common event schema.',
      'Built detection logic, alert storage and manual triage workflows, plus SHA-256 file-integrity checks, read-only posture checks, CycloneDX software inventory and optional pip-audit integration.',
      'Added interoperability with SigmaForge through an importable SentinelOps rule-pack format. The dashboard binds to localhost by default and the Windows collection scripts are read-only.',
    ],
    features: [
      'Linux auth.log / secure, Windows Event Log export and JSONL ingestion',
      'Normalized event model with host, source, category, action, outcome and evidence',
      'Built-in detections for repeated SSH failures and selected Windows security events',
      'SQLite-backed alerts, analyst status and investigation notes',
      'SHA-256 file-integrity baselines and read-only posture checks',
      'CycloneDX 1.5 SBOM and optional pip-audit workflow',
    ],
    metrics: [
      { value: '12/12', label: 'Unit tests passing' },
      { value: '6', label: 'Events in the integration smoke test' },
      { value: '4', label: 'Alerts generated in that test' },
      { value: '0', label: 'Ingestion errors in that test' },
    ],
    github: 'https://github.com/Gutnukusandhyarani/SentinelOps',
    live: '',
    localDashboard: 'http://127.0.0.1:8787',
    dashboardPort: '8787',
    runCommand: 'python -m sentinelops serve',
    collectorCommand: 'python -m sentinelops monitor --file /var/log/auth.log --type ssh',
    motif: 'scan',
  },
  {
    id: 'sigmaforge',
    index: '02',
    title: 'SigmaForge',
    year: '2026',
    kind: 'Detection-as-Code · Rule Engineering',
    summary: 'A detection-engineering workbench for validating YAML rules, evaluating supported conditions against event fixtures, running regression tests and compiling queries for common SIEM backends.',
    stack: ['Python', 'YAML', 'MITRE ATT&CK', 'Splunk SPL', 'Sentinel KQL', 'Elastic'],
    contribution: [
      'Implemented YAML parsing, required-field and UUID checks, selector/condition validation, duplicate-ID detection and rule-quality warnings.',
      'Added event matching and labelled positive/negative regression cases so detections can be tested before use.',
      'Built query exporters for Splunk SPL, Microsoft Sentinel KQL and Elastic, plus ATT&CK coverage reporting and a SentinelOps-compatible export.',
    ],
    features: [
      'Sigma-like YAML rule authoring and validation',
      'Condition parsing with and/or/not, parentheses, 1 of and all of',
      'Field matching for exact, contains, startswith, endswith, regex and existence checks',
      'Positive and negative event regression testing',
      'ATT&CK technique tagging and coverage reporting',
      'Splunk, Sentinel and Elastic query generation with custom field maps',
      'SentinelOps rule-pack export for end-to-end integration',
    ],
    metrics: [
      { value: '11/11', label: 'Unit tests passing' },
      { value: '6/6', label: 'Included rules validated' },
      { value: '8/8', label: 'Regression cases passing' },
      { value: '3', label: 'SIEM query targets' },
    ],
    github: 'https://github.com/Gutnukusandhyarani/SigmaForge',
    live: '',
    localDashboard: 'http://127.0.0.1:8788',
    dashboardPort: '8788',
    runCommand: 'python -m sigmaforge serve',
    collectorCommand: '',
    motif: 'flow',
  },
];

export const workflow = [
  {
    index: '01',
    title: 'Collect telemetry',
    detail: 'Read endpoint logs and structured event exports from systems you own or are authorized to monitor.',
    tool: 'SentinelOps · collectors',
  },
  {
    index: '02',
    title: 'Normalize evidence',
    detail: 'Map different event sources into a common schema while preserving the original record for investigation.',
    tool: 'SentinelOps · event model',
  },
  {
    index: '03',
    title: 'Engineer detections',
    detail: 'Create YAML rules, validate conditions, attach ATT&CK tags and check rule quality.',
    tool: 'SigmaForge · rule engine',
  },
  {
    index: '04',
    title: 'Test and investigate',
    detail: 'Run regression fixtures, export supported rules, import them into SentinelOps and review generated alerts.',
    tool: 'Both projects · integration',
  },
];

export const focusAreas = [
  { title: 'Blue team operations', detail: 'Endpoint telemetry, alert triage, log analysis and investigation evidence.' },
  { title: 'Detection engineering', detail: 'Rule authoring, false-positive awareness, regression testing and ATT&CK mapping.' },
  { title: 'Application security', detail: 'API security, authentication flows, secure development and CI/CD security.' },
];

export const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'expertise', label: 'Expertise' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Workflow' },
  { id: 'contact', label: 'Contact' },
];

/** Which projects use a given skill — used by the Expertise section. */
export function projectsUsing(skill: string): string[] {
  const s = skill.toLowerCase().replace(/\.js$/, '');
  return projects
    .filter((p) => p.stack.some((t) => t.toLowerCase().replace(/\.js$/, '') === s || (s === 'sentinel kql' && t === 'Sentinel KQL')))
    .map((p) => p.title);
}
