import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, sendWelcomeSMS } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { UserPlus, Users, GraduationCap, Phone, Mail, User, Calendar } from 'lucide-react';

export const OnboardingForm = () => {
  const { schoolId } = useAuth();
  const [parentData, setParentData] = useState({
    parent_name: '',
    phone_number: '',
    email: '',
    relationship: 'Parent'
  });

  const [studentData, setStudentData] = useState({
    student_name: '',
    grade: '',
    date_of_birth: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const relationships = ['Parent', 'Guardian', 'Other'];
  const grades = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'JHS1', 'JHS2', 'JHS3'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!schoolId) {
      setError('School information not available. Please try logging in again.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Insert parent
      const { data: parent, error: parentError } = await supabase
        .from('parents')
        .insert([{ ...parentData, school_id: schoolId }])
        .select()
        .single();

      if (parentError) throw parentError;

      // Insert student
      const { data: student, error: studentError } = await supabase
        .from('students')
        .insert([{
          ...studentData,
          date_of_birth: studentData.date_of_birth || null,
          school_id: schoolId
        }])
        .select()
        .single();

      if (studentError) throw studentError;

      // Link parent and student
      const { error: linkError } = await supabase
        .from('parent_student')
        .insert([{
          parent_id: parent.id,
          student_id: student.id,
          school_id: schoolId
        }]);

      if (linkError) throw linkError;

      // Send welcome SMS
      try {
        await sendWelcomeSMS(parent.parent_name, parent.phone_number);
      } catch (smsError) {
        console.error('SMS sending failed:', smsError);
        // Don't fail the whole process if SMS fails
      }

      setSuccess(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setParentData({
      parent_name: '',
      phone_number: '',
      email: '',
      relationship: 'Parent'
    });
    setStudentData({
      student_name: '',
      grade: '',
      date_of_birth: ''
    });
    setSuccess(false);
    setError('');
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-6">
              <UserPlus className="h-8 w-8 text-green-600 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Onboarding Successful!</h2>
            <p className="text-gray-600 mb-6">
              {parentData.parent_name} and {studentData.student_name} have been successfully onboarded. 
              A welcome SMS has been sent to {parentData.phone_number}.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={resetForm}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Onboard Another
              </button>
              <Link
                to="/dashboard"
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Parent & Student Onboarding</h1>
          <p className="text-gray-600 mt-2">Register new families into our school community</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Parent Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Parent Information</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={parentData.parent_name}
                    onChange={(e) => setParentData({ ...parentData, parent_name: e.target.value })}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter parent's full name"
                  />
                  <User className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={parentData.phone_number}
                    onChange={(e) => setParentData({ ...parentData, phone_number: e.target.value })}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                  <Phone className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Optional)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={parentData.email}
                    onChange={(e) => setParentData({ ...parentData, email: e.target.value })}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                  <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship
                </label>
                <select
                  value={parentData.relationship}
                  onChange={(e) => setParentData({ ...parentData, relationship: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {relationships.map((relationship) => (
                    <option key={relationship} value={relationship}>
                      {relationship}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Student Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="h-6 w-6 text-yellow-600" />
                <h2 className="text-xl font-semibold text-gray-900">Student Information</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={studentData.student_name}
                    onChange={(e) => setStudentData({ ...studentData, student_name: e.target.value })}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Enter student's full name"
                  />
                  <User className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade/Class <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={studentData.grade}
                  onChange={(e) => setStudentData({ ...studentData, grade: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">Select grade/class</option>
                  {grades.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth (Optional)
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={studentData.date_of_birth}
                    onChange={(e) => setStudentData({ ...studentData, date_of_birth: e.target.value })}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                  <Calendar className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <Link
              to="/dashboard"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Onboarding...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  <span>Complete Onboarding</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};