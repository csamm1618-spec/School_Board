import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase, getSchools, createUserProfile, School } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { School as SchoolIcon, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export const AuthPage = () => {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [schools, setSchools] = useState<School[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState('');

 // Load schools when component mounts
useEffect(() => {
  loadSchools();
}, []);


  const loadSchools = async () => {
    try {
      const schoolData = await getSchools();
      setSchools(schoolData);
      // Set first school as default if available
      if (schoolData.length > 0) {
        setSelectedSchoolId(schoolData[0].id);
      }
    } catch (error) {
      console.error('Error loading schools:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAuthLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) {
          throw error;
        } else {
          // Create user profile with selected school
          if (data.user && selectedSchoolId) {
            try {
              await createUserProfile(data.user.id, selectedSchoolId);
            } catch (profileError) {
              console.error('Error creating user profile:', profileError);
            }
          }
          // Sign up successful, show email confirmation message
          setEmailSent(true);
          setUserEmail(email);
        }
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setEmailSent(false);
    setIsLogin(true);
    setEmail('');
    setPassword('');
    setError('');
    setUserEmail('');
  };

  const resendConfirmationEmail = async () => {
    try {
      setAuthLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
      });
      if (error) throw error;
      alert('Confirmation email resent successfully!');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <SchoolIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {isLogin ? 'Sign in to' : 'Create'} School Board
          </h2>
          <p className="mt-2 text-gray-600">
            {isLogin ? 'Manage your school community' : 'Start managing your school today'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {emailSent ? (
            /* Email Confirmation Message */
            <div className="text-center space-y-6">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto">
                <Mail className="h-8 w-8 text-green-600 mx-auto" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Check Your Email
                </h3>
                <p className="text-gray-600 mb-4">
                  We've sent a confirmation email to <strong>{userEmail}</strong>
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Please check your inbox and click the confirmation link to activate your account. 
                  Don't forget to check your spam folder if you don't see the email.
                </p>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={resendConfirmationEmail}
                  disabled={authLoading}
                  className="w-full flex justify-center py-2 px-4 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {authLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  ) : (
                    'Resend Confirmation Email'
                  )}
                </button>
                
                <button
                  onClick={handleBackToLogin}
                  className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          ) : (
            /* Login/Signup Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                  <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="school" className="block text-sm font-medium text-gray-700">
                    Select School
                  </label>
                  <div className="mt-1">
                    <select
                      id="school"
                      required={!isLogin}
                      value={selectedSchoolId}
                      onChange={(e) => setSelectedSchoolId(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a school</option>
                      {schools.map((school) => (
                        <option key={school.id} value={school.id}>
                          {school.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading || (!isLogin && !selectedSchoolId)}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {authLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};