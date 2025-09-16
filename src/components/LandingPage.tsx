import { Link } from 'react-router-dom';
import { 
  School, 
  Users, 
  MessageSquare, 
  Upload, 
  GraduationCap, 
  CheckCircle, 
  ArrowRight,
  Star,
  Shield,
  Clock,
  BarChart3
} from 'lucide-react';

export const LandingPage = () => {
  const features = [
    {
      icon: Users,
      title: "Parent-Student Onboarding",
      description: "Quickly register new families and link parents to their children with ease. Streamline enrollment with automated welcome messages."
    },
    {
      icon: MessageSquare,
      title: "Bulk SMS Communication",
      description: "Send important announcements and updates to all parents or specific grades instantly. Keep your school community connected."
    },
    {
      icon: GraduationCap,
      title: "Student & Parent Directories",
      description: "Maintain organized, searchable records of all students and their associated parents. Access information when you need it."
    },
    {
      icon: Upload,
      title: "Data Import/Export",
      description: "Seamlessly migrate existing data and generate reports for analysis. No data left behind, complete control over your information."
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Track enrollment trends, communication effectiveness, and school growth with comprehensive dashboards and reports."
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Your school's data is protected with enterprise-grade security. Role-based access ensures the right people see the right information."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Sign Up",
      description: "Create your school's account in minutes. Set up your profile and customize your settings."
    },
    {
      number: "02",
      title: "Import Data",
      description: "Easily add your existing student and parent information using our CSV import tool or manual entry."
    },
    {
      number: "03",
      title: "Start Managing",
      description: "Access dashboards, send messages, and streamline operations. Your school management made simple."
    }
  ];

  const testimonials = [
    {
      quote: "School Board has transformed how we manage our student data and communicate with parents. It's a game-changer!",
      author: "Sarah Johnson",
      title: "Principal",
      school: "Greenwood Elementary"
    },
    {
      quote: "The bulk SMS feature alone has saved us hours every week. Parents are more engaged than ever before.",
      author: "Michael Chen",
      title: "Administrator",
      school: "Riverside High School"
    },
    {
      quote: "Finally, a system that actually works for schools. The onboarding process is so smooth and intuitive.",
      author: "Dr. Amina Osei",
      title: "Headmistress",
      school: "Unity International School"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-yellow-50 pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="bg-blue-600 p-4 rounded-2xl shadow-lg">
                <School className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Streamline School Management,
              <span className="text-blue-600 block">Empower Educators</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Our all-in-one platform simplifies student records, parent communication, and administrative tasks for a thriving school community. Join hundreds of schools already transforming their operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/auth"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <button className="text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors border-2 border-blue-600 hover:border-blue-700">
                Watch Demo
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              ✨ No credit card required • Set up in under 5 minutes
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your School
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed specifically for educational institutions, from small schools to large academies.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const featureImages = [
                "https://images.pexels.com/photos/8613200/pexels-photo-8613200.jpeg?auto=compress&cs=tinysrgb&w=400", // Parent-Student Onboarding
                "https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=400", // Bulk SMS Communication
                "https://images.pexels.com/photos/8613097/pexels-photo-8613097.jpeg?auto=compress&cs=tinysrgb&w=400", // Student & Parent Directories
                "https://images.pexels.com/photos/590016/pexels-photo-590016.jpg?auto=compress&cs=tinysrgb&w=400", // Data Import/Export
                "https://images.pexels.com/photos/590022/pexels-photo-590022.jpg?auto=compress&cs=tinysrgb&w=400", // Analytics & Insights
                "https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=400" // Secure & Reliable
              ];
              
              return (
                <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div className="mb-6">
                    <img
                      src={featureImages[index]}
                      alt={feature.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg w-fit mb-6">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From setup to full operation, we've made it incredibly easy to get your school management system running.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="mb-6">
                  <img
                    src={index === 0 
                      ? "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=400"
                      : index === 1 
                      ? "https://images.pexels.com/photos/590020/pexels-photo-590020.jpg?auto=compress&cs=tinysrgb&w=400"
                      : "https://images.pexels.com/photos/8613204/pexels-photo-8613204.jpeg?auto=compress&cs=tinysrgb&w=400"
                    }
                    alt={step.title}
                    className="w-full h-40 object-cover rounded-lg mx-auto mb-4"
                  />
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-2xl font-bold w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full">
                    <ArrowRight className="h-6 w-6 text-blue-300 mx-auto -ml-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Educators Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what school administrators and teachers are saying about School Board.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="mb-6">
                  <img
                    src={index === 0 
                      ? "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400"
                      : index === 1 
                      ? "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=400"
                      : "https://images.pexels.com/photos/3184317/pexels-photo-3184317.jpeg?auto=compress&cs=tinysrgb&w=400"
                    }
                    alt={`${testimonial.author} - ${testimonial.title}`}
                    className="w-16 h-16 object-cover rounded-full mx-auto border-4 border-blue-100"
                  />
                </div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-6 italic leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="border-t pt-4">
                  <div className="font-semibold text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-600">{testimonial.title}</div>
                  <div className="text-sm text-blue-600 font-medium">{testimonial.school}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Schools Using Our Platform</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-blue-100">Students Managed</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">1M+</div>
              <div className="text-blue-100">Messages Sent</div>
            </div>
            <div className="text-white">
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">Uptime Guarantee</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <img
              src="https://images.pexels.com/photos/8613092/pexels-photo-8613092.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Happy students and teachers in school environment"
              className="w-full max-w-2xl mx-auto h-64 object-cover rounded-xl shadow-lg"
            />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your School Management?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join hundreds of schools already using School Board to streamline operations, improve communication, and focus on what matters most - education.
          </p>
          
          {/* Hero Image */}
          <div className="mt-12 mb-8">
            <img
              src="https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Students and teacher in a modern classroom setting"
              className="w-full max-w-4xl mx-auto h-96 object-cover rounded-2xl shadow-2xl"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/auth"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-2"
            >
              <span>Start Your Free Trial</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="https://forms.gle/H6zF6gHpwS1Dv53Z6"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors border-2 border-gray-300 hover:border-gray-400"
            >
              Contact Sales
            </a>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Free 30-day trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <School className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">School Board</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Empowering schools with modern management tools. Streamline operations, enhance communication, and focus on education.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
                <a href="https://forms.gle/H6zF6gHpwS1Dv53Z6" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">Contact Us</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="https://forms.gle/H6zF6gHpwS1Dv53Z6" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Give Feedback</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 School Board. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};