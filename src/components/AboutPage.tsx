import { Link } from 'react-router-dom';
import { 
  School, 
  UserPlus, 
  MessageSquare, 
  Shield, 
  Clock, 
  Users,
  Star,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <School className="h-16 w-16 mx-auto mb-8 text-yellow-400" />
            <h1 className="text-5xl font-bold mb-6">Welcome to School Board 🎓</h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto text-blue-100">
              Streamline your school's parent and student management with our comprehensive 
              digital platform. Built for educators, designed for efficiency.
            </p>
            <Link
              to="/onboarding"
              className="inline-flex items-center space-x-2 bg-yellow-500 text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-400 transition-colors"
            >
              <UserPlus className="h-6 w-6" />
              <span>Get Started Today!</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your school community efficiently and effectively.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-6">
                <UserPlus className="h-8 w-8 text-blue-600 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Easy Onboarding</h3>
              <p className="text-gray-600">
                Streamlined registration process for parents and students. Collect all necessary 
                information in one simple form and automatically send welcome messages.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="bg-yellow-100 p-4 rounded-full w-16 h-16 mx-auto mb-6">
                <MessageSquare className="h-8 w-8 text-yellow-600 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Instant SMS</h3>
              <p className="text-gray-600">
                Send bulk SMS messages to all parents or target specific grades. Keep your 
                school community informed with important announcements and updates.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-6">
                <Shield className="h-8 w-8 text-green-600 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Secure Data</h3>
              <p className="text-gray-600">
                Your data is protected with enterprise-grade security. Role-based access control 
                ensures only authorized personnel can access sensitive information.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Schools Choose School Board</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Clock className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Reduce Admin Workload</h3>
                    <p className="text-gray-600">
                      Automate repetitive tasks and spend more time focusing on what matters most - education.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Users className="h-6 w-6 text-yellow-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Better Parent Communication</h3>
                    <p className="text-gray-600">
                      Keep parents engaged and informed with instant messaging and regular updates.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Organized Records</h3>
                    <p className="text-gray-600">
                      All student and parent information organized in one central, searchable database.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-yellow-50 rounded-xl p-8">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600">50+</div>
                  <div className="text-gray-600">Schools Trust Us</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-600">10K+</div>
                  <div className="text-gray-600">Parents Onboarded</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">99.9%</div>
                  <div className="text-gray-600">Uptime</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600">24/7</div>
                  <div className="text-gray-600">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Educators Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real feedback from school administrators who use School Board daily.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "School Board has transformed how we manage our parent community. The SMS feature alone 
                has improved our communication tremendously."
              </p>
              <div className="font-medium text-gray-900">Dr. Sarah Johnson</div>
              <div className="text-sm text-gray-500">Principal, Greenwood Elementary</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "The onboarding process is so smooth. Parents love how easy it is to register, 
                and we love the automatic welcome messages."
              </p>
              <div className="font-medium text-gray-900">Michael Chen</div>
              <div className="text-sm text-gray-500">Administrator, Riverside High</div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Data security was our biggest concern, but School Board's robust security features 
                gave us complete peace of mind."
              </p>
              <div className="font-medium text-gray-900">Lisa Rodriguez</div>
              <div className="text-sm text-gray-500">IT Director, Central Schools</div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get started with School Board in three simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 relative">
                <UserPlus className="h-8 w-8 text-blue-600 mx-auto" />
                <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-sm w-6 h-6 rounded-full flex items-center justify-center font-bold">
                  1
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Onboard</h3>
              <p className="text-gray-600">
                Use our simple form to register parents and students. Collect all necessary 
                information in one streamlined process.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 relative">
                <Shield className="h-8 w-8 text-yellow-600 mx-auto" />
                <div className="absolute -top-2 -right-2 bg-yellow-600 text-white text-sm w-6 h-6 rounded-full flex items-center justify-center font-bold">
                  2
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Saved</h3>
              <p className="text-gray-600">
                All data is securely stored and organized in our cloud database. Access your 
                information anytime, anywhere.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-6 relative">
                <MessageSquare className="h-8 w-8 text-green-600 mx-auto" />
                <div className="absolute -top-2 -right-2 bg-green-600 text-white text-sm w-6 h-6 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">SMS</h3>
              <p className="text-gray-600">
                Send welcome messages automatically and communicate with your community 
                through targeted SMS campaigns.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your School Management?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join hundreds of schools already using School Board to streamline their operations 
            and improve parent communication.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/onboarding"
              className="inline-flex items-center space-x-2 bg-yellow-500 text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-400 transition-colors"
            >
              <UserPlus className="h-6 w-6" />
              <span>Start Onboarding</span>
              <ArrowRight className="h-6 w-6" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-800 transition-colors"
            >
              <School className="h-6 w-6" />
              <span>View Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};