import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UploadCloud, CalendarIcon, SendIcon, CreditCard, CheckCircle, Edit2, Clock } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface Deliverable {
  id: string;
  title: string;
  description: string;
  status: 'recommended' | 'accepted' | 'completed';
  estimatedHours: number;
  dueDate?: Date;
}

export default function ClientProjectWorkspace() {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [deliverables, setDeliverables] = useState<Deliverable[]>([
    {
      id: '1',
      title: 'Technical SEO Audit',
      description: 'Complete site crawl and technical analysis report',
      status: 'recommended',
      estimatedHours: 8,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      title: 'Keyword Research',
      description: 'Comprehensive keyword analysis and mapping',
      status: 'accepted',
      estimatedHours: 6,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    }
  ]);
  const [activityLog, setActivityLog] = useState<string[]>([]);
  const [projectName] = useState("SEO Optimization");
  const [companyName] = useState("Acme Corp");
  const [projectDeadline] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));

  const handleAcceptDeliverable = (id: string) => {
    setDeliverables(deliverables.map(d => 
      d.id === id ? { ...d, status: 'accepted' } : d
    ));
    setActivityLog([...activityLog, `Deliverable accepted: ${deliverables.find(d => d.id === id)?.title}`]);
  };

  const handleCompleteDeliverable = (id: string) => {
    setDeliverables(deliverables.map(d => 
      d.id === id ? { ...d, status: 'completed' } : d
    ));
    setActivityLog([...activityLog, `Deliverable completed: ${deliverables.find(d => d.id === id)?.title}`]);
  };

  const getDeliverablesByStatus = (status: 'recommended' | 'accepted' | 'completed') => {
    return deliverables.filter(d => d.status === status);
  };

  return (
    <div className="min-h-screen bg-[#F0F4FF]">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#2E3A8C]">{projectName} • {companyName}</h1>
        </div>

        {/* Deadline Display */}
        <div className="bg-white border border-[#E6E9F4] rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#2E3A8C]" />
            <span className="font-medium">Project Deadline:</span>
            <span>{format(projectDeadline, 'PPP')}</span>
          </div>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
            Due {formatDistanceToNow(projectDeadline, { addSuffix: true })}
          </Badge>
        </div>

        <Tabs defaultValue="deliverables" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white mb-6 rounded-lg border border-[#E6E9F4]">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="deliverables">
            <div className="grid grid-cols-3 gap-6">
              {/* Recommended Column */}
              <div className="bg-white border border-[#E6E9F4] rounded-lg p-4">
                <h3 className="text-lg font-semibold text-[#2E3A8C] mb-4 flex items-center">
                  <Badge variant="outline" className="mr-2">
                    {getDeliverablesByStatus('recommended').length}
                  </Badge>
                  Recommended
                </h3>
                <div className="space-y-4">
                  {getDeliverablesByStatus('recommended').map(deliverable => (
                    <div key={deliverable.id} className="border border-[#E6E9F4] rounded-lg p-4 bg-gray-50">
                      <h4 className="font-medium mb-2">{deliverable.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{deliverable.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>{deliverable.estimatedHours}h estimated</span>
                        {deliverable.dueDate && (
                          <span>Due {formatDistanceToNow(deliverable.dueDate, { addSuffix: true })}</span>
                        )}
                      </div>
                      <Button
                        onClick={() => handleAcceptDeliverable(deliverable.id)}
                        className="w-full bg-[#2E3A8C]"
                      >
                        Accept Deliverable
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accepted Column */}
              <div className="bg-white border border-[#E6E9F4] rounded-lg p-4">
                <h3 className="text-lg font-semibold text-[#2E3A8C] mb-4 flex items-center">
                  <Badge variant="outline" className="mr-2">
                    {getDeliverablesByStatus('accepted').length}
                  </Badge>
                  Accepted
                </h3>
                <div className="space-y-4">
                  {getDeliverablesByStatus('accepted').map(deliverable => (
                    <div key={deliverable.id} className="border border-[#E6E9F4] rounded-lg p-4 bg-gray-50">
                      <h4 className="font-medium mb-2">{deliverable.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{deliverable.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>{deliverable.estimatedHours}h estimated</span>
                        {deliverable.dueDate && (
                          <span>Due {formatDistanceToNow(deliverable.dueDate, { addSuffix: true })}</span>
                        )}
                      </div>
                      <Button
                        onClick={() => handleCompleteDeliverable(deliverable.id)}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        Mark as Complete
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Completed Column */}
              <div className="bg-white border border-[#E6E9F4] rounded-lg p-4">
                <h3 className="text-lg font-semibold text-[#2E3A8C] mb-4 flex items-center">
                  <Badge variant="outline" className="mr-2">
                    {getDeliverablesByStatus('completed').length}
                  </Badge>
                  Completed
                </h3>
                <div className="space-y-4">
                  {getDeliverablesByStatus('completed').map(deliverable => (
                    <div key={deliverable.id} className="border border-[#E6E9F4] rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{deliverable.title}</h4>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{deliverable.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{deliverable.estimatedHours}h estimated</span>
                        {deliverable.dueDate && (
                          <span>Completed {formatDistanceToNow(deliverable.dueDate, { addSuffix: true })}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Other tabs remain unchanged */}
        </Tabs>
      </div>
    </div>
  );
}