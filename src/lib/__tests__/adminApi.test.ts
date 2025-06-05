import { vi, describe, test, expect, beforeEach } from 'vitest';
import { updateUserStatusAPI, updateProjectStatusAPI } from '../adminApi';
import { supabase } from '../supabaseClient';
import { logAdminAction } from '../adminAuth';

// Mock supabase client
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }
}));

// Mock admin auth functions
vi.mock('../adminAuth', () => ({
  logAdminAction: vi.fn(() => Promise.resolve())
}));

describe('Admin API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateUserStatusAPI', () => {
    test('successfully updates user status', async () => {
      const result = await updateUserStatusAPI('user123', 'approved');
      
      expect(supabase.from).toHaveBeenCalledWith('talent_profiles');
      expect(logAdminAction).toHaveBeenCalledWith(
        'update_user_status_approved',
        'talent_profiles',
        'user123',
        { newStatus: 'approved' }
      );
      expect(result).toEqual({ success: true });
    });

    test('throws error when update fails', async () => {
      const mockError = new Error('Update failed');
      
      vi.mocked(supabase.from).mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: mockError })
        })
      } as any);

      await expect(updateUserStatusAPI('user123', 'approved'))
        .rejects
        .toThrow('Update failed');
    });
  });

  describe('updateProjectStatusAPI', () => {
    test('successfully updates project status', async () => {
      const result = await updateProjectStatusAPI('proj456', 'archived');
      
      expect(supabase.from).toHaveBeenCalledWith('projects');
      expect(logAdminAction).toHaveBeenCalledWith(
        'update_project_status_archived',
        'projects',
        'proj456',
        { newStatus: 'archived' }
      );
      expect(result).toEqual({ success: true });
    });

    test('throws error when update fails', async () => {
      const mockError = new Error('Update failed');
      
      vi.mocked(supabase.from).mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: mockError })
        })
      } as any);

      await expect(updateProjectStatusAPI('proj456', 'archived'))
        .rejects
        .toThrow('Update failed');
    });
  });
});