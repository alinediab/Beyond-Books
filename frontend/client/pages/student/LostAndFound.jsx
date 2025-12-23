import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PublicNavbar from "@/components/PublicNavbar";
import Sidebar from "@/components/Sidebar";
import { Search, Plus, Clock, CheckCircle, AlertCircle, X, Loader2, Calendar, Package, Laptop, FileText, Shirt, Headphones, BookOpen, Briefcase, Key, Watch, Dumbbell } from "lucide-react";
import { lostFoundApi } from "@shared/api";
import { toast } from "sonner";

const ITEM_CATEGORIES = [
  "Electronics",
  "Documents",
  "Clothing",
  "Accessories",
  "Books",
  "Bags",
  "Keys",
  "Jewelry",
  "Sports Equipment",
  "Other",
];

export default function LostAndFound({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const queryClient = useQueryClient();

  // Fetch lost and found items from database
  const { data: lostFoundData, isLoading: lostFoundLoading } = useQuery({
    queryKey: ['lostFound'],
    queryFn: async () => {
      const response = await lostFoundApi.list();
      return response.data || [];
    },
  });

  const [formData, setFormData] = useState({
    itemName: "",
    itemDescription: "",
    category: "Electronics",
    dateReported: new Date().toISOString().split('T')[0],
    status: "pending",
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!formData.itemName || !formData.itemDescription || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const studentID = user?.studentID || user?.id;
      // For students, include studentID so we can send email when item is found
      await lostFoundApi.create({
        itemName: formData.itemName,
        itemDescription: formData.itemDescription,
        category: formData.category,
        dateReported: formData.dateReported || new Date().toISOString().split('T')[0],
        status: "pending",
        staffID: null, // Students don't have staffID
        studentID: studentID, // Include studentID to track who submitted
      });
      toast.success("Submission created successfully!");
      queryClient.invalidateQueries(['lostFound']);
      setFormData({
        itemName: "",
        itemDescription: "",
        category: "Electronics",
        dateReported: new Date().toISOString().split('T')[0],
        status: "pending",
      });
      setShowForm(false);
    } catch (error) {
      toast.error("Failed to submit. Please try again.");
    }
  };

  // Transform data for display
  const submissions = lostFoundData?.map((item) => ({
    id: item.recordID,
    itemName: item.itemName,
    description: item.itemDescription,
    category: item.category,
    date: item.dateReported ? new Date(item.dateReported).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A",
    status: item.status || "pending",
    image: getCategoryIcon(item.category),
  })) || [];

  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      submission.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || submission.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Filter by activeTab (list vs mySubmissions)
  const displaySubmissions = activeTab === "mySubmissions"
    ? filteredSubmissions.filter(sub => {
        // For now, show all since we don't have studentID in the schema
        // This could be enhanced if studentID is added to the schema
        return true;
      })
    : filteredSubmissions;

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "resolved":
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
            <CheckCircle className="w-3 h-3" />
            Resolved
          </span>
        );
      case "contacted":
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">
            <AlertCircle className="w-3 h-3" />
            Contacted
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded">
            <Clock className="w-3 h-3" />
            {status || "Pending"}
          </span>
        );
    }
  };

  function getCategoryIcon(category) {
    const iconMap = {
      "Electronics": Laptop,
      "Documents": FileText,
      "Clothing": Shirt,
      "Accessories": Headphones,
      "Books": BookOpen,
      "Bags": Briefcase,
      "Keys": Key,
      "Jewelry": Watch,
      "Sports Equipment": Dumbbell,
      "Other": Package,
    };
    return iconMap[category] || Package;
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <PublicNavbar user={user} onLogout={onLogout} />

      <div className="flex flex-1 overflow-hidden min-h-0">
        <Sidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-auto min-h-0">
          <div className="p-4 sm:p-8 max-w-7xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-warm-600 rounded-2xl p-8 text-white mb-8">
              <h1 className="text-4xl font-bold mb-2">Lost & Found</h1>
              <p className="text-primary-foreground opacity-90">
                Report lost items or items you've found on campus
              </p>
            </div>

            {/* Tabs and Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div className="flex gap-4 border-b border-warm-200 overflow-x-auto">
                {["list", "mySubmissions"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 font-medium whitespace-nowrap transition border-b-2 ${
                      activeTab === tab
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab === "list" ? "All Submissions" : "My Submissions"}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowForm(!showForm)}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-warm-600 transition font-medium flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-5 h-5" />
                {showForm ? "Cancel" : "New Submission"}
              </button>
            </div>

            {/* New Submission Form */}
            {showForm && (
              <div className="bg-white rounded-xl border border-warm-200 p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground">
                    Submit Lost or Found Item
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmitForm} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      name="itemName"
                      value={formData.itemName}
                      onChange={handleFormChange}
                      placeholder="e.g., Silver Laptop, Blue Backpack"
                      className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Description *
                    </label>
                    <textarea
                      name="itemDescription"
                      value={formData.itemDescription}
                      onChange={handleFormChange}
                      placeholder="Detailed description of the item (color, brand, condition, identifying marks, etc.)"
                      rows="4"
                      className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      required
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                        required
                      >
                        {ITEM_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Date Found/Lost
                      </label>
                      <input
                        type="date"
                        name="dateReported"
                        value={formData.dateReported}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-warm-600 transition font-bold"
                    >
                      Submit Report
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 bg-warm-100 text-foreground py-3 rounded-lg hover:bg-warm-200 transition font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Search and Filter */}
            {!showForm && (
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  {["all", "pending", "contacted", "resolved"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-2.5 rounded-lg font-medium transition whitespace-nowrap ${
                        filterStatus === status
                          ? "bg-primary text-white"
                          : "bg-white border border-warm-200 text-foreground hover:bg-warm-50"
                      }`}
                    >
                      {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submissions List */}
            {!showForm && (
              <>
                {lostFoundLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : displaySubmissions.length === 0 ? (
                  <div className="bg-white rounded-xl border border-warm-200 p-12 text-center">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-lg text-muted-foreground">
                      {searchTerm || filterStatus !== "all" ? "No items found matching your search" : "No items reported yet"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displaySubmissions.map((submission) => {
                      const IconComponent = submission.image;
                      return (
                        <div
                          key={submission.id}
                          className="bg-white rounded-xl border border-warm-200 overflow-hidden hover:shadow-lg transition"
                        >
                          <div className={`h-2 ${
                            submission.status === "resolved" ? "bg-green-500" :
                            submission.status === "contacted" ? "bg-blue-500" :
                            "bg-yellow-500"
                          }`} />
                          <div className="p-5">
                            <div className="flex items-start justify-between mb-4">
                              <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl flex items-center justify-center">
                                <IconComponent className="w-7 h-7 text-primary" />
                              </div>
                              {getStatusBadge(submission.status)}
                            </div>
                            
                            <h3 className="text-lg font-bold text-foreground mb-1">
                              {submission.itemName}
                            </h3>
                            <span className="text-xs font-medium px-2 py-1 bg-warm-100 text-foreground rounded-full">
                              {submission.category}
                            </span>
                            
                            <p className="text-muted-foreground text-sm mt-3 mb-4 line-clamp-2">
                              {submission.description}
                            </p>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-3 border-t border-warm-100">
                              <Calendar className="w-4 h-4 text-primary" />
                              <span>{submission.date}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}