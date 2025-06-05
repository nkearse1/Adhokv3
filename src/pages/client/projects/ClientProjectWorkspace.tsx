import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CalendarIcon, SendIcon, Clock, CheckCircle, Plus, FileText, ExternalLink, User } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import KanbanBoard from '@/components/KanbanBoard';
import { toast } from 'sonner';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

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

interface PaymentMilestone {
  id: string;
  amount: number;
  status: 'pending' | 'paid';
  type: 'initial' | 'draft' | 'final';
  dueDate?: Date;
  description?: string;
}

export default function ClientProjectWorkspace() {
  const { id } = useParams();
  const [projectName] = useState("SEO Optimization");
  const [projectDeadline] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
  const [projectStartDate] = useState(new Date());
  const [estimatedHours] = useState(40);
  const [hourlyRate] = useState(75);
  const [estimatedBudget] = useState(estimatedHours * hourlyRate);
  const [projectStatus] = useState("In Progress");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{
    id: string;
    text: string;
    sender: string;
    timestamp: Date;
    read?: boolean;
  }>>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([
    {
      id: '1',
      title: 'Technical SEO Audit',
      description: 'Complete site crawl and technical analysis report',
      status: 'recommended',
      estimatedHours: 8,
      actualHours: 0,
      timeEntries: [],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  ]);
  const [activityLog, setActivityLog] = useState<string[]>(['Project started', 'Initial requirements received']);
  const [paymentMilestones, setPaymentMilestones] = useState<PaymentMilestone[]>([
    {
      id: '1',
      amount: Math.round(estimatedBudget / 3),
      status: 'pending',
      type: 'initial',
      dueDate: new Date(),
      description: 'Initial payment after project pick-up'
    },
    {
      id: '2',
      amount: Math.round(estimatedBudget / 3),
      status: 'pending',
      type: 'draft',
      description: 'Payment upon first draft submission'
    },
    {
      id: '3',
      amount: Math.round(estimatedBudget / 3),
      status: 'pending',
      type: 'final',
      description: 'Final payment after project approval'
    }
  ]);

  const handleDeliverableMove = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(deliverables);
    const [reorderedItem] = items.splice(result.source.index, 1);
    
    let newStatus: 'recommended' | 'scoped' | 'in_progress' | 'approved' | 'completed';
    switch (result.destination.droppableId) {
      case 'Recommended':
        newStatus = 'recommended';
        break;
      case 'Scoped':
        newStatus = 'scoped';
        break;
      case 'In Progress':
        newStatus = 'in_progress';
        break;
      case 'Approved':
        newStatus = 'approved';
        break;
      case 'Completed':
        newStatus = 'completed';
        break;
      default:
        newStatus = 'recommended';
    }

    const updatedItem = { ...reorderedItem, status: newStatus };
    items.splice(result.destination.index, 0, updatedItem);
    setDeliverables(items);
    
    if (newStatus === 'completed') {
      setActivityLog(prev => [...prev, `Completed deliverable: ${updatedItem.title}`]);
      toast.success(`Marked "${updatedItem.title}" as completed`);
    }
  };

  const handleStatusChange = (deliverableId: string, newStatus: string) => {
    setDeliverables(prev => prev.map(d => {
      if (d.id === deliverableId) {
        const updated = { ...d, status: newStatus as Deliverable['status'] };
        setActivityLog(prev => [...prev, `${d.title} moved to ${newStatus}`]);
        return updated;
      }
      return d;
    }));
  };

  const handleTrackingStart = (deliverableId: string) => {
    setDeliverables(prev => prev.map(d => {
      if (d.id === deliverableId) {
        return {
          ...d,
          isTracking: true,
          currentSession: { startTime: new Date() }
        };
      }
      return d;
    }));
    setActivityLog(prev => [...prev, `Started working on ${
      deliverables.find(d => d.id === deliverableId)?.title
    } (Estimated: ${
      deliverables.find(d => d.id === deliverableId)?.estimatedHours
    }h)`]);
  };

  const handleTrackingStop = (deliverableId: string, hoursLogged: number) => {
    setDeliverables(prev => prev.map(d => {
      if (d.id === deliverableId) {
        const newActualHours = d.actualHours + hoursLogged;
        return {
          ...d,
          isTracking: false,
          actualHours: newActualHours,
          timeEntries: [...d.timeEntries, {
            startTime: d.currentSession?.startTime || new Date(),
            endTime: new Date(),
            hoursLogged
          }],
          currentSession: undefined
        };
      }
      return d;
    }));

    const deliverable = deliverables.find(d => d.id === deliverableId);
    if (deliverable) {
      setActivityLog(prev => [...prev, 
        `Completed work session on ${deliverable.title} (${hoursLogged.toFixed(1)}h logged, Total: ${
          (deliverable.actualHours + hoursLogged).toFixed(1)
        }h / ${deliverable.estimatedHours}h)`
      ]);
    }
  };

  const handlePayment = (milestoneId: string) => {
    setPaymentMilestones(prev => prev.map(m => 
      m.id === milestoneId ? { ...m, status: 'paid' } : m
    ));
    setActivityLog(prev => [...prev, `Payment milestone completed: ${
      paymentMilestones.find(m => m.id === milestoneId)?.type
    } payment`]);
    toast.success('Payment processed successfully');
  };

  const getMilestoneLabel = (type: string) => {
    switch (type) {
      case 'initial': return 'Initial Payment';
      case 'draft': return 'Draft Payment';
      case 'final': return 'Final Payment';
      default: return '';
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      setMessages((msgs) => [
        ...msgs,
        { id: String(Date.now()), text: message, sender: 'client', timestamp: new Date(), read: false },
      ]);
      setMessage('');
      setShowEmojiPicker(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addEmoji = (e: any) => {
    setMessage((prev) => prev + e.native);
  };

  const renderDeliverableCard = (deliverable: Deliverable) => (
    <div className="border border-[#E6E9F4] rounded-lg p-4 space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">{deliverable.title}</h4>
          <p className="text-sm text-gray-600">{deliverable.description}</p>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            {deliverable.estimatedHours}h
          </div>
        </div>
        <Badge
          variant="outline"
          className={
            deliverable.status === 'completed'
              ? 'bg-green-50 text-green-700'
              : deliverable.status === 'in_progress'
              ? 'bg-yellow-50 text-yellow-700'
              : deliverable.status === 'recommended'
              ? 'bg-purple-50 text-purple-700'
              : 'bg-blue-50 text-blue-700'
          }
        >
          {deliverable.status.replace('_', ' ').charAt(0).toUpperCase() + 
           deliverable.status.slice(1).replace('_', ' ')}
        </Badge>
      </div>

      {deliverable.status === 'recommended' && (
        <Button
          onClick={() => handleStatusChange(deliverable.id, 'scoped')}
          className="w-1/4 bg-[#00A499] text-white hover:bg-[#00A499]/90"
        >
          Accept Recommendation
        </Button>
      )}

      {deliverable.submittedFiles && deliverable.submittedFiles.length > 0 && (
        <div className="border-t pt-2 mt-2">
          <p className="text-sm font-medium mb-1">Submitted Files:</p>
          <div className="space-y-1">
            {deliverable.submittedFiles.map(file => (
              <a
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
              >
                <FileText className="w-4 h-4" />
                {file.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0F4FF]">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#2E3A8C]">{projectName}</h1>
        </div>

        <div className="bg-white border border-[#E6E9F4] rounded-lg p-4 mb-6">
          <div className="flex justify-between items-start">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">
                  <Clock className="mr-1 h-3 w-3" />
                  {projectStatus}
                </Badge>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                  Due {formatDistanceToNow(projectDeadline, { addSuffix: true })}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#2E3A8C]" />
                  <span>Deadline: {format(projectDeadline, 'PPP')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#2E3A8C]" />
                  <span>{estimatedHours} hours @ ${hourlyRate}/hr</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
                  <User className="w-4 h-4 text-[#2E3A8C]" />
                  <span className="text-sm font-medium">John Smith</span>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700">Expert</Badge>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/client/projects/${id}/details`}>
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Project Details
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-medium text-[#2E3A8C]">
                Total Budget: ${estimatedBudget.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="deliverables" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white mb-6 rounded-lg border border-[#E6E9F4]">
            <TabsTrigger 
              value="chat"
              className="data-[state=active]:bg-[#2E3A8C] data-[state=active]:text-white"
            >
              Chat
            </TabsTrigger>
            <TabsTrigger 
              value="deliverables"
              className="data-[state=active]:bg-[#2E3A8C] data-[state=active]:text-white"
            >
              Deliverables
            </TabsTrigger>
            <TabsTrigger 
              value="payment"
              className="data-[state=active]:bg-[#2E3A8C] data-[state=active]:text-white"
            >
              Payment
            </TabsTrigger>
            <TabsTrigger 
              value="activity"
              className="data-[state=active]:bg-[#2E3A8C] data-[state=active]:text-white"
            >
              Activity Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deliverables">
            <div className="bg-white border border-[#E6E9F4] rounded-lg p-6 shadow-sm">
              <Tabs defaultValue="kanban" className="w-full">
                <TabsList className="mb-6">
                  <TabsTrigger 
                    value="kanban"
                    className="data-[state=active]:bg-[#2E3A8C] data-[state=active]:text-white"
                  >
                    Kanban Board
                  </TabsTrigger>
                  <TabsTrigger 
                    value="list"
                    className="data-[state=active]:bg-[#2E3A8C] data-[state=active]:text-white"
                  >
                    List View
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="kanban">
                  <KanbanBoard
                    deliverables={deliverables}
                    projectStartDate={projectStartDate}
                    projectDeadline={projectDeadline}
                    onDeliverableMove={handleDeliverableMove}
                    onStatusChange={handleStatusChange}
                    onTrackingStart={handleTrackingStart}
                    onTrackingStop={handleTrackingStop}
                  />
                </TabsContent>

                <TabsContent value="list">
                  <div className="space-y-4">
                    {deliverables.map((deliverable) => renderDeliverableCard(deliverable))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          <TabsContent value="chat">
            <div className="bg-white border border-[#E6E9F4] rounded-lg shadow-lg flex flex-col">
              <div className="flex-1 p-4 space-y-4 max-h-[500px] overflow-y-auto">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[70%] ${
                        msg.sender === 'client' 
                          ? 'bg-[#E6E9F4] text-[#2E3A8C]' 
                          : 'bg-[#E6FCF9] text-[#00A499]'
                      } rounded-lg p-3`}
                    >
                      <div className="text-xs opacity-75 mb-1">{format(msg.timestamp, 'p')}</div>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="text-gray-500 italic text-sm">Talent is typing...</div>
                )}
              </div>
              <div className="border-t border-[#E6E9F4] p-4">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 bg-white border-[#E6E9F4]"
                  />
                  <Button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="bg-white border border-[#E6E9F4] text-[#00A499] hover:bg-[#E6E9F4]"
                  >
                    😊
                  </Button>
                  <Button 
                    onClick={handleSend}
                    className="bg-[#00A499] text-white hover:bg-[#00A499]/90"
                  >
                    <SendIcon className="w-4 h-4" />
                  </Button>
                </div>
                {showEmojiPicker && (
                  <div className="absolute mt-2">
                    <Picker data={data} onEmojiSelect={addEmoji} theme="light" />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payment">
            <div className="bg-white border border-[#E6E9F4] rounded-lg p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-[#2E3A8C]">Payment Schedule</h3>
                <div className="space-y-1 text-right">
                  <div className="text-sm text-gray-600">
                    Estimated Hours: {estimatedHours}h @ ${hourlyRate}/hr
                  </div>
                  <div className="text-sm font-medium text-[#2E3A8C]">
                    Total Budget: ${estimatedBudget.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {paymentMilestones.map((milestone) => (
                  <div 
                    key={milestone.id}
                    className="border border-[#E6E9F4] rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{getMilestoneLabel(milestone.type)}</h4>
                        <p className="text-sm text-gray-600">
                          Amount: ${milestone.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">{milestone.description}</p>
                        {milestone.dueDate && (
                          <p className="text-sm text-gray-500">
                            Due: {format(milestone.dueDate, 'PP')}
                          </p>
                        )}
                      </div>
                      <div>
                        {milestone.status === 'pending' ? (
                          <Button
                            onClick={() => handlePayment(milestone.id)}
                            className="bg-[#00A499] text-white hover:bg-[#00A499]/90"
                          >
                            Process Payment
                          </Button>
                        ) : (
                          <span className="text-green-500 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Paid
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <div className="bg-white border border-[#E6E9F4] rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[#2E3A8C] mb-4">Activity Log</h3>
              <div className="space-y-2">
                {activityLog.map((log, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}