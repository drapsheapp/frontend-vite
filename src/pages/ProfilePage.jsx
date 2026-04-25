import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

import ProfileSidebar from "@/features/profile/components/ProfileSidebar";

import OrdersTab from "@/features/profile/tabs/OrdersTab";
import MeasurementsTab from "@/features/profile/tabs/MeasurementsTab";
import AddressTab from "@/features/profile/tabs/AddressTab";
import AlterationsTab from "@/features/profile/tabs/AlterationsTab";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("orders");

  const renderTab = () => {
    switch (activeTab) {
      case "orders":
        return <OrdersTab />;
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
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4">

        {/* HEADER */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-royal-plum">
              My Account
            </h1>

            <p className="text-gray-500 mt-1">
              {user?.name || "Customer"} • {user?.phone}
            </p>
          </div>

          <Button
            variant="outline"
            className="border-royal-plum text-royal-plum hover:bg-royal-plum hover:text-white"
            onClick={logout}
          >
            Logout
          </Button>
        </div>

        {/* DASHBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* SIDEBAR */}
          <div className="md:col-span-1">
            <ProfileSidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>

          {/* CONTENT */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {renderTab()}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProfilePage;