import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/useAuth'
import ExperienceBadge from '@/components/ExperienceBadge'

const badgeRank = {
  'Expert Talent': 3,
  'Pro Talent': 2,
  'Specialist': 1,
  '': 0
}

export default function AdminProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [talent, setTalent] = useState(null)
  const { authUser } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (projectData) {
        setProject(projectData)

        if (projectData.talent_id) {
          const { data: talentData } = await supabase
            .from('talent_profiles')
            .select('full_name, experience_badge')
            .eq('id', projectData.talent_id)
            .single()
          setTalent(talentData)
        }
      }
    }

    fetchData()
  }, [id])

  if (authUser.role !== 'admin') return <p>Unauthorized</p>
  if (!project) return <p>Loading...</p>

  const badgeFailsRequirement =
    talent && project.minimum_badge &&
    badgeRank[talent.experience_badge] < badgeRank[project.minimum_badge]

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">{project.title}</h1>
      <p className="mb-4 text-gray-600">{project.description}</p>

      {talent && (
        <div className="mb-4">
          <p className="text-sm text-gray-500">Assigned Talent: {talent.full_name}</p>
          <ExperienceBadge badge={talent.experience_badge} size="sm" showTooltip />
          {badgeFailsRequirement && (
            <p className="text-xs text-yellow-600 mt-1">Note: This talent's badge is below the project minimum requirement.</p>
          )}
        </div>
      )}

      <div className="text-sm text-gray-500">
        Project Status: <strong>{project.status}</strong>
      </div>
      {project.minimum_badge && (
        <div className="text-sm text-gray-500 mt-1">
          Minimum Required Badge: <strong>{project.minimum_badge}</strong>
        </div>
      )}
    </div>
  )
}
