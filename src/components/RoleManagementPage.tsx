import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { PermissionGate } from './PermissionGate';
import { Role, ROLE_DISPLAY_NAMES, ROLE_DESCRIPTIONS } from '../utils/permissions';
import { Trash2, User } from 'lucide-react';

interface StaffMember {
  id: string;
  user_id: string;
  profile_name: string;
  role: Role;
  email: string;
  created_at: string;
}

export const RoleManagementPage = () => {
  const { userRole, schoolId } = useAuth();
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (schoolId) {
      loadStaffMembers();
    }
  }, [schoolId]);

  const loadStaffMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          school:schools(*)
        `)
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(member => ({
        id: member.id,
        user_id: member.user_id,
        profile_name: member.profile_name || 'No name',
        role: member.role || 'staff',
        email: 'Email not available', // We'll get this from user context
        created_at: member.created_at
      })) || [];

      setStaffMembers(formattedData);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: Role) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      setSuccess('User role updated successfully!');
      loadStaffMembers();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const removeStaff = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      setSuccess('Staff member removed successfully!');
      loadStaffMembers();
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <PermissionGate userRole={userRole} permission="staff:manage">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
            <p className="text-gray-600 mt-2">Manage your school staff and their permissions</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Staff Members</h2>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Staff Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Permissions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {staffMembers.map((member) => (
                      <tr key={member.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {member.profile_name}
                              </div>
                              <div className="text-sm text-gray-500">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            member.role === 'owner' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {ROLE_DISPLAY_NAMES[member.role]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {ROLE_DESCRIPTIONS[member.role]}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <select
                              value={member.role}
                              onChange={(e) => updateUserRole(member.user_id, e.target.value as Role)}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="owner">Owner/Admin</option>
                              <option value="staff">Staff</option>
                            </select>
                            <PermissionGate userRole={userRole} permission="staff:remove">
                              <button
                                onClick={() => removeStaff(member.user_id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </PermissionGate>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </PermissionGate>
  );
};
