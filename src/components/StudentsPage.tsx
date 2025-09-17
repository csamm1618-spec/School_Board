import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { Search, Download, GraduationCap, Calendar, Users, AlertCircle, ArrowUp, CheckCircle, XCircle } from 'lucide-react';
import Papa from 'papaparse';

export const StudentsPage = () => {
  const { schoolId } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [newGradeToPromote, setNewGradeToPromote] = useState('');
  const [isPromoting, setIsPromoting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const grades = ['All', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'JHS1', 'JHS2', 'JHS3'];

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, selectedGrade, students]);

  const loadStudents = async () => {
    if (!schoolId) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          school:schools(name),
          parent_student(
            parent:parents(*, school:schools(name))
          )
        `)
        .eq('school_id', schoolId)
        .order('student_name');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(student =>
        student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.grade.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by grade
    if (selectedGrade && selectedGrade !== 'All') {
      filtered = filtered.filter(student => student.grade === selectedGrade);
    }

    setFilteredStudents(filtered);
  };

  const exportToCSV = () => {
    const csvData = filteredStudents.map(student => ({
      'Student Name': student.student_name,
      'Grade': student.grade,
      'Date of Birth': student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : '',
      'Parents': student.parent_student.map((ps: any) => ps.parent?.parent_name).join(', '),
      'Parent Phones': student.parent_student.map((ps: any) => ps.parent?.phone_number).join(', '),
      'Created At': new Date(student.created_at).toLocaleDateString()
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_records.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStudentSelection = (studentId: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map(student => student.id));
    }
  };

  const handlePromoteStudents = async () => {
    if (!newGradeToPromote || selectedStudentIds.length === 0) return;

    setIsPromoting(true);
    setMessage('');
    setMessageType('');

    try {
      const { error } = await supabase
        .from('students')
        .update({ grade: newGradeToPromote })
        .in('id', selectedStudentIds);

      if (error) throw error;

      setMessage(`Successfully promoted ${selectedStudentIds.length} student(s) to ${newGradeToPromote}`);
      setMessageType('success');
      setSelectedStudentIds([]);
      setNewGradeToPromote('');
      await loadStudents();
    } catch (error: any) {
      setMessage(`Failed to promote students: ${error.message}`);
      setMessageType('error');
    } finally {
      setIsPromoting(false);
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    }
  };

  const getGradeStats = () => {
    const stats: { [key: string]: number } = {};
    students.forEach(student => {
      stats[student.grade] = (stats[student.grade] || 0) + 1;
    });
    return stats;
  };

  // Allow page to render even if schoolId is missing, showing empty states

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const gradeStats = getGradeStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Students Directory</h1>
          <p className="text-gray-600 mt-2">Manage and view all student records</p>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search students by name or grade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                {grades.map((grade) => (
                  <option key={grade} value={grade === 'All' ? '' : grade}>
                    {grade === 'All' ? 'All Grades' : grade}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-5 w-5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Promotion Controls */}
        {selectedStudentIds.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-blue-500">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <ArrowUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Promote {selectedStudentIds.length} Selected Student{selectedStudentIds.length > 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Move selected students to a new grade level
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={newGradeToPromote}
                  onChange={(e) => setNewGradeToPromote(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select new grade</option>
                  {grades.filter(grade => grade !== 'All').map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handlePromoteStudents}
                  disabled={!newGradeToPromote || selectedStudentIds.length === 0 || isPromoting}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isPromoting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Promoting...</span>
                    </>
                  ) : (
                    <>
                      <ArrowUp className="h-4 w-4" />
                      <span>Promote Students</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

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
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              <p className={`font-medium ${
                messageType === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message}
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-yellow-600">{students.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <Search className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Filtered Results</p>
                <p className="text-2xl font-bold text-green-600">{filteredStudents.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">With DOB</p>
                <p className="text-2xl font-bold text-blue-600">
                  {students.filter(s => s.date_of_birth).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Most Popular Grade</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Object.keys(gradeStats).length > 0 
                    ? Object.keys(gradeStats).reduce((a, b) => gradeStats[a] > gradeStats[b] ? a : b)
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date of Birth
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent(s)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.includes(student.id)}
                          onChange={() => handleStudentSelection(student.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                            <GraduationCap className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {student.student_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Enrolled {new Date(student.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {student.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>
                            {student.date_of_birth 
                              ? new Date(student.date_of_birth).toLocaleDateString()
                              : 'Not provided'
                            }
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="space-y-1">
                          {student.parent_student.map((ps: any) => (
                            <div key={ps.id} className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">{ps.parent?.parent_name}</span>
                              <span className="text-gray-500">({ps.parent?.phone_number})</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {searchTerm || selectedGrade ? 'No students found matching your criteria' : 'No students registered yet'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};