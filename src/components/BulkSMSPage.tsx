import { useState, useEffect } from 'react';
import { supabase, sendBulkSMSStrict as sendBulkSMS } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { MessageSquare, Users, Send, CheckCircle, AlertCircle } from 'lucide-react';

export const BulkSMSPage = () => {
  const { schoolId } = useAuth();
  const [message, setMessage] = useState('');
  const [sendToAll, setSendToAll] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [parents, setParents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const grades = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'JHS1', 'JHS2', 'JHS3'];

  useEffect(() => {
    loadParents();
  }, [schoolId]);

  const loadParents = async () => {
    if (!schoolId) {
      setParents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('parents')
        .select(`
          *,
          school:schools(name),
          parent_student(
            student:students(*, school:schools(name))
          )
        `)
        .eq('school_id', schoolId)
        .order('parent_name');

      if (error) throw error;
      setParents(data || []);
    } catch (error) {
      console.error('Error loading parents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTargetParents = () => {
    if (sendToAll) {
      return parents;
    }

    return parents.filter(parent =>
      parent.parent_student.some((ps: any) => ps.student?.grade === selectedGrade)
    );
  };

  const handleSendSMS = async () => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    const targetParents = getTargetParents();
    if (targetParents.length === 0) {
      alert('No parents to send SMS to');
      return;
    }

    setLoading(true);
    setResults([]);
    setShowResults(false);

    try {
      const phoneNumbers = targetParents.map(parent => parent.phone_number);
      const responses = await sendBulkSMS(phoneNumbers, message);
      
      const processedResults = responses.map((response, index) => ({
        parent: targetParents[index],
        success: response.status === 'fulfilled',
        error: response.status === 'rejected' ? response.reason : null
      }));

      setResults(processedResults);
      setShowResults(true);
    } catch (error) {
      console.error('Error sending bulk SMS:', error);
      alert('Failed to send SMS messages');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMessage('');
    setSendToAll(true);
    setSelectedGrade('');
    setResults([]);
    setShowResults(false);
  };

  const targetParents = getTargetParents();
  const successfulSends = results.filter(r => r.success).length;
  const failedSends = results.filter(r => !r.success).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Bulk SMS Messaging</h1>
          <p className="text-gray-600 mt-2">Send messages to parents instantly</p>
        </div>

        {!showResults ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Target Selection */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Recipients</h2>
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    checked={sendToAll}
                    onChange={() => setSendToAll(true)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-900">Send to all parents ({parents.length} recipients)</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    checked={!sendToAll}
                    onChange={() => setSendToAll(false)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-900">Send to parents of specific grade</span>
                </label>

                {!sendToAll && (
                  <div className="ml-7">
                    <select
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select grade</option>
                      {grades.map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Target Count */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-blue-700 font-medium">
                    {targetParents.length} parent(s) will receive this message
                  </span>
                </div>
              </div>
            </div>

            {/* Message Input */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Content
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Type your message here... Keep it clear and concise for better engagement."
              />
              <p className="text-sm text-gray-500 mt-2">
                Characters: {message.length}/160 (SMS messages are typically 160 characters)
              </p>
            </div>

            {/* Preview */}
            {message.trim() && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Message Preview:</h3>
                <div className="bg-white p-3 rounded border border-gray-200 text-sm">
                  {message}
                </div>
              </div>
            )}

            {/* Send Button */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleSendSMS}
                disabled={loading || !message.trim() || targetParents.length === 0}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Send SMS to {targetParents.length} parent(s)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Results */
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-green-600 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">SMS Campaign Complete</h2>
              <p className="text-gray-600">Here are the results of your bulk SMS campaign</p>
            </div>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{results.length}</p>
                <p className="text-blue-700">Total Sent</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{successfulSends}</p>
                <p className="text-green-700">Successful</p>
              </div>
              <div className="bg-red-50 p-6 rounded-lg text-center">
                <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">{failedSends}</p>
                <p className="text-red-700">Failed</p>
              </div>
            </div>

            {/* Detailed Results */}
            {failedSends > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Failed Deliveries</h3>
                <div className="space-y-2">
                  {results.filter(r => !r.success).map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <span className="font-medium text-gray-900">{result.parent.parent_name}</span>
                        <span className="text-gray-600">{result.parent.phone_number}</span>
                      </div>
                      <span className="text-sm text-red-600">Failed to deliver</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={resetForm}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send Another Message
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
