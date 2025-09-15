import { AlertCircle, CheckCircle } from 'lucide-react';

export const EnvironmentCheck = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Configuration Required</h2>
          <p className="text-gray-600 mb-6">
            Missing Supabase environment variables. Please create a <code className="bg-gray-100 px-2 py-1 rounded">.env</code> file in your project root with:
          </p>
          <div className="bg-gray-100 p-4 rounded-lg text-left text-sm font-mono">
            <div>VITE_SUPABASE_URL=your_supabase_url</div>
            <div>VITE_SUPABASE_ANON_KEY=your_supabase_anon_key</div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            After creating the .env file, restart your development server.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Configuration Complete</h2>
        <p className="text-gray-600">
          Supabase environment variables are properly configured.
        </p>
      </div>
    </div>
  );
};
