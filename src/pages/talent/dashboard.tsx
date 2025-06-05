import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/useAuth";
import {
  Clock,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { CompletedProjectsList } from "@/components/CompletedProjectsList";
import TalentEarnings from "@/components/TalentEarnings";

const USE_MOCK_SESSION = true;
const TEAL_COLOR = "#00A499";

const experienceBadgeMap: Record<string, string> = {
  "Entry Level": "Specialist",
  "Mid-Level": "Pro Talent",
  "Expert": "Expert",
};

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  deadline: string;
  project_budget: number;
  rate_per_hour?: number;
  bidCount?: number;
  lastBid?: number;
  metadata?: {
    marketing?: {
      expertiseLevel?: string;
    };
  };
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  expertise: string;
  location?: string;
  rate?: number;
  linkedin_url?: string;
  is_qualified: boolean;
  metadata?: {
    marketing?: {
      expertiseLevel?: string;
    };
  };
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function TalentDashboard() {
  const navigate = useNavigate();
  const { userId, isAuthenticated, loading: authLoading } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({
    activeBids: 0,
    totalEarnings: 0,
    completedProjects: 0,
  });
  const [loading, setLoading] = useState(true);

  const [currentTab, setCurrentTab] = useState<"activeBids" | "wonProjects" | "earnings" | "portfolio">("activeBids");

  useEffect(() => {
    if (USE_MOCK_SESSION) {
      setProfile({
        id: "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
        full_name: "Mock Talent",
        email: "talent@adhok.dev",
        expertise: "SEO",
        location: "Tampa, FL",
        rate: 75,
        linkedin_url: "https://linkedin.com/in/mocktalent",
        is_qualified: true,
        metadata: { marketing: { expertiseLevel: "Pro Talent" } },
      });
      const mockProjects = [
        {
          id: "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
          title: "Mock SEO Audit",
          description: "Audit a small business website",
          status: "open",
          deadline: new Date().toISOString(),
          project_budget: 500,
          bidCount: 4,
          lastBid: 72,
          metadata: { marketing: { expertiseLevel: "Pro Talent" } },
        },
        {
          id: "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
          title: "Social Media Strategy",
          description: "Develop comprehensive social media plan",
          status: "completed",
          deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
          project_budget: 1500,
          bidCount: 1,
          lastBid: 140,
          metadata: { marketing: { expertiseLevel: "Expert" } },
        },
      ];
      setProjects(mockProjects);
      setStats({ activeBids: 1, totalEarnings: 1200, completedProjects: 1 });
      setLoading(false);
      return;
    }
  }, [authLoading, isAuthenticated, userId]);

  const statLabelMap = {
    activeBids: "Active Bids",
    wonProjects: "Won Projects",
    earnings: "Total Earnings",
    portfolio: "Completed Projects",
  };

  const statValueMap = {
    activeBids: stats.activeBids,
    wonProjects: stats.completedProjects,
    earnings: stats.totalEarnings.toLocaleString(),
    portfolio: stats.completedProjects,
  };

  const filteredProjects = projects.filter((p) => {
    if (currentTab === "activeBids") return p.status !== "completed";
    if (currentTab === "wonProjects") return p.status === "completed";
    return false;
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6 px-2 md:px-0">
        <h1 className="text-3xl font-bold text-[#2E3A8C]">Talent Dashboard</h1>
        <Button onClick={() => navigate("/talent/projects")}>Browse Projects</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {Object.keys(statLabelMap).filter(tab => tab !== currentTab).map((tab) => (
          <Card
            key={tab}
            className="cursor-pointer"
            style={{ borderColor: TEAL_COLOR }}
            onClick={() => setCurrentTab(tab as typeof currentTab)}
          >
            <CardContent className="p-4">
              <h3 className="text-sm text-gray-600">{statLabelMap[tab]}</h3>
              <p className="text-2xl font-bold">{statValueMap[tab]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-xl font-semibold text-[#2E3A8C] mb-4">{statLabelMap[currentTab]}</h2>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {currentTab === "earnings" ? (
            <TalentEarnings />
          ) : currentTab === "portfolio" ? (
            <CompletedProjectsList userId={userId || "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13"} />
          ) : filteredProjects.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                No projects found in this section.
              </CardContent>
            </Card>
          ) : (
            filteredProjects.map((project) => (
              <Card
                key={project.id}
                className={
                  project.id === filteredProjects[0].id
                    ? "border-[#2E3A8C] border-2"
                    : ""
                }
              >
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="max-w-[60%]">
                    <h3 className="text-lg font-semibold mb-1">{project.title}</h3>
                    <p className="text-gray-600 mb-1 text-sm">{project.description}</p>
                    <div className="flex items-center gap-3 flex-wrap text-sm text-gray-500">
                      <Badge variant={project.status === "completed" ? "success" : "secondary"}>
                        {project.status === "completed" ? (
                          <CheckCircle className="mr-1 h-3 w-3" />
                        ) : (
                          <Clock className="mr-1 h-3 w-3" />
                        )}
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </Badge>
                      <span>{project.bidCount ?? 0} bids</span>
                      {typeof project.lastBid === 'number' && <span>Last bid: ${project.lastBid}/hr</span>}
                      <span>Due {formatDistanceToNow(new Date(project.deadline), { addSuffix: true })}</span>
                    </div>
                    <div className="mt-1 text-sm text-indigo-800 font-medium">
                      Your Bids: {project.bidCount ?? 0}
                    </div>
                  </div>
                  <Button
                    className="whitespace-nowrap"
                    onClick={() => navigate(`/talent/projects?projectId=${project.id}`)}
                  >
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}

          {!Object.keys(statLabelMap).includes(currentTab) && (
            <div className="text-sm text-red-500">[Error] Unrecognized tab: {currentTab}</div>
          )}
        </div>

        <div className="hidden md:block w-64 flex-shrink-0 bg-white border rounded-lg p-6 shadow space-y-3">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
          <p className="font-medium">{profile?.full_name ?? "Loading..."}</p>
          <p className="text-sm text-gray-600">{profile?.email ?? ""}</p>
          <p className="text-sm">Expertise: {profile?.expertise ?? ""}</p>
          {profile?.location && <p className="text-sm">Location: {profile.location}</p>}
          {profile?.metadata?.marketing?.expertiseLevel ? (
            <Badge variant="primary">{profile.metadata.marketing.expertiseLevel}</Badge>
          ) : (
            profile?.rate && <p className="text-sm">Rate: ${profile.rate}/hr</p>
          )}
          {profile?.linkedin_url && (
            <p className="text-sm">
              LinkedIn: {" "}
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                Profile
              </a>
            </p>
          )}
          <Button onClick={() => navigate("/talent/profile")}>Edit Profile</Button>
          <div>
            <a href="/talent/profile/settings" className="text-sm text-[#2E3A8C] underline cursor-pointer hover:text-[#1B276F]">
              Profile Settings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}