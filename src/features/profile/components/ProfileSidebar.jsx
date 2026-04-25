const ProfileSidebar = ({ activeTab, setActiveTab }) => {

  const menu = [
    { id: "orders", label: "My Orders" },
    { id: "tracking", label: "Track Orders" }, // ✅ NEW
    { id: "measurements", label: "Measurements" },
    { id: "addresses", label: "Saved Addresses" },
    { id: "alterations", label: "Alteration Requests" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">

      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Account
      </h2>

      <div className="space-y-2">

        {menu.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full text-left px-4 py-3 rounded-lg transition font-medium
              ${
                activeTab === item.id
                  ? "bg-royal-plum text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
          >
            {item.label}
          </button>
        ))}

      </div>

    </div>
  );
};

export default ProfileSidebar;