import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Plus, Briefcase, CheckCircle, Clock } from 'lucide-react';

export default function ClientDashboard() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Mock projects with proper status values
    setProjects([
      {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        title: 'Launch Social Ad Campaign',
        status: 'draft',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        bids: 3,
      },
      {
        id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        title: 'Content Strategy for New Product',
        status: 'picked_up',
        deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        bids: 5,
      }
    ]);
  }, []);

  const formatDate = (iso) => new Date(iso).toLocaleDateString();

  const getProjectUrl = (project) => {
    const workspacePhases = ['picked_up', 'submitted', 'revisions', 'approved', 'completed'];
    return workspacePhases.includes(project.status)
      ? `/client/projects/${project.id}/workspace`
      : `/client/projects/${project.id}`;
  };

  const getButtonText = (status) => {
    const workspacePhases = ['picked_up', 'submitted', 'revisions', 'approved', 'completed'];
    return workspacePhases.includes(status) ? 'View Workspace' : 'View Details';
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      draft: 'Draft',
      live: 'Live',
      picked_up: 'Picked Up',
      submitted: 'Submitted',
      revisions: 'Revisions',
      approved: 'Approved',
      completed: 'Completed'
    };
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusIcon = (status) => {
    const isActive = ['live', 'picked_up', 'submitted', 'revisions'].includes(status);
    const isComplete = ['approved', 'completed'].includes(status);

    if (isComplete) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    } else if (isActive) {
      return <Clock className="w-4 h-4 text-yellow-600" />;
    } else {
      return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-brand-neutral">Client Dashboard</h1>
        <Button onClick={() => navigate('/upload')} className="bg-[#00D1C1] text-white hover:bg-[#00b4ab]">
          <Plus className="mr-2 w-4 h-4" /> Post New Project
        </Button>
      </div>

      <div className="grid gap-4">
        {projects.map((proj) => (
          <div key={proj.id} className="border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">{proj.title}</h2>
                <p className="text-sm text-gray-500">Deadline: {formatDate(proj.deadline)}</p>
              </div>
              <Button 
                onClick={() => navigate(getProjectUrl(proj))}
                className="bg-[#2E3A8C] text-white hover:bg-[#2E3A8C]/90"
              >
                {getButtonText(proj.status)}
              </Button>
            </div>
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" /> {proj.bids} Bids
              </div>
              <div className="flex items-center gap-1">
                {getStatusIcon(proj.status)}
                {getStatusDisplay(proj.status)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}