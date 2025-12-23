import { Link } from "react-router-dom";
import { 
  BookOpen, Users, Award, ArrowRight, Mail, Phone, MapPin, 
  Briefcase, Sparkles, Target, TrendingUp, Zap, Shield, 
  CheckCircle2, Star, ChevronRight, PlayCircle
} from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";

export default function Landing({ user, onLogout }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFECE3] via-[#F5F3EE] to-[#EFECE3] overflow-hidden">
      {/* Navigation */}
      <PublicNavbar user={user} onLogout={onLogout} />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 lg:pb-32">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-96 h-96 bg-[#8FABD4]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-[#4A70A9]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative text-center">
          <div className="mb-8 inline-block">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#4A70A9]/10 rounded-full border border-[#8FABD4]/30">
              <Sparkles className="w-4 h-4 text-[#4A70A9]" />
              <span className="text-sm font-medium text-[#4A70A9]">Your Gateway to Academic Excellence</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#000000] mb-6 leading-tight">
            Beyond Books,<br />
            <span className="text-[#4A70A9]">Beyond Boundaries</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-12 leading-relaxed">
            Connect, collaborate, and grow with BeyondBooks. Your all-in-one platform for research, clubs, events, and opportunities at Lebanese American University.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/signup"
              className="group px-8 py-4 bg-gradient-to-r from-[#4A70A9] to-[#5A80B9] text-white rounded-xl hover:from-[#3A60A9] hover:to-[#4A70A9] transition font-semibold text-lg shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 transform hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/features"
              className="px-8 py-4 border-2 border-[#4A70A9] text-[#4A70A9] rounded-xl hover:bg-[#4A70A9]/10 transition font-semibold text-lg flex items-center justify-center gap-2"
            >
              <PlayCircle className="w-5 h-5" />
              Watch Demo
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { number: "2,500+", label: "Active Users" },
              { number: "50+", label: "Research Projects" },
              { number: "25+", label: "Student Clubs" },
              { number: "100+", label: "Events Hosted" },
            ].map((stat, index) => (
              <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-[#8FABD4]/30 shadow-lg">
                <div className="text-3xl font-bold text-[#4A70A9] mb-1">{stat.number}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t-2 border-[#4A70A9] max-w-7xl mx-auto my-8"></div>

      {/* Features Section */}
      <section className="pt-8 pb-20 lg:pb-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#000000] mb-4">
              Everything You Need in <span className="text-[#4A70A9]">One Platform</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Discover opportunities, connect with peers, and build your future all from one place.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BookOpen,
                title: "Research Projects",
                description: "Explore cutting-edge research projects and work alongside experienced faculty members on real-world discoveries.",
              },
              {
                icon: Users,
                title: "Student Clubs",
                description: "Join vibrant student organizations, develop leadership skills, and build lasting friendships with like-minded peers.",
              },
              {
                icon: Award,
                title: "University Events",
                description: "Attend seminars, workshops, and networking events to expand your knowledge and professional connections.",
              },
              {
                icon: Briefcase,
                title: "Opportunities",
                description: "Discover internships, research positions, and career opportunities that align with your academic goals.",
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-[#8FABD4]/30 hover:border-[#4A70A9] transform hover:-translate-y-2"
                >
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#4A70A9] to-[#5A80B9] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[#000000] mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  <Link
                    to="/features"
                    className="inline-flex items-center gap-2 text-[#4A70A9] font-semibold mt-4 group/link"
                  >
                    Learn more
                    <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t-2 border-[#4A70A9] max-w-7xl mx-auto my-8"></div>

      {/* How It Works Section */}
      <section className="pt-8 pb-20 lg:pb-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#000000] mb-4">
              How <span className="text-[#4A70A9]">It Works</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Get started in three simple steps and unlock endless opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Create Your Account",
                description: "Sign up with your LAU email and university ID. It only takes a minute to get started.",
                icon: Shield,
              },
              {
                step: "02",
                title: "Explore Opportunities",
                description: "Browse research projects, join clubs, and discover events that match your interests.",
                icon: Target,
              },
              {
                step: "03",
                title: "Connect & Grow",
                description: "Apply to opportunities, connect with peers and faculty, and build your academic network.",
                icon: TrendingUp,
              },
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#8FABD4]/30 hover:shadow-xl transition-all text-center">
                    <div className="text-6xl font-bold text-[#8FABD4]/20 mb-4">{step.step}</div>
                    <div className="w-16 h-16 rounded-full bg-[#4A70A9]/10 flex items-center justify-center mx-auto mb-6">
                      <Icon className="w-8 h-8 text-[#4A70A9]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#000000] mb-3">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-8 h-8 text-[#8FABD4]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t-2 border-[#4A70A9] max-w-7xl mx-auto my-8"></div>

      {/* Benefits Section */}
      <section className="pt-8 pb-20 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#000000] mb-6">
                Why Choose <span className="text-[#4A70A9]">BeyondBooks?</span>
              </h2>
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                We're not just a platform—we're your partner in academic and professional success. Here's what makes us different.
              </p>
              
              <div className="space-y-6">
                {[
                  "Centralized hub for all university activities",
                  "Real-time notifications and updates",
                  "Easy application tracking and management",
                  "Secure and protected data",
                  "Mobile-friendly design",
                  "24/7 support and assistance",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-[#4A70A9] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-lg text-gray-700">{benefit}</p>
                  </div>
                ))}
              </div>

              <Link
                to="/about"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-[#4A70A9] text-white rounded-lg hover:bg-[#3A60A9] transition font-semibold"
              >
                Learn More About Us
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Zap, title: "Lightning Fast", desc: "Quick access to all features" },
                { icon: Shield, title: "Secure", desc: "Your data is protected" },
                { icon: Target, title: "Focused", desc: "Tailored to your needs" },
                { icon: Sparkles, title: "Innovative", desc: "Cutting-edge technology" },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="bg-white rounded-xl p-6 border border-[#8FABD4]/30 shadow-md hover:shadow-lg transition">
                    <Icon className="w-8 h-8 text-[#4A70A9] mb-3" />
                    <h4 className="font-bold text-[#000000] mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

     
      

      {/* Footer */}
      <Footer />
    </div>
  );
}