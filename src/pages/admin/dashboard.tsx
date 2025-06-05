import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { 
  Loader2, Users, Briefcase, Activity,
  CheckCircle, XCircle, Search, Clock,
  ArrowRight, DollarSign
} from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  deadline: string;
  projectBudget: number;
  created_at: string;
  metadata?: {
    requestor?: {
      name?: string;
      email?: string;
    };
    marketing?: {
      expertiseLevel?: string;
      budget?: number;
    };
  };
  project_bids: {
    id: string;
    rate_per_hour: number;
    professional: {
      full_name: string;
    };
  }[];
}

interface TalentProfile {
  id: string;
  full_name: string;
  email: string;
  expertise: string;
  is_qualified: boolean;
  created_at: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [talents, setTalents] = useState<TalentProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [filteredTalents, setFilteredTalents] = useState<TalentProfile[]>([]);

  useEffect(() => {
    checkAuth();
    fetchDashboardData();

    const subscription = supabase
      .channel('dashboard_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        () => fetchDashboardData()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Filter projects
    const filtered = projects.filter(project => 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProjects(filtered);

    // Filter talents
    const filteredT = talents.filter(talent =>
      talent.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talent.expertise.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTalents(filteredT);
  }, [searchQuery, projects, talents]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please sign in to access admin panel');
        navigate('/admin/signin');
        return;
      }

      // Check admin role
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', session.user.id)
        .single();

      if (!adminUser) {
        toast.error('Unauthorized access');
        navigate('/');
        return;
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      navigate('/');
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch projects with proper UUID validation
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          project_bids!project_bids_project_id_fkey (
            id,
            rate_per_hour,
            professional:talent_profiles (
              full_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;
      
      // Validate UUIDs before setting state
      const validProjects = projectsData?.filter(project => 
        project?.id && UUID_REGEX.test(project.id)
      ) || [];
      
      setProjects(validProjects);
      setFilteredProjects(validProjects);

      // Fetch talents with UUID validation
      const { data: talentsData, error: talentsError } = await supabase
        .from('talent_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (talentsError) throw talentsError;

      const validTalents = talentsData?.filter(talent => 
        talent?.id && UUID_REGEX.test(talent.id)
      ) || [];

      setTalents(validTalents);
      setFilteredTalents(validTalents);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Completed
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Open
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full sm:w-[300px]"
            />
          </div>
          <Button onClick={() => navigate('/admin/projects/new')}>
            New Project
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="talents">Talents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Projects</p>
                    <p className="text-3xl font-bold">{projects.length}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Talents</p>
                    <p className="text-3xl font-bold">{talents.length}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold">
                      ${projects
                        .filter(p => p.status === 'completed')
                        .reduce((sum, p) => sum + (p.metadata?.marketing?.budget || 0), 0)
                        .toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects">
          <div className="space-y-4">
            {filteredProjects.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No projects found
                </CardContent>
              </Card>
            ) : (
              filteredProjects.map((project) => (
                <Card key={project?.id || Math.random()} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{project?.title || 'Untitled Project'}</h3>
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusBadge(project?.status || 'unknown')}
                          <Badge variant="outline">
                            {project?.project_bids?.length || 0} bids
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Due {project?.deadline ? formatDistanceToNowStrict(new Date(project.deadline)) : 'No deadline'}
                          </span>
                        </div>
                        <p className="text-gray-600">{project?.description || 'No description available'}</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => project?.id && navigate(`/admin/projects/${project.id}`)}
                        disabled={!project?.id}
                      >
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="talents">
          <div className="space-y-4">
            {filteredTalents.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  No talents found
                </CardContent>
              </Card>
            ) : (
              filteredTalents.map((talent) => (
                <Card key={talent.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{talent.full_name}</h3>
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant={talent.is_qualified ? "success" : "secondary"}>
                            {talent.is_qualified ? (
                              <CheckCircle className="mr-1 h-3 w-3" />
                            ) : (
                              <XCircle className="mr-1 h-3 w-3" />
                            )}
                            {talent.is_qualified ? "Qualified" : "Pending"}
                          </Badge>
                          <Badge variant="outline">{talent.expertise}</Badge>
                        </div>
                        <p className="text-gray-600">{talent.email}</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/admin/talents/${talent.id}`)}
                      >
                        View Profile
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}