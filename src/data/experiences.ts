import type { Experiences } from './schema'

/**
 * Work/learning experiences, grouped by year (newest rendered first).
 * Edit THIS file to add/update an experience. Validated at load time against
 * experiencesSchema (see ./index.ts).
 *
 * - id: stable unique id, conventionally "<year>-<month>" (used for selection).
 * - logo: asset key resolved via getIcon().
 */
export const experiencesData: Experiences = {
  '2026': {
    entries: [
      {
        id: '2026-06',
        monthLabel: 'June 2026',
        role: 'Solution Engineer Intern',
        org: 'Interbio',
        date: 'June 2026 - Present',
        description:
          'Building a real-time analytics pipeline: MySQL change data capture through Debezium and Kafka into ClickHouse, surfaced in Grafana.',
        achievements: [
          'Designed and stood up the end-to-end CDC pipeline from MySQL binlog to live Grafana dashboards',
        ],
        logo: 'interbio',
      },
      {
        id: '2026-01',
        monthLabel: 'January 2026',
        role: 'Backend Developer Intern',
        org: 'Systatum',
        date: 'January 2026 - February 2026',
        description:
          'Contributing to backend development using Crystal and Marten Framework, focusing on building scalable and efficient web application.',
        achievements: [
          'Developed and optimized backend services using Crystal programming language',
        ],
        logo: 'systatum',
      },
    ],
  },
  '2025': {
    entries: [
      {
        id: '2025-07',
        monthLabel: 'July 2025',
        role: 'Intern',
        org: 'Kementrans',
        date: 'July 2025 - August 2025',
        description:
          'Collaborated with 2 other interns to build an automated training evaluation system using Google tools and scripting, speeding up admin tasks and certificate delivery.',
        achievements: [
          'Automated certificate design process using programming skills, increasing output efficiency by 4x and eliminating manual formatting',
          'Built automated evaluation system for training, integrating Google Forms, Sheets, Slides, and Autocrat',
          'Used scripting to auto-organize folders, calculate improvement percentages, and send certificates via email. Leading to 75% faster administrative process',
          'Assisted Strategic Planning Training Team with participant registration and session flow',
          'Supported hundreds of employees in training activities',
        ],
        logo: 'kementrans',
      },
      {
        id: '2025-08',
        monthLabel: 'August 2025',
        role: 'Software Engineer Intern',
        org: 'VICII',
        date: 'August 2025 - September 2025',
        description: 'Joined VICII as an intern to contribute to web development.',
        achievements: [
          'Collaborated with cross-functional teams (IT, Design, and Marketing) to deliver high-quality e-commerce website integrating with Shopify',
        ],
        logo: 'vicii',
      },
    ],
  },
  '2024': {
    entries: [
      {
        id: '2024-06',
        monthLabel: 'June 2024',
        role: 'IT Developer Intern',
        org: 'Interbio',
        date: 'June 2024 - August 2024',
        description:
          'Redesigned and relaunched interbio.id on WordPress, modernizing UI and streamlining navigation to elevate user engagement and brand credibility.',
        achievements: [
          'Passed ISO 27001 standards test implementing SSL/TLS best practices',
          'Passed independent penetration test with 0 critical vulnerabilities',
          'Configured modular CMS workflow and trained communications team',
          'Empowered non-technical staff to publish content, resulting in 2x increase in PR efforts',
        ],
        logo: 'interbio',
      },
    ],
  },
  '2023': {
    entries: [
      {
        id: '2023-01',
        monthLabel: '2023',
        role: 'Data Science Mentee',
        org: 'RISTEK UI',
        date: '2023',
        description:
          'Deepened understanding of Data Management for its applications in AI and Machine Learning Development, taught by an industry expert Data Scientist at Tiket.com.',
        achievements: [
          'Gained comprehensive knowledge in data management principles',
          'Learned AI and Machine Learning development applications',
          'Received mentorship from industry expert at Tiket.com',
          'Enhanced technical skills in data science methodologies',
        ],
        logo: 'ristek',
      },
    ],
  },
}
