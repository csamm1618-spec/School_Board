import { useState, useEffect } from 'react';
import { supabase, Parent } from '../lib/supabaseClient';
import { Search, Download, Users, Phone, Mail } from 'lucide-react';
import Papa from 'papaparse';

export const ParentsPage = () => {
  const [parents, setParents] = useState<any[]>([]);
  const [filteredParents, setFilteredParents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadParents();
  }, []);

  useEffect(() => {
    filterParents();
  }, [searchTerm, parents]);

  const loadParents = async () => {
    try {
      const { data, error } = await supabase
        .from('parents')
        .select(`
          *,
          parent_student(
            student:students(*)
          )
        `)
        .order('parent_name');

      if (error) throw error;
      setParents(data || []);
    } catch (error) {
      console.error('Error loading parents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterParents = () => {
    if (!searchTerm.trim()) {
      setFilteredParents(parents);
      return;
    }

    const filtered = parents.filter(parent =>
      parent.parent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.phone_number.includes(searchTerm) ||
      (parent.email && parent.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredParents(filtered);
  };

  const exportToCSV = () => {
    const csvData = filteredParents.map(parent => ({
      'Parent Name': parent.parent_name,
      'Phone Number': parent.phone_number,
      'Email': parent.email || '',
      'Relationship': parent.relationship,
      'Students': parent.parent_student.map((ps: any) => ps.student?.student_name).join(', '),
      'Created At': new Date(parent.created_at).toLocaleDateString()
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parent_contacts.csv';
    a.click();
    URL.revokeObjectURL(url);
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
          <h1 className="text-3xl font-bold text-gray-900">Parents Directory</h1>
          <p className="text-gray-600 mt-2">Manage and view all parent contacts</p>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search parents by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Parents</p>
                <p className="text-2xl font-bold text-blue-600">{parents.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <Search className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Filtered Results</p>
                <p className="text-2xl font-bold text-green-600">{filteredParents.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <Mail className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">With Email</p>
                <p className="text-2xl font-bold text-purple-600">
                  {parents.filter(p => p.email).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Parents Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Relationship
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Students
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredParents.length > 0 ? (
                  filteredParents.map((parent) => (
                    <tr key={parent.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {parent.parent_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Joined {new Date(parent.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{parent.phone_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{parent.email || 'Not provided'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {parent.relationship}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {parent.parent_student.map((ps: any, index: number) => (
                          <div key={ps.id} className="flex items-center space-x-2">
                            {index > 0 && <span className="text-gray-400">•</span>}
                            <span>{ps.student?.student_name}</span>
                            <span className="text-xs text-gray-500">({ps.student?.grade})</span>
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {searchTerm ? 'No parents found matching your search' : 'No parents registered yet'}
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