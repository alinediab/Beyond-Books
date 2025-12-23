import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PublicNavbar from "@/components/PublicNavbar";
import Sidebar from "@/components/Sidebar";
import { AlertCircle, Search, Loader2, Edit, Trash2, Save, X, Calendar, Tag, Package, CheckCircle, Clock } from "lucide-react";
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

export default function StudentAffairLostAndFound({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const queryClient = useQueryClient();

  // Fetch lost and found items
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.itemName || !formData.itemDescription) {
      toast.error("Item name and description are required");
      return;
    }

    try {
      if (editingItem) {
        await lostFoundApi.update(editingItem.recordID, formData);
        toast.success("Item updated successfully!");
      } else {
        const officerID = user?.studentAffairsOfficerID || user?.id;
        await lostFoundApi.create({
          ...formData,
          studentAffairsOfficerID: officerID, // Use studentAffairsOfficerID instead of staffID
        });
        toast.success("Item created successfully!");
      }
      
      setFormData({
        itemName: "",
        itemDescription: "",
        category: "Electronics",
        dateReported: new Date().toISOString().split('T')[0],
        status: "pending",
      });
      setEditingItem(null);
      queryClient.invalidateQueries(['lostFound']);
      // Refresh officer stats to update "Lost & Found Items" count - force refetch
      const officerID = user?.studentAffairsOfficerID || user?.id;
      if (officerID) {
        await queryClient.refetchQueries({ queryKey: ['officerStats', officerID] });
      }
    } catch (error) {
      toast.error("Failed to save item. Please try again.");
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      itemName: item.itemName || "",
      itemDescription: item.itemDescription || "",
      category: item.category || "Electronics",
      dateReported: item.dateReported ? new Date(item.dateReported).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      status: item.status || "pending",
    });
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      setDeletingId(recordId);
      await lostFoundApi.delete(recordId);
      toast.success("Item deleted successfully!");
      queryClient.invalidateQueries(['lostFound']);
      // Refresh officer stats to update "Lost & Found Items" count - force refetch
      const officerID = user?.studentAffairsOfficerID || user?.id;
      if (officerID) {
        await queryClient.refetchQueries({ queryKey: ['officerStats', officerID] });
      }
    } catch (error) {
      toast.error("Failed to delete item. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setFormData({
      itemName: "",
      itemDescription: "",
      category: "Electronics",
      dateReported: new Date().toISOString().split('T')[0],
      status: "pending",
    });
  };

  const items = lostFoundData || [];
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "resolved":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <PublicNavbar user={user} onLogout={onLogout} />

      <div className="flex flex-1 overflow-hidden min-h-0">
        <Sidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-auto min-h-0">
          <div className="p-4 sm:p-8 max-w-7xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-warm-600 rounded-2xl p-8 text-white mb-8">
              <h1 className="text-4xl font-bold mb-2">Manage Lost & Found</h1>
              <p className="text-primary-foreground opacity-90">
                Manage lost and found items reported by students
              </p>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-xl border border-warm-200 p-4 mb-6 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterStatus("all")}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      filterStatus === "all" 
                        ? "bg-primary text-white" 
                        : "bg-warm-100 text-foreground hover:bg-warm-200"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterStatus("pending")}
                    className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                      filterStatus === "pending" 
                        ? "bg-yellow-500 text-white" 
                        : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    Pending
                  </button>
                  <button
                    onClick={() => setFilterStatus("resolved")}
                    className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                      filterStatus === "resolved" 
                        ? "bg-green-500 text-white" 
                        : "bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Resolved
                  </button>
                </div>
              </div>
            </div>

            {/* Edit Form */}
            {editingItem && (
              <div className="bg-white rounded-xl border border-warm-200 p-6 mb-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-foreground">Edit Item</h3>
                  <button
                    onClick={handleCancel}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      name="itemName"
                      value={formData.itemName}
                      onChange={handleFormChange}
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
                        Status *
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                        required
                      >
                        <option value="pending">Pending</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Date Reported
                    </label>
                    <input
                      type="date"
                      name="dateReported"
                      value={formData.dateReported}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-warm-600 transition font-bold flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      Update Item
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 bg-warm-100 text-foreground py-3 rounded-lg hover:bg-warm-200 transition font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Items List */}
            {lostFoundLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="bg-white rounded-xl border border-warm-200 p-12 text-center text-muted-foreground shadow-sm">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No items found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <div
                    key={item.recordID}
                    className="bg-white rounded-xl border border-warm-200 p-6 shadow-sm hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full flex items-center gap-1 ${
                            item.status === "resolved" 
                              ? "bg-green-100 text-green-700" 
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {item.status === "resolved" ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            {item.status || "pending"}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-foreground">{item.itemName}</h3>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition"
                          title="Edit Item"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.recordID)}
                          disabled={deletingId === item.recordID}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          title="Delete Item"
                        >
                          {deletingId === item.recordID ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {item.itemDescription && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {item.itemDescription}
                      </p>
                    )}

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Tag className="w-4 h-4" />
                        <span>{item.category || "Uncategorized"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {item.dateReported 
                            ? new Date(item.dateReported).toLocaleDateString() 
                            : "No date"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

