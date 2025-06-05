import { supabase } from '@/lib/supabaseClient';
import { logAdminAction } from '@/lib/adminAuth';

export async function updateUserStatusAPI(userId: string, newStatus: string) {
  try {
    const { error } = await supabase
      .rpc('update_user_status', {
        user_id: userId,
        new_status: newStatus
      });

    if (error) throw error;

    // Log the admin action
    await logAdminAction(
      `update_user_status_${newStatus}`,
      'talent_profiles',
      userId,
      { newStatus }
    );

    return { success: true };
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
}

export async function updateProjectStatusAPI(projectId: string, newStatus: string) {
  try {
    const { error } = await supabase
      .rpc('update_project_status', {
        project_id: projectId,
        new_status: newStatus
      });

    if (error) throw error;

    // Log the admin action
    await logAdminAction(
      `update_project_status_${newStatus}`,
      'projects',
      projectId,
      { newStatus }
    );

    return { success: true };
  } catch (error) {
    console.error('Error updating project status:', error);
    throw error;
  }
}