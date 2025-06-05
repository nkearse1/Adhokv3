// src/components/MockRoleToggle.tsx
import React from 'react';

function MockRoleToggle() {
  const updateRole = (role: 'client' | 'talent' | 'admin') => {
    const user = JSON.parse(localStorage.getItem('mockUser') || '{}');
    user.user_metadata = user.user_metadata || {};
    user.user_metadata.user_role = role;
    localStorage.setItem('mockUser', JSON.stringify(user));
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 shadow-lg rounded-md p-3 z-50">
      <p className="text-sm font-medium mb-2 text-gray-700">Switch Mock Role:</p>
      <div className="flex gap-2">
        <button
          className="text-xs bg-[#2E3A8C] text-white px-2 py-1 rounded"
          onClick={() => updateRole('talent')}
        >
          Talent
        </button>
        <button
          className="text-xs bg-[#00A499] text-white px-2 py-1 rounded"
          onClick={() => updateRole('client')}
        >
          Client
        </button>
        <button
          className="text-xs bg-gray-700 text-white px-2 py-1 rounded"
          onClick={() => updateRole('admin')}
        >
          Admin
        </button>
      </div>
    </div>
  );
}

export default MockRoleToggle;