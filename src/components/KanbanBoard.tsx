import React from 'react';
import { Clock, CheckCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface TimeEntry {
  startTime: Date;
  endTime?: Date;
  hoursLogged?: number;
}

interface Deliverable {
  id: string;
  title: string;
  description: string;
  status: 'recommended' | 'scoped' | 'in_progress' | 'approved' | 'completed';
  estimatedHours: number;
  actualHours: number;
  timeEntries: TimeEntry[];
  dueDate?: Date;
  submittedFiles?: Array<{
    id: string;
    name: string;
    url: string;
  }>;
  isTracking?: boolean;
  currentSession?: {
    startTime: Date;
  };
}

interface KanbanBoardProps {
  deliverables: Deliverable[];
  projectStartDate: Date;
  projectDeadline: Date;
  onDeliverableMove?: (event: any) => void;
  onStatusChange?: (id: string, newStatus: Deliverable['status']) => void;
  onTrackingStart?: (id: string) => void;
  onTrackingStop?: (id: string, hoursLogged: number) => void;
}

const columns: Deliverable['status'][] = [
  'recommended',
  'scoped',
  'in_progress',
  'approved',
  'completed',
];

const columnTitles = {
  recommended: 'Recommended',
  scoped: 'Scoped',
  in_progress: 'In Progress',
  approved: 'Approved',
  completed: 'Completed'
};

const columnColors = {
  recommended: 'bg-purple-50/50 border-purple-200',
  scoped: 'bg-blue-50/50 border-blue-200',
  in_progress: 'bg-yellow-50/50 border-yellow-200',
  approved: 'bg-green-50/50 border-green-200',
  completed: 'bg-gray-50/50 border-gray-200'
};

export default function KanbanBoard({
  deliverables,
  projectStartDate,
  projectDeadline,
  onStatusChange,
  onTrackingStart,
  onTrackingStop,
}: KanbanBoardProps) {
  const getDeliverablesByStatus = (status: Deliverable['status']) => 
    deliverables.filter(d => d.status === status);

  const getRemainingHours = (deliverable: Deliverable) => {
    return Math.max(0, deliverable.estimatedHours - deliverable.actualHours);
  };

  const getProgressColor = (deliverable: Deliverable) => {
    const progress = (deliverable.actualHours / deliverable.estimatedHours) * 100;
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex w-max gap-6 min-h-[600px]">
        {columns.map((status) => (
          <div 
            key={status}
            className={`w-[300px] shrink-0 rounded-lg border ${columnColors[status]} flex flex-col`}
          >
            <div className="px-4 py-3 border-b border-inherit">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">
                  {columnTitles[status]}
                </h3>
                <Badge 
                  variant="outline"
                  className="ml-2 bg-white/50 text-gray-600 border-gray-200"
                >
                  {getDeliverablesByStatus(status).length}
                </Badge>
              </div>
            </div>

            <div className="p-3 space-y-3 flex-1 overflow-y-auto">
              {getDeliverablesByStatus(status).map((deliverable) => (
                <div
                  key={deliverable.id}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group"
                  onClick={() => onStatusChange?.(deliverable.id, status)}
                >
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <h4 className="font-medium text-gray-900 line-clamp-1 group-hover:text-[#2E3A8C] transition-colors">
                      {deliverable.title}
                    </h4>
                    {deliverable.isTracking && (
                      <Badge variant="secondary" className="animate-pulse bg-yellow-100 text-yellow-700 shrink-0">
                        <Clock className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {deliverable.description}
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium text-gray-700">
                        {deliverable.actualHours}/{deliverable.estimatedHours}h
                      </span>
                    </div>

                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getProgressColor(deliverable)} transition-all`}
                        style={{ 
                          width: `${Math.min(100, (deliverable.actualHours / deliverable.estimatedHours) * 100)}%` 
                        }}
                      />
                    </div>

                    {status === 'in_progress' && (
                      <div className="flex items-center gap-1.5 text-sm text-yellow-700 font-medium bg-yellow-50 px-2 py-1 rounded">
                        <Clock className="w-3.5 h-3.5" />
                        {getRemainingHours(deliverable)}h remaining
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                      {deliverable.submittedFiles && deliverable.submittedFiles.length > 0 && (
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
                          <FileText className="w-3.5 h-3.5" />
                          {deliverable.submittedFiles.length} files
                        </div>
                      )}
                      {deliverable.dueDate && (
                        <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
                          <Clock className="w-3.5 h-3.5" />
                          Due {format(deliverable.dueDate, 'MMM d')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
