import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Parent, Student, ParentStudent } from '../lib/supabaseClient';
import { 
  Users, 
  GraduationCap, 
  UserPlus, 
  Download, 
  MessageSquare,
  Upload,
  TrendingUp,
  Clock
} from 'lucide-react';
import Papa from 'papaparse';

export const Dashboard = () => {
  const [stats, setStats] = useState({
    totalParents: 0,
    totalStudents: 0,
    recentOnboardings: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get parent count
      const { count: parentCount } = await supabase
        .from('parents')
        .select('*', { count: 'exact', head: true });

      // Get student count
      const { count: studentCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      // Get recent onboardings
      const { data: recentOnboardings } = await supabase
        .from('parent_student')
        .select(`
          *,
          parent:parents(*),
          student:students(*)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalParents: parentCount || 0,
        totalStudents: studentCount || 0,
        recentOnboardings: recentOnboardings || []
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadParentContacts = async () => {
    try {
      const { data: parents } = await supabase
        .from('parents')
        .select('*')
        .order('parent_name');

      if (parents) {
        const csv = Papa.unparse(parents);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'parent_contacts.csv';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading parent contacts:', error);
    }
  };

  const downloadStudentRecords = async () => {
    try {
      const { data: students } = await supabase
        .from('students')
        .select('*')
        .order('student_name');

      if (students) {
        const csv = Papa.unparse(students);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'student_records.csv';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading student records:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to your school management hub</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Parents</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalParents}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.totalStudents}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <GraduationCap className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Families</p>
                <p className="text-3xl font-bold text-green-600">{stats.recentOnboardings.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                <p className="text-3xl font-bold text-purple-600">{stats.recentOnboardings.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/onboarding"
              className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <UserPlus className="h-6 w-6 text-blue-600" />
              <span className="font-medium text-blue-700">Onboard Parent & Student</span>
            </Link>

            <button
              onClick={downloadParentContacts}
              className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
            >
              <Download className="h-6 w-6 text-green-600" />
              <span className="font-medium text-green-700">Download Parent Contacts</span>
            </button>

            <button
              onClick={downloadStudentRecords}
              className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors border border-yellow-200"
            >
              <Download className="h-6 w-6 text-yellow-600" />
              <span className="font-medium text-yellow-700">Download Student Records</span>
            </button>

            <Link
              to="/sms"
              className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
            >
              <MessageSquare className="h-6 w-6 text-purple-600" />
              <span className="font-medium text-purple-700">Send Bulk SMS</span>
            </Link>

            <Link
              to="/import"
              className="flex items-center space-x-3 p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200"
            >
              <Upload className="h-6 w-6 text-indigo-600" />
              <span className="font-medium text-indigo-700">Import Data</span>
            </Link>
          </div>
        </div>

        {/* Recent Onboardings */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Onboardings</h2>
          {stats.recentOnboardings.length > 0 ? (
            <div className="space-y-4">
              {stats.recentOnboardings.map((onboarding) => (
                <div key={onboarding.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {onboarding.parent?.parent_name} → {onboarding.student?.student_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Grade: {onboarding.student?.grade} | Phone: {onboarding.parent?.phone_number}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(onboarding.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recent onboardings</p>
              <Link to="/onboarding" className="text-blue-600 hover:text-blue-700 font-medium">
                Create your first onboarding
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};