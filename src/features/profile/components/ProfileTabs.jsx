import { Button } from "@/components/ui/button";

const tabs = [
  { key: "orders", label: "Orders" },
  { key: "measurements", label: "Measurements" },
  { key: "addresses", label: "Addresses" },
  { key: "alterations", label: "Alterations" },
  { key: "wallet", label: "Wallet" },
];

const ProfileTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-3 flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <Button
          key={tab.key}
          variant={activeTab === tab.key ? "default" : "ghost"}
          onClick={() => setActiveTab(tab.key)}
          className={
            activeTab === tab.key
              ? "bg-royal-plum text-white"
              : ""
          }
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
};

export default ProfileTabs;