import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CalendarIcon, SendIcon, Clock, CheckCircle, Plus, Edit2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DragDropContext } from 'react-beautiful-dnd';
import KanbanBoard from '@/components/KanbanBoard';
import { toast } from 'sonner';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface Deliverable {
  id: string;
  title: string;
  description: string;
  status: 'scoped' | 'in_progress' | 'approved' | 'completed';
  estimatedHours: number;
  dueDate?: Date;
}

interface PaymentMilestone {
  id: string;
  amount: number;
  status: 'pending' | 'paid';
  type: 'initial' | 'draft' | 'final';
  dueDate?: Date;
  description?: string;
}

export default function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [projectName] = useState("SEO Optimization");
  const [companyName] = useState("Acme Corp");
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
      status: 'scoped',
      estimatedHours: 8,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  ]);
  const [activityLog, setActivityLog] = useState<string[]>(['Project started', 'Initial requirements received']);

  useEffect(() => {
    if (messages.length > 0) {
      const timeout = setTimeout(() => setIsTyping(false), 3000);
      setIsTyping(true);
      return () => clearTimeout(timeout);
    }
  }, [messages]);

  const handleDeliverableMove = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(deliverables);
    const [reorderedItem] = items.splice(result.source.index, 1);
    
    let newStatus: 'scoped' | 'in_progress' | 'approved' | 'completed';
    switch (result.destination.droppableId) {
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
        newStatus = 'scoped';
    }

    const updatedItem = { ...reorderedItem, status: newStatus };
    items.splice(result.destination.index, 0, updatedItem);
    setDeliverables(items);
    
    if (newStatus === 'completed') {
      setActivityLog(prev => [...prev, `Completed deliverable: ${updatedItem.title}`]);
      toast.success(`Marked "${updatedItem.title}" as completed`);
    } else if (newStatus === 'in_progress') {
      setActivityLog(prev => [...prev, `Started working on: ${updatedItem.title}`]);
      toast.info(`Started working on "${updatedItem.title}"`);
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      setMessages((msgs) => [
        ...msgs,
        { id: String(Date.now()), text: message, sender: 'talent', timestamp: new Date(), read: false },
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

  return (
    <div className="min-h-screen bg-[#F0F4FF]">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#2E3A8C]">{projectName} • {companyName}</h1>
        </div>

        <div className="bg-white border border-[#E6E9F4] rounded-lg p-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="secondary">
                  <Clock className="mr-1 h-3 w-3" />
                  {projectStatus}
                </Badge>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                  Due {formatDistanceToNow(projectDeadline, { addSuffix: true })}
                </Badge>
              </div>
              <div className="text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#2E3A8C]" />
                  <span>Deadline: {format(projectDeadline, 'PPP')}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                {estimatedHours} hours @ ${hourlyRate}/hr
              </div>
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

          <TabsContent value="chat">
            <div className="bg-white border border-[#E6E9F4] rounded-lg shadow-lg flex flex-col">
              <div className="flex-1 p-4 space-y-4 max-h-[500px] overflow-y-auto">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'talent' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[70%] ${
                        msg.sender === 'talent' 
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
                  <div className="text-gray-500 italic text-sm">Client is typing...</div>
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

          <TabsContent value="deliverables">
            <div className="bg-white border border-[#E6E9F4] rounded-lg p-6 shadow-sm">
              <KanbanBoard
                deliverables={deliverables}
                projectStartDate={projectStartDate}
                projectDeadline={projectDeadline}
                onDeliverableMove={handleDeliverableMove}
              />
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