import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { User, Mail, MapPin, Briefcase, Link as LinkIcon, CheckCircle, XCircle, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface TalentProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  bio: string;
  expertise: string;
  resume_url: string;
  created_at: string;
  is_qualified: boolean;
}

const ITEMS_PER_PAGE = 5;

export function AdminTalentList() {
  const [talents, setTalents] = useState<TalentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [qualificationFilter, setQualificationFilter] = useState<string>("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on new search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchTalents();
  }, [currentPage, debouncedSearch, qualificationFilter]);

  const fetchTalents = async () => {
    try {
      setLoading(true);

      // Build the base query for counting
      let query = supabase
        .from('talent_profiles')
        .select('count', { count: 'exact' });

      // Add search conditions
      if (debouncedSearch) {
        query = query.or(`full_name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%,expertise.ilike.%${debouncedSearch}%`);
      }

      // Add qualification filter
      if (qualificationFilter !== "all") {
        query = query.eq('is_qualified', qualificationFilter === "qualified");
      }

      const { count, error: countError } = await query;

      if (countError) {
        throw countError;
      }

      setTotalCount(count || 0);

      // Build the query for fetching data
      let dataQuery = supabase
        .from('talent_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);

      // Add search conditions
      if (debouncedSearch) {
        dataQuery = dataQuery.or(`full_name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%,expertise.ilike.%${debouncedSearch}%`);
      }

      // Add qualification filter
      if (qualificationFilter !== "all") {
        dataQuery = dataQuery.eq('is_qualified', qualificationFilter === "qualified");
      }

      const { data, error } = await dataQuery;

      if (error) {
        throw error;
      }

      setTalents(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch talent profiles');
    } finally {
      setLoading(false);
    }
  };

  const toggleQualification = async (talentId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('talent_profiles')
        .update({ is_qualified: !currentStatus })
        .eq('id', talentId);

      if (error) {
        throw error;
      }

      setTalents(talents.map(talent => 
        talent.id === talentId 
          ? { ...talent, is_qualified: !currentStatus }
          : talent
      ));

      toast.success(`Talent ${!currentStatus ? 'qualified' : 'disqualified'} successfully`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update qualification status');
    }
  };

  const getResumeUrl = (resumeUrl: string) => {
    if (!resumeUrl) return null;
    
    // If it's already a full URL, return it
    if (resumeUrl.startsWith('http')) {
      return resumeUrl;
    }
    
    // Otherwise, construct the full URL using the Supabase storage URL
    const { data } = supabase.storage.from('resumes').getPublicUrl(resumeUrl);
    return data.publicUrl;
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (loading && !talents.length) {
    return <div className="text-center py-8">Loading talent profiles...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <h2 className="text-3xl font-bold">Talent Profiles</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search talents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full sm:w-[300px]"
            />
          </div>
          <Select
            value={qualificationFilter}
            onValueChange={setQualificationFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Profiles</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="unqualified">Unqualified</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="text-sm whitespace-nowrap">
            {totalCount} Total
          </Badge>
        </div>
      </div>

      {talents.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            {debouncedSearch || qualificationFilter !== "all" 
              ? 'No matching talent profiles found' 
              : 'No talent profiles found'}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {talents.map((talent) => (
              <Card key={talent.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-gray-500" />
                          <h3 className="text-xl font-semibold">{talent.full_name}</h3>
                          <Badge variant={talent.is_qualified ? "success" : "secondary"}>
                            {talent.is_qualified ? "Qualified" : "Unqualified"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Briefcase className="h-4 w-4" />
                          <span>{talent.expertise}</span>
                        </div>
                      </div>

                      <p className="text-gray-600 max-w-2xl">{talent.bio}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <a href={`mailto:${talent.email}`} className="text-blue-600 hover:underline">
                            {talent.email}
                          </a>
                        </div>
                        {talent.phone && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">{talent.phone}</span>
                          </div>
                        )}
                        {talent.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">{talent.location}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-4">
                        {talent.linkedin && (
                          <a
                            href={talent.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            <LinkIcon className="h-4 w-4" />
                            LinkedIn
                          </a>
                        )}
                        {talent.portfolio && (
                          <a
                            href={talent.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            <LinkIcon className="h-4 w-4" />
                            Portfolio
                          </a>
                        )}
                        {talent.resume_url && (
                          <a
                            href={getResumeUrl(talent.resume_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            <LinkIcon className="h-4 w-4" />
                            Resume
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant={talent.is_qualified ? "destructive" : "default"}
                        onClick={() => toggleQualification(talent.id, talent.is_qualified)}
                        className="flex items-center gap-2"
                      >
                        {talent.is_qualified ? (
                          <>
                            <XCircle className="h-4 w-4" />
                            Disqualify
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Qualify
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => toast.info('Feature coming soon')}>
                        Message
                      </Button>
                      <Button variant="outline" onClick={() => toast.info('Feature coming soon')}>
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}