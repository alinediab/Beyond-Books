import { Link } from "react-router-dom";
import { BookOpen, Users, Target, Award, GraduationCap, Heart } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";

export default function AboutUs({ user, onLogout }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFECE3] via-[#F5F3EE] to-[#EFECE3]">
      {/* Navbar */}
      <PublicNavbar user={user} onLogout={onLogout} />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 text-center">
        <div className="mb-6">
          <h1 className="text-5xl md:text-6xl font-bold text-[#000000] mb-6">
            About <span className="text-[#4A70A9]">BeyondBooks</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Your comprehensive platform for student activities, research opportunities, and campus engagement at Lebanese American University.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t-2 border-[#4A70A9] max-w-7xl mx-auto my-4"></div>

      {/* Mission Section */}
      <section className="pt-6 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <Target className="w-12 h-12 text-[#4A70A9]" />
            </div>
            <h2 className="text-4xl font-bold text-center text-[#000000] mb-6">Our Mission</h2>
            <p className="text-lg text-gray-700 text-center leading-relaxed mb-6">
              BeyondBooks is dedicated to creating a vibrant ecosystem where students, faculty, and staff can connect, collaborate, and grow together. We believe that education extends far beyond the classroom, and our platform serves as a bridge between academic learning and real-world experiences.
            </p>
            <p className="text-lg text-gray-700 text-center leading-relaxed">
              Our mission is to empower every member of the LAU community to discover opportunities, build meaningful connections, and take control of their academic and professional journey.
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t-2 border-[#4A70A9] max-w-7xl mx-auto my-4"></div>

      {/* Values Section */}
      <section className="pt-6 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-[#000000] mb-16">Our Core Values</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition border border-[#8FABD4]/30">
              <div className="bg-[#4A70A9]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-[#4A70A9]" />
              </div>
              <h3 className="text-2xl font-bold text-[#000000] mb-4 text-center">Community First</h3>
              <p className="text-gray-700 text-center leading-relaxed">
                We foster a sense of belonging and support, creating a community where everyone can thrive and contribute to the collective success.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition border border-[#8FABD4]/30">
              <div className="bg-[#4A70A9]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-[#4A70A9]" />
              </div>
              <h3 className="text-2xl font-bold text-[#000000] mb-4 text-center">Excellence</h3>
              <p className="text-gray-700 text-center leading-relaxed">
                We strive for excellence in everything we do, providing high-quality opportunities and experiences that help our community members achieve their best.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition border border-[#8FABD4]/30">
              <div className="bg-[#4A70A9]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="w-8 h-8 text-[#4A70A9]" />
              </div>
              <h3 className="text-2xl font-bold text-[#000000] mb-4 text-center">Growth</h3>
              <p className="text-gray-700 text-center leading-relaxed">
                We believe in continuous learning and development, providing resources and opportunities that enable personal and professional growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t-2 border-[#4A70A9] max-w-7xl mx-auto my-4"></div>

      {/* What We Offer Section */}
      <section className="pt-6 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-[#000000] mb-16">What We Offer</h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-md border border-[#8FABD4]/30">
              <BookOpen className="w-8 h-8 text-[#4A70A9] mb-4" />
              <h3 className="text-xl font-bold text-[#000000] mb-3">Research Opportunities</h3>
              <p className="text-gray-700 leading-relaxed">
                Connect with faculty members and explore cutting-edge research projects that allow you to contribute to meaningful discoveries and gain valuable experience.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-[#8FABD4]/30">
              <Users className="w-8 h-8 text-[#4A70A9] mb-4" />
              <h3 className="text-xl font-bold text-[#000000] mb-3">Student Clubs</h3>
              <p className="text-gray-700 leading-relaxed">
                Join vibrant student organizations, build leadership skills, and create lasting friendships with peers who share your interests and passions.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-[#8FABD4]/30">
              <Award className="w-8 h-8 text-[#4A70A9] mb-4" />
              <h3 className="text-xl font-bold text-[#000000] mb-3">University Events</h3>
              <p className="text-gray-700 leading-relaxed">
                Attend engaging seminars, workshops, and networking events that expand your knowledge and help you build valuable professional connections.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-[#8FABD4]/30">
              <Target className="w-8 h-8 text-[#4A70A9] mb-4" />
              <h3 className="text-xl font-bold text-[#000000] mb-3">Application Management</h3>
              <p className="text-gray-700 leading-relaxed">
                Easily track and manage your applications for research projects, internships, and other opportunities all in one convenient place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t-2 border-[#4A70A9] max-w-7xl mx-auto my-4"></div>

      {/* Call to Action */}
      <section className="pt-6 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-[#000000] mb-6">Join Our Community</h2>
          <p className="text-xl text-gray-700 mb-8 leading-relaxed">
            Whether you're a student looking to explore opportunities, a faculty member seeking research collaborators, or a staff member managing campus activities, BeyondBooks is here to support your journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-3 bg-gradient-to-r from-[#4A70A9] to-[#5A80B9] text-white rounded-lg hover:from-[#3A60A9] hover:to-[#4A70A9] transition font-semibold shadow-lg hover:shadow-xl"
            >
              Get Started Today
            </Link>
            <Link
              to="/features"
              className="px-8 py-3 border-2 border-[#4A70A9] text-[#4A70A9] rounded-lg hover:bg-[#4A70A9]/10 transition font-semibold"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </section>

     
      {/* Footer */}
      <Footer />
    </div>
  );
}
