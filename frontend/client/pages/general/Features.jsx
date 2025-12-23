import { Link } from "react-router-dom";
import { BookOpen, Users, Calendar, Briefcase, Target, Search, Bell, FileText, MapPin, CheckCircle2 } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";

export default function Features({ user, onLogout }) {
  const features = [
    {
      icon: BookOpen,
      title: "Research Projects",
      description: "Discover and apply to cutting-edge research projects led by experienced faculty members. Track your applications and collaborate with peers.",
    },
    {
      icon: Users,
      title: "Student Clubs",
      description: "Join vibrant student organizations, participate in activities, and build lasting connections with peers who share your interests.",
    },
    {
      icon: Calendar,
      title: "University Events",
      description: "Browse and register for seminars, workshops, networking events, and campus activities. Never miss an important event.",
    },
    {
      icon: Briefcase,
      title: "Internship Opportunities",
      description: "Explore internship opportunities and gain practical experience in your field of study. Apply and track your progress.",
    },
    {
      icon: FileText,
      title: "Application Management",
      description: "Centralized dashboard to track all your applications for research projects, internships, and club memberships in one place.",
    },
    {
      icon: MapPin,
      title: "Lost & Found",
      description: "Report lost items or help return found items to their owners. A community-driven system to reunite students with their belongings.",
    },
  ];

  const highlights = [
    "Real-time notifications for new opportunities",
    "Advanced search and filtering capabilities",
    "Personalized dashboard for each user role",
    "Secure authentication and data protection",
    "Mobile-responsive design for access anywhere",
    "Comprehensive analytics and insights",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFECE3] via-[#F5F3EE] to-[#EFECE3]">
      {/* Navbar */}
      <PublicNavbar user={user} onLogout={onLogout} />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 text-center">
        <div className="mb-6">
          <h1 className="text-5xl md:text-6xl font-bold text-[#000000] mb-6">
            Powerful <span className="text-[#4A70A9]">Features</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Everything you need to make the most of your university experience, all in one integrated platform.
          </p>
        </div>
      </section>

      

      {/* Main Features Grid */}
      <section className="pt-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border-l-4 border-[#4A70A9] hover:border-[#4A70A9]"
                >
                  <div className="bg-[#4A70A9]/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-[#4A70A9]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#000000] mb-4">{feature.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t-2 border-[#4A70A9] max-w-7xl mx-auto my-8"></div>

      {/* Additional Highlights */}
      <section className="pt-8 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-[#000000] mb-12">Why Choose BeyondBooks?</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {highlights.map((highlight, index) => (
              <div key={index} className="flex items-start gap-4 bg-white rounded-lg p-4 shadow-md border border-[#8FABD4]/30">
                <CheckCircle2 className="w-6 h-6 text-[#4A70A9] flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 font-medium">{highlight}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t-2 border-[#4A70A9] max-w-7xl mx-auto my-8"></div>

      {/* User Roles Section */}
      <section className="pt-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-[#000000] mb-12">Built for Everyone</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#8FABD4]/30 text-center">
              <Users className="w-12 h-12 text-[#4A70A9] mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-[#000000] mb-4">Students</h3>
              <p className="text-gray-700 leading-relaxed">
                Discover opportunities, join clubs, attend events, and manage your applications all from one dashboard.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#8FABD4]/30 text-center">
              <BookOpen className="w-12 h-12 text-[#4A70A9] mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-[#000000] mb-4">Faculty</h3>
              <p className="text-gray-700 leading-relaxed">
                Post research projects, review applications, manage your team, and track project progress.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#8FABD4]/30 text-center">
              <Target className="w-12 h-12 text-[#4A70A9] mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-[#000000] mb-4">Staff</h3>
              <p className="text-gray-700 leading-relaxed">
                Manage users, oversee activities, and maintain the platform to ensure smooth operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      
     

      {/* Footer */}
      <Footer />
    </div>
  );
}
