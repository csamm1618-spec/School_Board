import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { 
  Settings as SettingsIcon, 
  School, 
  Save, 
  User, 
  Mail,
  AlertCircle,
  CheckCircle,
  Lock,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { uploadSchoolLogo, updateSchoolLogo } from '../lib/supabaseClient';

export const SettingsPage = () => {
  const { user, schoolId, schoolName, refetchUserProfile } = useAuth();
  const [schoolNameInput, setSchoolNameInput] = useState(schoolName || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  
  // Logo upload states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(false);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);

  // Password change states
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleUpdateSchoolName = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!schoolId || !schoolNameInput.trim()) {
      setMessage('School name cannot be empty');
      setMessageType('error');
      return;
    }

    if (schoolNameInput.trim() === schoolName) {
      setMessage('No changes to save');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const { error } = await supabase
        .from('schools')
        .update({ name: schoolNameInput.trim() })
        .eq('id', schoolId);

      if (error) throw error;

      await refetchUserProfile();
      setMessage('School name updated successfully!');
      setMessageType('success');
    } catch (error: any) {
      setMessage(`Failed to update school name: ${error.message}`);
      setMessageType('error');
    } finally {
      setLoading(false);
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage('All password fields are required');
      setMessageType('error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match');
      setMessageType('error');
      return;
    }

    if (newPassword.length < 6) {
      setMessage('New password must be at least 6 characters long');
      setMessageType('error');
      return;
    }

    setPasswordLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setMessage('Password updated successfully!');
      setMessageType('success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
    } catch (error: any) {
      setMessage(`Failed to update password: ${error.message}`);
      setMessageType('error');
    } finally {
      setPasswordLoading(false);
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    }
  };

  const handleLogoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!logoFile || !schoolId) {
      setMessage('Please select a logo file');
      setMessageType('error');
      return;
    }

    setLogoLoading(true);
    setMessage('');
    setMessageType('');

    try {
      // Upload the logo file
      const logoUrl = await uploadSchoolLogo(schoolId, logoFile);
      
      // Update the school record with the logo URL
      await updateSchoolLogo(schoolId, logoUrl);
      
      // Refresh user profile to get updated school info
      await refetchUserProfile();
      
      setCurrentLogoUrl(logoUrl);
      setMessage('School logo updated successfully!');
      setMessageType('success');
      
      // Clear the file input
      setLogoFile(null);
      setLogoPreview(null);
    } catch (error: any) {
      setMessage(`Failed to upload logo: ${error.message}`);
      setMessageType('error');
    } finally {
      setLogoLoading(false);
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage('Please select an image file');
        setMessageType('error');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('File size must be less than 5MB');
        setMessageType('error');
        return;
      }
      
      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  // If no school ID is available, show informative message
  if (!schoolId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="bg-yellow-100 p-4 rounded-full w-16 h-16 mx-auto mb-6">
              <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">School Information Missing</h2>
            <p className="text-gray-600 mb-6">
              Your account is not associated with a school. Please contact your administrator 
              to set up your school profile.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your school and account preferences</p>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`rounded-xl shadow-lg p-4 mb-6 ${
            messageType === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center space-x-3">
              {messageType === 'success' ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <AlertCircle className="h-6 w-6 text-red-600" />
              )}
              <p className={`font-medium ${
                messageType === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* School Settings */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-blue-100 p-3 rounded-lg">
                <School className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">School Information</h2>
                <p className="text-gray-600">Update your school's basic information and logo</p>
              </div>
            </div>

            {/* School Logo Section */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                School Logo
              </label>
              
              {/* Current Logo Display */}
              {currentLogoUrl && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Current Logo:</p>
                  <div className="relative inline-block">
                    <img
                      src={currentLogoUrl}
                      alt="Current school logo"
                      className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                </div>
              )}

              {/* Logo Upload Form */}
              <form onSubmit={handleLogoUpload} className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 5MB. Recommended size: 200x200px
                    </p>
                  </div>
                  
                  {logoFile && (
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {/* Logo Preview */}
                {logoPreview && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={logoLoading || !logoFile}
                    className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {logoLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5" />
                        <span>Upload Logo</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* School Name Form */}
            <form onSubmit={handleUpdateSchoolName} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  School Name
                </label>
                <input
                  type="text"
                  value={schoolNameInput}
                  onChange={(e) => setSchoolNameInput(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter school name"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !schoolNameInput.trim() || schoolNameInput.trim() === schoolName}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Account Settings */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-green-100 p-3 rounded-lg">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Account Information</h2>
                <p className="text-gray-600">View and manage your account details</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Email Address</p>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <School className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">School</p>
                  <p className="text-gray-900">{schoolName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Password Settings */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Lock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Password & Security</h2>
                  <p className="text-gray-600">Update your password to keep your account secure</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {showPasswordSection ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {showPasswordSection && (
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordSection(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                    className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {passwordLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};