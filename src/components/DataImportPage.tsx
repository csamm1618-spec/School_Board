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
  const [processed, setProcessed] = useState(0);
  const [total, setTotal] = useState(0);
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
      const rows = parsed.data;
      setTotal(rows.length);
      setProcessed(0);

      // Normalize rows and pre‑validate
      const normalized = rows.map((r) => ({
        parent_name: (r.parent_name || '').trim(),
        parent_phone_number: (r.parent_phone_number || '').trim(),
        parent_email: (r.parent_email || '').trim(),
        parent_relationship: (r.parent_relationship || 'Parent').trim() || 'Parent',
        student_name: (r.student_name || '').trim(),
        student_grade: (r.student_grade || '').trim(),
        student_date_of_birth: (r.student_date_of_birth || '').trim(),
      }));

      // Seed results
      for (let i = 0; i < normalized.length; i++) {
        importResults.push({
          success: false,
          row: i + 1,
          data: rows[i],
          parentCreated: false,
          studentCreated: false,
          relationshipCreated: false,
        });
      }

      // Collect unique keys
      const parentPhones = Array.from(
        new Set(
          normalized
            .filter(r => r.parent_name && r.parent_phone_number && r.student_name && r.student_grade)
            .map(r => r.parent_phone_number)
        )
      );
      const studentNames = Array.from(new Set(normalized.map(r => r.student_name).filter(Boolean)));
      const studentGrades = Array.from(new Set(normalized.map(r => r.student_grade).filter(Boolean)));
      const studentKey = (n: string, g: string) => `${n}||${g}`;

      // Helper chunker
      const chunk = <T,>(arr: T[], size = 200): T[][] => {
        const out: T[][] = [];
        for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
        return out;
      };

      // 1) Existing parents map
      const parentMap = new Map<string, string>(); // phone -> id
      for (const c of chunk(parentPhones)) {
        if (c.length === 0) continue;
        const { data, error } = await supabase
          .from('parents')
          .select('id, phone_number')
          .eq('school_id', schoolId)
          .in('phone_number', c);
        if (error) throw error;
        (data || []).forEach((p: any) => parentMap.set(p.phone_number, p.id));
      }

      // 2) Insert missing parents in chunks
      const createdParentPhones = new Set<string>();
      const missingParents = normalized
        .filter(r => r.parent_name && r.parent_phone_number && !parentMap.has(r.parent_phone_number))
        .reduce((acc: any[], r) => {
          if (!acc.some((x) => x.phone_number === r.parent_phone_number)) {
            acc.push({
              parent_name: r.parent_name,
              phone_number: r.parent_phone_number,
              email: r.parent_email || null,
              relationship: r.parent_relationship || 'Parent',
              school_id: schoolId,
            });
          }
          return acc;
        }, [] as any[]);
      for (const c of chunk(missingParents)) {
        if (c.length === 0) continue;
        const { data, error } = await supabase
          .from('parents')
          .insert(c)
          .select('id, phone_number');
        if (error) throw error;
        (data || []).forEach((p: any) => {
          parentMap.set(p.phone_number, p.id);
          createdParentPhones.add(p.phone_number);
        });
      }

      // 3) Existing students map (name+grade within this school)
      const studentMap = new Map<string, string>(); // key -> id
      if (studentNames.length && studentGrades.length) {
        const { data, error } = await supabase
          .from('students')
          .select('id, student_name, grade')
          .eq('school_id', schoolId)
          .in('student_name', studentNames)
          .in('grade', studentGrades);
        if (error) throw error;
        (data || []).forEach((s: any) => studentMap.set(studentKey(s.student_name, s.grade), s.id));
      }

      // 4) Insert missing students in chunks
      const createdStudentKeys = new Set<string>();
      const missingStudents: any[] = [];
      const seenStudentKey = new Set<string>();
      normalized.forEach(r => {
        const key = studentKey(r.student_name, r.student_grade);
        if (!r.student_name || !r.student_grade) return;
        if (studentMap.has(key)) return;
        if (seenStudentKey.has(key)) return;
        seenStudentKey.add(key);
        missingStudents.push({
          student_name: r.student_name,
          grade: r.student_grade,
          date_of_birth: r.student_date_of_birth || null,
          school_id: schoolId,
        });
      });
      for (const c of chunk(missingStudents)) {
        if (c.length === 0) continue;
        const { data, error } = await supabase
          .from('students')
          .insert(c)
          .select('id, student_name, grade');
        if (error) throw error;
        (data || []).forEach((s: any) => {
          const key = studentKey(s.student_name, s.grade);
          studentMap.set(key, s.id);
          createdStudentKeys.add(key);
        });
      }

      // 5) Existing relationships
      const pairKey = (p: string, s: string) => `${p}|${s}`;
      const parentIds = Array.from(new Set(normalized
        .map(r => parentMap.get(r.parent_phone_number))
        .filter(Boolean) as string[]));
      const studentIds = Array.from(new Set(normalized
        .map(r => studentMap.get(studentKey(r.student_name, r.student_grade)))
        .filter(Boolean) as string[]));
      const existingPairs = new Set<string>();
      if (parentIds.length && studentIds.length) {
        const { data, error } = await supabase
          .from('parent_student')
          .select('parent_id, student_id')
          .eq('school_id', schoolId)
          .in('parent_id', parentIds)
          .in('student_id', studentIds);
        if (error) throw error;
        (data || []).forEach((ps: any) => existingPairs.add(pairKey(ps.parent_id, ps.student_id)));
      }

      // 6) Insert missing relationships
      const createdPairs = new Set<string>();
      const relInserts: any[] = [];
      normalized.forEach(r => {
        const pid = parentMap.get(r.parent_phone_number);
        const sid = studentMap.get(studentKey(r.student_name, r.student_grade));
        if (!pid || !sid) return;
        const k = pairKey(pid, sid);
        if (existingPairs.has(k)) return;
        existingPairs.add(k);
        createdPairs.add(k);
        relInserts.push({ parent_id: pid, student_id: sid, school_id: schoolId });
      });
      for (const c of chunk(relInserts)) {
        if (c.length === 0) continue;
        const { error } = await supabase.from('parent_student').insert(c);
        if (error) throw error;
      }

      // 7) Build per-row results and progress
      for (let i = 0; i < normalized.length; i++) {
        const r = normalized[i];
        const res = importResults[i];
        if (!r.parent_name || !r.parent_phone_number || !r.student_name || !r.student_grade) {
          res.error = 'Missing required fields (parent_name, parent_phone_number, student_name, student_grade)';
        } else {
          const pid = parentMap.get(r.parent_phone_number);
          const skey = studentKey(r.student_name, r.student_grade);
          const sid = studentMap.get(skey);
          if (!pid || !sid) {
            res.error = 'Failed to resolve parent or student ID after insert.';
          } else {
            res.parentCreated = createdParentPhones.has(r.parent_phone_number);
            res.studentCreated = createdStudentKeys.has(skey);
            res.relationshipCreated = createdPairs.has(pairKey(pid, sid));
            res.success = true;
          }
        }
        setProcessed(i + 1);
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
              {loading && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: total ? `${Math.round((processed / total) * 100)}%` : '0%' }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Processing {processed} of {total} rows
                  </p>
                </div>
              )}
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
                            Row {result.row}: {result.data.parent_name} + {result.data.student_name}
                          </p>
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

