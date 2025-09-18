import { useState} from 'react';
import { Navigate } from 'react-router-dom';
import { supabase, createSchool, createUserProfile } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { School as SchoolIcon, Mail, Lock, Eye, EyeOff, BookOpen, Users, GraduationCap, MessageCircle, Sparkles } from 'lucide-react';

export const AuthPage = () => {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newSchoolName, setNewSchoolName] = useState(''); // New state for school name
  const [newSchoolLocation, setNewSchoolLocation] = useState(''); // New state for school location
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState('');

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
          if (data.user) {
            // First, create the new school
            const newSchool = await createSchool(newSchoolName.trim(), newSchoolLocation.trim());
            if (!newSchool) {
              throw new Error('Failed to create school.');
            }

            try {
              await createUserProfile(data.user.id, newSchool.id, newSchool.name, 'owner');
            } catch (profileError) {
              console.error('Error creating user profile after school creation:', profileError);
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
    setNewSchoolName('');
    setNewSchoolLocation('');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-50"></div>
        
        {/* Floating Background Elements */}
        <div className="absolute top-20 left-20 animate-bounce">
          <div className="bg-yellow-200 rounded-full p-4 shadow-lg">
            <BookOpen className="h-8 w-8 text-yellow-700" />
          </div>
        </div>
        <div className="absolute top-40 right-32 animate-pulse">
          <div className="bg-blue-200 rounded-full p-3 shadow-lg">
            <GraduationCap className="h-6 w-6 text-blue-700" />
          </div>
        </div>
        <div className="absolute bottom-40 left-32 animate-bounce delay-300">
          <div className="bg-green-200 rounded-full p-3 shadow-lg">
            <Users className="h-6 w-6 text-green-700" />
          </div>
        </div>
        <div className="absolute bottom-20 right-20 animate-pulse delay-500">
          <div className="bg-purple-200 rounded-full p-4 shadow-lg">
            <MessageCircle className="h-8 w-8 text-purple-700" />
          </div>
        </div>
        <div className="absolute top-1/2 left-10 animate-bounce delay-700">
          <div className="bg-pink-200 rounded-full p-2 shadow-lg">
            <Sparkles className="h-4 w-4 text-pink-700" />
          </div>
        </div>

        {/* Main Illustration Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-center">
          <div className="mb-8">
            <div className="bg-white rounded-full p-8 shadow-2xl mb-6 transform hover:scale-105 transition-transform duration-300">
              <SchoolIcon className="h-24 w-24 text-blue-600" />
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Welcome to the Future of
              <span className="text-blue-600 block">School Management</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-md mx-auto leading-relaxed">
              Connect teachers, parents, and students in one powerful platform. 
              Streamline communication and enhance learning experiences.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-6 max-w-md">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <Users className="h-8 w-8 text-blue-600 mb-2" />
              <p className="text-sm font-semibold text-gray-700">Parent-Student Management</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <MessageCircle className="h-8 w-8 text-green-600 mb-2" />
              <p className="text-sm font-semibold text-gray-700">Instant Communication</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <BookOpen className="h-8 w-8 text-yellow-600 mb-2" />
              <p className="text-sm font-semibold text-gray-700">Academic Tracking</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <GraduationCap className="h-8 w-8 text-purple-600 mb-2" />
              <p className="text-sm font-semibold text-gray-700">Progress Analytics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-slide-in-right">
          {emailSent ? (
            /* Email Confirmation Message */
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center transform hover:scale-105 transition-transform duration-300">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-6">
                <Mail className="h-8 w-8 text-green-600 mx-auto" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Check Your Email 📧
                </h3>
                <p className="text-gray-600 mb-4">
                  We've sent a confirmation email to <strong className="text-blue-600">{userEmail}</strong>
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Please check your inbox and click the confirmation link to activate your account. 
                  Don't forget to check your spam folder if you don't see the email.
                </p>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={resendConfirmationEmail}
                  disabled={authLoading}
                  className="w-full flex justify-center py-3 px-4 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
                >
                  {authLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  ) : (
                    'Resend Confirmation Email'
                  )}
                </button>
                
                <button
                  onClick={handleBackToLogin}
                  className="w-full py-3 px-4 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          ) : (
            /* Login/Signup Form */
            <div className="bg-white rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-300">
              <div className="text-center mb-8">
                <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <SchoolIcon className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {isLogin ? 'Welcome Back! 👋' : 'Join Schoolbod Today 🎓'}
                </h2>
                <p className="text-gray-600">
                  {isLogin ? 'Sign in to manage your school community' : 'Stay connected with teachers, parents, and students.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl animate-shake">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter your email"
                    />
                    <Mail className="h-5 w-5 text-gray-400 absolute left-4 top-3.5" />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-4 py-3 pl-12 pr-12 border-2 border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter your password"
                    />
                    <Lock className="h-5 w-5 text-gray-400 absolute left-4 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <>
                    <div>
                      <label htmlFor="newSchoolName" className="block text-sm font-semibold text-gray-700 mb-2">
                        School Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="newSchoolName"
                          type="text"
                          required
                          value={newSchoolName}
                          onChange={(e) => setNewSchoolName(e.target.value)}
                          className="appearance-none block w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                          placeholder="Enter your school's name"
                        />
                        <SchoolIcon className="h-5 w-5 text-gray-400 absolute left-4 top-3.5" />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="newSchoolLocation" className="block text-sm font-semibold text-gray-700 mb-2">
                        School Location <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="newSchoolLocation"
                          type="text"
                          required
                          value={newSchoolLocation}
                          onChange={(e) => setNewSchoolLocation(e.target.value)}
                          className="appearance-none block w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200"
                          placeholder="Enter your school's location (e.g., City, State)"
                        />
                        <Users className="h-5 w-5 text-gray-400 absolute left-4 top-3.5" />
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={authLoading || (!isLogin && (!newSchoolName.trim() || !newSchoolLocation.trim()))}
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 font-bold text-lg"
                >
                  {authLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'}
                      {!isLogin && <span className="ml-2">🚀</span>}
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};