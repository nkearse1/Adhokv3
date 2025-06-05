import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from '@/lib/supabaseClient';
import { Package } from 'lucide-react';

export function ProjectUploadFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    briefFile: null as File | null,
    title: '',
    expertType: '',
    description: '',
    budget: '',
    clientName: '',
    company: '',
    email: '',
    phone: '',
    password: '',
  });

  const projectSuggestions = {
    SEO: ['Technical Audit', 'Keyword Research', 'SEO Strategy'],
    'Web Design': ['Landing Page Design', 'Website Redesign'],
    Copywriting: ['Email Campaign Copy', 'Website Copy Overhaul'],
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setForm({ ...form, briefFile: e.target.files[0] });
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      let { data: userData, error: authError } = await supabase.auth.getUser();
      let user = userData?.user;

      if (!user) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              full_name: form.clientName,
              user_role: 'client' // Set initial role in metadata
            }
          }
        });

        if (signUpError) throw signUpError;
        user = signUpData?.user;
      }

      if (!user) throw new Error("Authentication failed");

      let briefUrl = null;
      if (form.briefFile) {
        const { data, error: uploadError } = await supabase.storage
          .from('project-briefs')
          .upload(`briefs/${Date.now()}-${form.briefFile.name}`, form.briefFile);

        if (uploadError) throw uploadError;
        briefUrl = data?.path;
      }

      const { error: projectError } = await supabase.from('projects').insert([{
        title: form.title,
        description: form.description,
        projectBudget: parseFloat(form.budget),
        created_by: user.id,
        status: 'open',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        auction_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        metadata: {
          requestor: {
            name: form.clientName,
            email: form.email,
            company: form.company,
            phone: form.phone
          },
          marketing: {
            expertiseLevel: form.expertType.toLowerCase(),
            audience: '',
            channels: {},
            deliverables: ''
          }
        },
        brief_url: briefUrl
      }]);

      if (projectError) throw projectError;

      toast.success('Project created successfully!');
      navigate('/client/dashboard');
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error(error.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-6">
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <div className="h-8 w-8 text-[#2E3A8C] font-bold text-2xl">💼</div>
            <h1 className="text-3xl font-bold text-[#2F2F2F]">Adhok</h1>
          </div>
          <p className="text-sm text-[#00A499] font-medium">
            Upload your project brief and get matched with proven experts
          </p>
        </div>

        <Card className="max-w-xl mx-auto">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Package className="h-8 w-8 text-brand-primary" />
              <div>
                <h1 className="text-3xl font-bold text-brand-neutral">Post a Project</h1>
                <p className="text-sm text-brand-accent">Get your project done by experts</p>
              </div>
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-2">Upload a Brief (optional)</label>
                  <Input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                </div>

                <div>
                  <label className="block font-medium mb-2">Project Title</label>
                  <Input 
                    placeholder="Enter project title" 
                    value={form.title} 
                    onChange={(e) => setForm({ ...form, title: e.target.value })} 
                    required 
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">Select Category</label>
                  <div className="flex gap-2 flex-wrap">
                    {Object.keys(projectSuggestions).map((type) => (
                      <Button 
                        key={type} 
                        type="button" 
                        variant={form.expertType === type ? "default" : "outline"} 
                        onClick={() => setForm({ ...form, expertType: type })}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                {form.expertType && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">Suggested {form.expertType} Projects:</h3>
                      <ul className="space-y-2">
                        {projectSuggestions[form.expertType].map((suggestion, i) => (
                          <li 
                            key={i} 
                            className="cursor-pointer hover:text-brand-primary transition-colors" 
                            onClick={() => setForm({ ...form, title: suggestion })}
                          >
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <Button 
                  onClick={() => setStep(2)} 
                  className="w-full" 
                  disabled={!form.title}
                >
                  Next: Project Details
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-2">Project Description</label>
                  <Textarea 
                    placeholder="Describe your project requirements..." 
                    value={form.description} 
                    onChange={(e) => setForm({ ...form, description: e.target.value })} 
                    className="min-h-[120px]" 
                    required 
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2">Budget (USD)</label>
                  <Input 
                    type="number" 
                    placeholder="Your project budget" 
                    value={form.budget} 
                    onChange={(e) => setForm({ ...form, budget: e.target.value })} 
                    min="1" 
                    required 
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button 
                    onClick={() => setStep(3)} 
                    disabled={!form.description || !form.budget} 
                    className="flex-1"
                  >
                    Next: Your Details
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <Input 
                  placeholder="Your Name" 
                  value={form.clientName} 
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })} 
                  required 
                />
                <Input 
                  placeholder="Company Name" 
                  value={form.company} 
                  onChange={(e) => setForm({ ...form, company: e.target.value })} 
                />
                <Input 
                  type="email" 
                  placeholder="Email Address" 
                  value={form.email} 
                  onChange={(e) => setForm({ ...form, email: e.target.value })} 
                  required 
                />
                <Input 
                  placeholder="Phone Number" 
                  value={form.phone} 
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                />
                <Input 
                  type="password" 
                  placeholder="Create a password" 
                  value={form.password} 
                  onChange={(e) => setForm({ ...form, password: e.target.value })} 
                  required 
                  minLength={6} 
                />
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button 
                    onClick={() => setStep(4)} 
                    disabled={!form.clientName || !form.email || !form.password} 
                    className="flex-1"
                  >
                    Next: Review
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Review Your Project</h2>
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <h3 className="font-medium text-gray-500">Project Details</h3>
                      <p className="font-semibold text-lg">{form.title}</p>
                      <p className="text-sm text-gray-600">{form.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-medium text-gray-500">Category</h3>
                        <p>{form.expertType || 'Not specified'}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-500">Budget</h3>
                        <p>${form.budget}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-500">Contact</h3>
                      <p>{form.clientName}</p>
                      <p className="text-sm text-gray-600">{form.email}</p>
                      <p className="text-sm text-gray-600">{form.company}</p>
                      <p className="text-sm text-gray-600">{form.phone}</p>
                    </div>
                    {form.briefFile && (
                      <div>
                        <h3 className="font-medium text-gray-500">Attached Brief</h3>
                        <p className="text-sm text-gray-600">{form.briefFile.name}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={submitting} 
                    className="flex-1"
                  >
                    {submitting ? 'Creating Project...' : 'Submit Project'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}