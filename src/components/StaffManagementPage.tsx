import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
    getSchoolStaff, 
    updateStaffStatus, 
    resendStaffInvite
  } from '../lib/supabaseClient';
  import { createInviteLink as createInviteLinkUtil } from '../utils/inviteTokens';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Copy,  
  CheckCircle, 
  Clock, 
  UserX,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { AddStaffModal } from './AddStaffModal';
import { PermissionGate } from './PermissionGate';

export const StaffManagementPage = () => {
  const { schoolId, userProfile } = useAuth();
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadStaff = async () => {
    if (!schoolId) return;
    
    setLoading(true);
    try {
      const staffData = await getSchoolStaff(schoolId);
      setStaff(staffData);
    } catch (error: any) {
      setMessage(`Failed to load staff: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, [schoolId]);

  const handleStatusChange = async (profileId: string, newStatus: 'active' | 'suspended') => {
    setActionLoading(profileId);
    try {
      await updateStaffStatus(profileId, newStatus);
      await loadStaff();
      setMessage(`Staff member ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
      setMessageType('success');
    } catch (error: any) {
      setMessage(`Failed to update status: ${error.message}`);
      setMessageType('error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResendInvite = async (profileId: string) => {
    setActionLoading(profileId);
    try {
      const updatedProfile = await resendStaffInvite(profileId);
      
      // Safely check that invite_token exists
      if (!updatedProfile.invite_token) {
        setMessage('Failed to generate invite token. Please try again.');
        setMessageType('error');
        return;
      }
      
      setMessage('New invite link generated and copied to clipboard!');
      setMessageType('success');
      
      // Copy the new invite link
      const newLink = createInviteLinkUtil(updatedProfile.invite_token);
      await navigator.clipboard.writeText(newLink);
      
      await loadStaff();
    } catch (error: unknown) {
      const errorMessage = typeof error === 'object' && error !== null && 'message' in error 
        ? (error as Error).message 
        : String(error);
      setMessage(`Failed to resend invite: ${errorMessage}`);
      setMessageType('error');
    } finally {
      setActionLoading(null);
    }
  };

  const copyInviteLink = async (token: string) => {
    try {
      const link = createInviteLinkUtil(token);
      await navigator.clipboard.writeText(link);
      setMessage('Invite link copied to clipboard!');
      setMessageType('success');
    } catch (error) {
      setMessage('Failed to copy link');
      setMessageType('error');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'suspended':
        return <UserX className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!schoolId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">School Information Missing</h2>
          <p className="text-gray-600">Please set up your school profile first.</p>
        </div>
      </div>
    );
  }

  return (
    <PermissionGate 
      userRole={userProfile?.role || 'staff'} 
      permission="staff:manage"
      showRestrictedMessage={true}
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
                <p className="text-gray-600">Manage your school staff members and invites</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add Staff</span>
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className={`rounded-lg p-4 mb-6 ${
              messageType === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {messageType === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <p className={`font-medium ${
                  messageType === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {message}
                </p>
              </div>
            </div>
          )}

          {/* Staff List */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading staff...</p>
              </div>
            ) : staff.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Staff Members</h3>
                <p className="text-gray-600 mb-4">Get started by adding your first staff member.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Staff
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Staff Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invited
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {staff.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {member.profile_name || 'Unknown'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {member.user_id ? 'Active User' : 'Pending Invite'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                            {getStatusIcon(member.status)}
                            <span className="capitalize">{member.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.invited_at ? new Date(member.invited_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {member.status === 'pending' && member.invite_token && (
                              <>
                                <button
                                  onClick={() => copyInviteLink(member.invite_token)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Copy invite link"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleResendInvite(member.id)}
                                  disabled={actionLoading === member.id}
                                  className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                  title="Resend invite"
                                >
                                  {actionLoading === member.id ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Mail className="h-4 w-4" />
                                  )}
                                </button>
                              </>
                            )}
                            {member.status === 'active' && (
                              <button
                                onClick={() => handleStatusChange(member.id, 'suspended')}
                                disabled={actionLoading === member.id}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                title="Suspend staff"
                              >
                                <UserX className="h-4 w-4" />
                              </button>
                            )}
                            {member.status === 'suspended' && (
                              <button
                                onClick={() => handleStatusChange(member.id, 'active')}
                                disabled={actionLoading === member.id}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                title="Activate staff"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
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

        {/* Add Staff Modal */}
        <AddStaffModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          schoolId={schoolId}
          invitedBy={userProfile?.id || ''}
          onStaffAdded={loadStaff}
        />
      </div>
    </PermissionGate>
  );
};
