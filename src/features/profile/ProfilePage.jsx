import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

import ProfileSidebar from "./components/ProfileSidebar";

import OrdersTab from "./tabs/OrdersTab";
import TrackOrders from "./tabs/TrackOrders"; // ✅ ADD THIS
import MeasurementsTab from "./tabs/MeasurementsTab";
import AddressTab from "./tabs/AddressTab";
import AlterationsTab from "./tabs/AlterationsTab";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const renderTab = () => {
    switch (activeTab) {
      case "orders":
        return <OrdersTab />;
      case "tracking":
        return <TrackOrders />; // ✅ FIXED
      case "measurements":
        return <MeasurementsTab />;
      case "addresses":
        return <AddressTab />;
      case "alterations":
        return <AlterationsTab />;
      default:
        return <OrdersTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-10">
      <div className="max-w-7xl mx-auto px-4">

        <div className="bg-white rounded-xl shadow-sm p-5 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-royal-plum">
              My Account
            </h1>

            <p className="text-gray-500 text-sm mt-1">
              {user?.name || "Customer"} • {user?.phone}
            </p>
          </div>

          <Button
            variant="outline"
            className="border-royal-plum text-royal-plum hover:bg-royal-plum hover:text-white"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>

        <div className="md:hidden overflow-x-auto mb-4">
          <div className="flex gap-2">
            {[
              { key: "orders", label: "Orders" },
              { key: "tracking", label: "Track Orders" },
              { key: "measurements", label: "Measurements" },
              { key: "addresses", label: "Addresses" },
              { key: "alterations", label: "Alterations" }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition ${
                  activeTab === tab.key
                    ? "bg-royal-plum text-white"
                    : "bg-white border"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          <div className="hidden md:block md:col-span-1">
            <ProfileSidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>

          <div className="md:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              {renderTab()}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProfilePage;