// src/data/mockDeliverables.ts

const mockDeliverables = [
  {
    id: '1',
    title: 'Content Strategy Development',
    description: 'Create comprehensive content calendar and distribution plan',
    status: 'scoped',
    estimatedHours: 8,
    actualHours: 3.5,
    timeEntries: [
      {
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endTime: new Date(),
        hoursLogged: 3.5
      }
    ],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    title: 'Technical SEO Audit',
    description: 'Complete site crawl and performance optimization recommendations',
    status: 'in_progress',
    estimatedHours: 8,
    actualHours: 5.5,
    timeEntries: [
      {
        startTime: new Date(Date.now() - 48 * 60 * 60 * 1000),
        endTime: new Date(),
        hoursLogged: 5.5
      }
    ],
    isTracking: true,
    currentSession: {
      startTime: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
    },
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    title: 'Social Media Campaign Setup',
    description: 'Design and schedule Q3 social media content across platforms',
    status: 'recommended',
    estimatedHours: 8,
    actualHours: 0,
    timeEntries: [],
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
  },
  {
    id: '4',
    title: 'Analytics Dashboard Creation',
    description: 'Build custom Google Analytics 4 dashboard with key metrics',
    status: 'completed',
    estimatedHours: 8,
    actualHours: 7.5,
    timeEntries: [
      {
        startTime: new Date(Date.now() - 72 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 48 * 60 * 60 * 1000),
        hoursLogged: 7.5
      }
    ],
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: '5',
    title: 'Email Marketing Automation',
    description: 'Set up triggered email sequences and A/B testing framework',
    status: 'approved',
    estimatedHours: 8,
    actualHours: 6.5,
    timeEntries: [
      {
        startTime: new Date(Date.now() - 96 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 72 * 60 * 60 * 1000),
        hoursLogged: 6.5
      }
    ],
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    submittedFiles: [
      {
        id: 'file1',
        name: 'Email_Automation_Flow.pdf',
        url: 'https://example.com/files/email-flow.pdf'
      }
    ]
  }
];

export default mockDeliverables;
