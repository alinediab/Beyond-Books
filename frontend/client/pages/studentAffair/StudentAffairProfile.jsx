import { useState, useEffect } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import Sidebar from "@/components/Sidebar";
import { 
  User, Mail, Phone, MapPin, Save, 
  Edit2, X, Building2, Shield, FileText, Settings, GraduationCap
} from "lucide-react";
import { toast } from "sonner";
import { studentAffairsOfficerApi } from "@shared/api";

export default function StudentAffairProfile({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const initializeFormData = () => ({
    firstName: user?.firstName || user?.name?.split(' ')[0] || "",
    lastName: user?.lastName || user?.name?.split(' ').slice(1).join(' ') || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    staffDepartment: user?.staffDepartment || "",
    officerID: user?.studentAffairsOfficerID || user?.id || "",
  });

  const [formData, setFormData] = useState(initializeFormData());
  const [isLoading, setIsLoading] = useState(true);

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await studentAffairsOfficerApi.getProfile(user.id);
        if (response.success && response.data) {
          const profileData = response.data;
          // Update user object with fetched data
          Object.assign(user, profileData);
          // Update form data
          setFormData({
            firstName: profileData.firstName || user?.name?.split(' ')[0] || "",
            lastName: profileData.lastName || user?.name?.split(' ').slice(1).join(' ') || "",
            email: profileData.email || "",
            phoneNumber: profileData.phoneNumber || "",
            staffDepartment: profileData.staffDepartment || "",
            officerID: profileData.studentAffairsOfficerID || user?.id || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        // Keep existing user data if fetch fails
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Sync form data when user data changes
  useEffect(() => {
    if (!isEditing && !isLoading) {
      setFormData({
        firstName: user?.firstName || user?.name?.split(' ')[0] || "",
        lastName: user?.lastName || user?.name?.split(' ').slice(1).join(' ') || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
        staffDepartment: user?.staffDepartment || "",
        officerID: user?.studentAffairsOfficerID || user?.id || "",
      });
    }
  }, [user, isEditing, isLoading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber || null,
        staffDepartment: formData.staffDepartment || null,
      };

      // Use studentAffairsOfficerID if available, otherwise use id
      const officerID = user?.studentAffairsOfficerID || user?.id;
      console.log('[StudentAffairProfile] Updating profile for officerID:', officerID);
      const response = await studentAffairsOfficerApi.updateProfile(officerID, updateData);
      
      if (response.success) {
        // Update form data with response data
        setFormData({
          firstName: response.data.firstName || formData.firstName,
          lastName: response.data.lastName || formData.lastName,
          email: response.data.email || formData.email,
          phoneNumber: response.data.phoneNumber || formData.phoneNumber,
          staffDepartment: response.data.staffDepartment || formData.staffDepartment,
          officerID: response.data.studentAffairsOfficerID || formData.officerID,
        });
        setIsEditing(false);
        toast.success("Profile updated successfully! 🎉");
        // Update local user data
        Object.assign(user, response.data);
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      const errorMessage = error?.message || "Failed to update profile. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(initializeFormData());
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const fullName = `${formData.firstName} ${formData.lastName}`.trim() || user.name || "Student Affairs Officer";
  
  // Debug: Log user object to see what fields are available
  useEffect(() => {
    console.log('[StudentAffairProfile] User object:', user);
    console.log('[StudentAffairProfile] formData:', formData);
  }, [user, formData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#EFECE3] via-[#F5F3EE] to-[#EFECE3] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-[#4A70A9] border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-[#4A70A9]">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFECE3] via-[#F5F3EE] to-[#EFECE3]">
      <PublicNavbar user={user} onLogout={onLogout} />

      <div className="flex">
        <Sidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-8 max-w-6xl mx-auto">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#4A70A9] to-[#5A80B9] rounded-2xl p-8 text-white mb-8 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-2">My Profile</h1>
                  <p className="text-white/90 text-lg">
                    Manage your account information and administrative details
                  </p>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all font-medium flex items-center gap-2 border border-white/30"
                >
                  {isEditing ? (
                    <>
                      <X className="w-5 h-5" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-5 h-5" />
                      Edit Profile
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Profile Card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-[#8FABD4]/30 shadow-lg overflow-hidden sticky top-8">
                  {/* Cover */}
                  <div className="h-24 bg-gradient-to-r from-[#4A70A9] to-[#5A80B9]"></div>

                  {/* Avatar */}
                  <div className="flex flex-col items-center -mt-16 pb-6 px-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-[#4A70A9] to-[#5A80B9] rounded-full border-4 border-white flex items-center justify-center shadow-xl mb-4">
                      <span className="text-4xl font-bold text-white">
                        {getInitials(fullName)}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-[#000000] mb-1 text-center">
                      {fullName}
                    </h2>
                    <div className="flex items-center gap-2 text-[#4A70A9] mb-4">
                      <Shield className="w-5 h-5" />
                      <span className="font-medium">Student Affairs Officer</span>
                    </div>
                    {formData.staffDepartment && (
                      <div className="bg-[#8FABD4]/10 rounded-lg px-4 py-2 mb-4 w-full text-center">
                        <p className="text-sm text-gray-600 font-medium">{formData.staffDepartment}</p>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Right Column - Details */}
              <div className="lg:col-span-2">
                {isEditing ? (
                  <div className="bg-white rounded-2xl border border-[#8FABD4]/30 shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-[#000000] mb-6">Edit Profile Information</h3>
                    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A70A9] focus:border-[#4A70A9] transition"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Last Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A70A9] focus:border-[#4A70A9] transition"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            disabled
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            placeholder="+961 3 123456"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A70A9] focus:border-[#4A70A9] transition"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Department <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="staffDepartment"
                            value={formData.staffDepartment}
                            onChange={handleChange}
                            required
                            placeholder="Student Affairs"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A70A9] focus:border-[#4A70A9] transition"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">
                            Officer ID
                          </label>
                          <input
                            type="text"
                            name="officerID"
                            value={formData.officerID}
                            onChange={handleChange}
                            disabled
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="submit"
                          className="flex-1 bg-gradient-to-r from-[#4A70A9] to-[#5A80B9] text-white py-3 rounded-lg hover:from-[#3A60A9] hover:to-[#4A70A9] transition font-semibold flex items-center justify-center gap-2 shadow-lg"
                        >
                          <Save className="w-5 h-5" />
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Personal Information */}
                    <div className="bg-white rounded-2xl border border-[#8FABD4]/30 shadow-lg p-8">
                      <h3 className="text-2xl font-bold text-[#000000] mb-6 flex items-center gap-2">
                        <User className="w-6 h-6 text-[#4A70A9]" />
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-4 p-4 bg-[#8FABD4]/5 rounded-lg">
                          <div className="w-12 h-12 bg-[#4A70A9]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Mail className="w-6 h-6 text-[#4A70A9]" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600 mb-1">Email Address</p>
                            <p className="text-[#000000] font-semibold">{formData.email || "Not provided"}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-[#8FABD4]/5 rounded-lg">
                          <div className="w-12 h-12 bg-[#4A70A9]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Phone className="w-6 h-6 text-[#4A70A9]" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                            <p className="text-[#000000] font-semibold">{formData.phoneNumber || "Not provided"}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-[#8FABD4]/5 rounded-lg">
                          <div className="w-12 h-12 bg-[#4A70A9]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6 text-[#4A70A9]" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600 mb-1">Officer ID</p>
                            <p className="text-[#000000] font-semibold">{formData.officerID || "Not provided"}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 bg-[#8FABD4]/5 rounded-lg">
                          <div className="w-12 h-12 bg-[#4A70A9]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-6 h-6 text-[#4A70A9]" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600 mb-1">Location</p>
                            <p className="text-[#000000] font-semibold">Beirut, Lebanon</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Administrative Information */}
                    {formData.staffDepartment && (
                      <div className="bg-white rounded-2xl border border-[#8FABD4]/30 shadow-lg p-8">
                        <h3 className="text-2xl font-bold text-[#000000] mb-6 flex items-center gap-2">
                          <Settings className="w-6 h-6 text-[#4A70A9]" />
                          Administrative Information
                        </h3>
                        <div className="flex items-start gap-4 p-4 bg-[#8FABD4]/5 rounded-lg">
                          <div className="w-12 h-12 bg-[#4A70A9]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-6 h-6 text-[#4A70A9]" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-600 mb-1">Department</p>
                            <p className="text-[#000000] font-semibold text-lg">{formData.staffDepartment}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
