
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabaseClient';

const USE_MOCK_SESSION = true;

interface CompletedProject {
  id: number;
  title: string;
  description: string;
  expertiseLevel: string;
  completed_at: string; // ISO date
  visibility: 'public' | 'private';
}

const mockProjects: CompletedProject[] = [
  {
    id: 101,
    title: 'Local SEO Revamp',
    description: 'Improved local rankings for restaurant chain.',
    expertiseLevel: 'Pro Talent',
    completed_at: '2025-05-01',
    visibility: 'public',
  },
  {
    id: 102,
    title: 'Email Campaign Setup',
    description: 'Klaviyo automation for ecommerce store.',
    expertiseLevel: 'Pro Talent',
    completed_at: '2025-04-22',
    visibility: 'private',
  },
  {
    id: 103,
    title: 'Site Audit for Speed',
    description: 'Audited and optimized load time for WordPress site.',
    expertiseLevel: 'Expert',
    completed_at: '2025-03-15',
    visibility: 'public',
  },
];

export function CompletedProjectsList({ userId }: { userId: string }) {
  const [projects, setProjects] = useState<CompletedProject[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchCompleted() {
      if (USE_MOCK_SESSION) {
        setProjects(mockProjects);
        return;
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'completed')
        .eq('talent_id', userId);

      if (!error && data) setProjects(data);
    }

    fetchCompleted();
  }, [userId]);

  if (!projects.length) {
    return (
      <div className="border p-4 text-muted-foreground rounded-md">
        No projects found in this section.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Card
          key={project.id}
          className={`border ${project.id === expandedId ? "border-[#2E3A8C] border-2" : "border-gray-200"} hover:shadow-md transition cursor-pointer`}
          onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{project.title}</h3>
                <p className="text-sm text-muted-foreground">{project.description}</p>
                <p className="text-xs text-gray-500">
                  Completed on {format(new Date(project.completed_at), 'PPP')}
                </p>
                {project.visibility === 'private' && (
                  <span className="text-xs text-orange-500">🔒 Private</span>
                )}
              </div>
              <Badge variant="outline">{project.expertiseLevel}</Badge>
            </div>

            {expandedId === project.id && (
              <div className="mt-4 border-t pt-4 space-y-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    const updated = projects.map(p =>
                      p.id === project.id
                        ? { ...p, visibility: p.visibility === 'public' ? 'private' : 'public' }
                        : p
                    );
                    setProjects(updated);
                  }}
                >
                  {project.visibility === 'public' ? 'Make Private' : 'Make Public'}
                </Button>
                <p className="text-sm text-muted-foreground">You can add project outcomes, deliverables, and links here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}