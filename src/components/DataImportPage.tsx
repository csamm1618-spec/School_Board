import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  GraduationCap,
  ArrowRight,
  Info
} from 'lucide-react';
import Papa from 'papaparse';

interface ImportRow {
  parent_name: string;
  parent_phone_number: string;
  parent_email?: string;
  parent_relationship: string;
  student_name: string;
  student_grade: string;
  student_date_of_birth?: string;
}

interface ImportResult {
  success: boolean;
  row: number;
  data: ImportRow;
  error?: string;
  parentCreated?: boolean;
  studentCreated?: boolean;
  relationshipCreated?: boolean;
}

export const DataImportPage = () => {
  const { schoolId } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setShowResults(false);
      setResults([]);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        parent_name: 'John Doe',
        parent_phone_number: '+233123456789',
        parent_email: 'john.doe@email.com',
        parent_relationship: 'Parent',
        student_name: 'Jane Doe',
        student_grade: 'P1',
        student_date_of_birth: '2015-05-15'
      },
      {
        parent_name: 'Mary Smith',
        parent_phone_number: '+233987654321',
        parent_email: '',
        parent_relationship: 'Guardian',
        student_name: 'Michael Smith',
        student_grade: 'JHS2',
        student_date_of_birth: '2010-08-22'
      }
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const processImport = async () => {
    if (!file || !schoolId) return;

    setLoading(true);
    const importResults: ImportResult[] = [];

    try {
      const text = await file.text();
      const parsed = Papa.parse<ImportRow>(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_')
      });

      if (parsed.errors.length > 0) {
        alert('CSV parsing errors detected. Please check your file format.');
        setLoading(false);
        return;
      }

      for (let i = 0; i < parsed.data.length; i++) {
        const row = parsed.data[i];
        const result: ImportResult = {
          success: false,
          row: i + 1,
          data: row,
          parentCreated: false,
          studentCreated: false,
          relationshipCreated: false
        };

        try {
          // Validate required fields
          if (!row.parent_name || !row.parent_phone_number || !row.student_name || !row.student_grade) {
            result.error = 'Missing required fields (parent_name, parent_phone_number, student_name, student_grade)';
            importResults.push(result);
            continue;
          }

          // Process Parent
          let parentId: string;
          const { data: existingParent } = await supabase
            .from('parents')
            .select('id')
            .eq('phone_number', row.parent_phone_number.trim())
            .single();

          if (existingParent) {
            parentId = existingParent.id;
          } else {
            const { data: newParent, error: parentError } = await supabase
              .from('parents')
              .insert([{
                parent_name: row.parent_name.trim(),
                phone_number: row.parent_phone_number.trim(),
                email: row.parent_email?.trim() || null,
                relationship: row.parent_relationship?.trim() || 'Parent',
                school_id: schoolId
              }])
              .select('id')
              .single();

            if (parentError) throw parentError;
            parentId = newParent.id;
            result.parentCreated = true;
          }

          // Process Student
          let studentId: string;
          const { data: existingStudent } = await supabase
            .from('students')
            .select('id')
            .eq('student_name', row.student_name.trim())
            .eq('grade', row.student_grade.trim())
            .single();

          if (existingStudent) {
            studentId = existingStudent.id;
          } else {
            const { data: newStudent, error: studentError } = await supabase
              .from('students')
              .insert([{
                student_name: row.student_name.trim(),
                grade: row.student_grade.trim(),
            date_of_birth: row.student_date_of_birth?.trim() || null,
            school_id: schoolId
              }])
              .select('id')
              .single();

            if (studentError) throw studentError;
            studentId = newStudent.id;
            result.studentCreated = true;
          }

          // Create Parent-Student Relationship
          const { data: existingRelation } = await supabase
            .from('parent_student')
            .select('id')
            .eq('parent_id', parentId)
            .eq('student_id', studentId)
            .single();

          if (!existingRelation) {
            const { error: relationError } = await supabase
              .from('parent_student')
              .insert([{
                parent_id: parentId,
           student_id: studentId,
           school_id: schoolId
              }]);

            if (relationError) throw relationError;
            result.relationshipCreated = true;
          }

          result.success = true;
        } catch (error: any) {
          result.error = error.message;
        }

        importResults.push(result);
      }

      setResults(importResults);
      setShowResults(true);
    } catch (error: any) {
      alert(`Import failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetImport = () => {
    setFile(null);
    setResults([]);
    setShowResults(false);
  };

  const successfulImports = results.filter(r => r.success).length;
  const failedImports = results.filter(r => !r.success).length;
  const parentsCreated = results.filter(r => r.parentCreated).length;
  const studentsCreated = results.filter(r => r.studentCreated).length;
  const relationshipsCreated = results.filter(r => r.relationshipCreated).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Data Import</h1>
          <p className="text-gray-600 mt-2">Import parent and student data from CSV files</p>
        </div>

        {!showResults ? (
          <div className="space-y-8">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <Info className="h-6 w-6 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Import Instructions</h3>
                  <ul className="text-blue-800 space-y-1 text-sm">
                    <li>• Your CSV file should contain columns for both parent and student information</li>
                    <li>• Required columns: parent_name, parent_phone_number, student_name, student_grade</li>
                    <li>• Optional columns: parent_email, parent_relationship, student_date_of_birth</li>
                    <li>• The system will automatically handle duplicates and create relationships</li>
                    <li>• Download the template below to see the exact format required</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Template Download */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Download Template</h2>
              <p className="text-gray-600 mb-4">
                Download a sample CSV template with the correct format and example data.
              </p>
              <button
                onClick={downloadTemplate}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-5 w-5" />
                <span>Download CSV Template</span>
              </button>
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload CSV File</h2>
              
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {file ? file.name : 'Drop your CSV file here or click to browse'}
                </p>
                <p className="text-gray-500 mb-4">
                  Supports CSV files up to 10MB
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  <FileText className="h-5 w-5" />
                  <span>Choose File</span>
                </label>
              </div>

              {file && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={processImport}
                      disabled={loading}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <ArrowRight className="h-5 w-5" />
                          <span>Start Import</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Results */
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <Upload className="h-8 w-8 text-green-600 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Complete</h2>
              <p className="text-gray-600">Here are the results of your data import</p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <FileText className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xl font-bold text-blue-600">{results.length}</p>
                <p className="text-blue-700 text-sm">Total Rows</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-xl font-bold text-green-600">{successfulImports}</p>
                <p className="text-green-700 text-sm">Successful</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <AlertCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                <p className="text-xl font-bold text-red-600">{failedImports}</p>
                <p className="text-red-700 text-sm">Failed</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-xl font-bold text-purple-600">{parentsCreated}</p>
                <p className="text-purple-700 text-sm">New Parents</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <GraduationCap className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                <p className="text-xl font-bold text-yellow-600">{studentsCreated}</p>
                <p className="text-yellow-700 text-sm">New Students</p>
              </div>
            </div>

            {/* Failed Imports */}
            {failedImports > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Failed Imports</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {results.filter(r => !r.success).map((result, index) => (
                    <div key={index} className="flex items-start justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Row {result.row}: {result.data.parent_name} → {result.data.student_name}
                          </p>
                          <p className="text-sm text-red-600">{result.error}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={resetImport}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Import Another File
              </button>
              <Link
                to="/dashboard"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};