import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { contactApi } from "@shared/api";

export default function Contact({ user, onLogout }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await contactApi.sendMessage(formData);
      if (response.success) {
        toast.success("Thank you! Your message has been sent successfully.");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        throw new Error(response.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending contact message:", error);
      toast.error(error?.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFECE3] via-[#F5F3EE] to-[#EFECE3]">
      {/* Navbar */}
      <PublicNavbar user={user} onLogout={onLogout} />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 text-center">
        <div className="mb-6">
          <h1 className="text-5xl md:text-6xl font-bold text-[#000000] mb-6">
            Get in <span className="text-[#4A70A9]">Touch</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Have questions or need assistance? We're here to help. Reach out to us and we'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      

      {/* Contact Information & Form Section */}
      <section className="pt-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-[#000000] mb-6">Contact Information</h2>
                <p className="text-gray-700 leading-relaxed mb-8">
                  Feel free to reach out to us through any of the following channels. Our team is available to assist you with any questions or concerns.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 bg-white rounded-xl p-6 shadow-md border border-[#8FABD4]/30">
                  <div className="bg-[#4A70A9]/10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-[#4A70A9]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#000000] mb-1">Email</h3>
                    <p className="text-gray-700">support@beyondbooks.lau.edu</p>
                    <p className="text-gray-700">info@beyondbooks.lau.edu</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white rounded-xl p-6 shadow-md border border-[#8FABD4]/30">
                  <div className="bg-[#4A70A9]/10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-[#4A70A9]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#000000] mb-1">Phone</h3>
                    <p className="text-gray-700">+961 1 374 374</p>
                    <p className="text-gray-700">+961 1 786 456</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white rounded-xl p-6 shadow-md border border-[#8FABD4]/30">
                  <div className="bg-[#4A70A9]/10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-[#4A70A9]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#000000] mb-1">Location</h3>
                    <p className="text-gray-700">Lebanese American University</p>
                    <p className="text-gray-700">Beirut, Lebanon</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 bg-white rounded-xl p-6 shadow-md border border-[#8FABD4]/30">
                  <div className="bg-[#4A70A9]/10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-[#4A70A9]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#000000] mb-1">Office Hours</h3>
                    <p className="text-gray-700">Monday - Friday: 9:00 AM - 5:00 PM</p>
                    <p className="text-gray-700">Saturday: 9:00 AM - 1:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-[#8FABD4]/30">
              <h2 className="text-3xl font-bold text-[#000000] mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A70A9] focus:border-[#4A70A9] transition"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A70A9] focus:border-[#4A70A9] transition"
                    placeholder="john.doe@lau.edu"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A70A9] focus:border-[#4A70A9] transition"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A70A9] focus:border-[#4A70A9] transition resize-none"
                    placeholder="Please provide details about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#4A70A9] to-[#5A80B9] text-white rounded-lg hover:from-[#3A60A9] hover:to-[#4A70A9] transition font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

     

      {/* FAQ Section */}
      <section className="pt-8 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-[#000000] mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-md border border-[#8FABD4]/30">
              <h3 className="text-lg font-bold text-[#000000] mb-2">How do I create an account?</h3>
              <p className="text-gray-700">
                Simply click on the "Sign Up" button in the navigation bar and fill out the registration form with your LAU email address and university ID.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-[#8FABD4]/30">
              <h3 className="text-lg font-bold text-[#000000] mb-2">Can I apply to multiple research projects?</h3>
              <p className="text-gray-700">
                Yes! You can apply to as many research projects as you'd like. Track all your applications from your dashboard.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-[#8FABD4]/30">
              <h3 className="text-lg font-bold text-[#000000] mb-2">How do I join a student club?</h3>
              <p className="text-gray-700">
                Browse available clubs on the Clubs page and click "Join" on any club that interests you. Club administrators will review your request.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-[#8FABD4]/30">
              <h3 className="text-lg font-bold text-[#000000] mb-2">What if I forget my password?</h3>
              <p className="text-gray-700">
                Contact our support team at support@beyondbooks.lau.edu, and we'll help you reset your password.
              </p>
            </div>
          </div>
        </div>
      </section>

      

      {/* Footer */}
      <Footer />
    </div>
  );
}
