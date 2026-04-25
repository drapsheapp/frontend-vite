import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  BarChart3,
  Truck   // 🔥 NEW
} from "lucide-react";

const AdminSidebar = () => {

  const menu = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard"
    },
    {
      label: "Orders",
      icon: Package,
      path: "/admin/orders"
    },
    {
      label: "Customers",
      icon: Users,
      path: "/admin/customers"
    },
    {
      label: "Sample Requests",   // 🔥 NEW
      icon: Truck,
      path: "/admin/sample-requests"
    },
    {
      label: "Analytics",
      icon: BarChart3,
      path: "/admin/analytics"
    }
  ];

  return (

    <div className="w-64 bg-white border-r min-h-screen p-6">

      <h2 className="text-2xl font-bold text-royal-plum mb-10">
        Drapshe Admin
      </h2>

      <div className="space-y-2">

        {menu.map((item) => {

          const Icon = item.icon;

          return (

            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg text-sm font-medium
                ${isActive
                  ? "bg-royal-plum text-white"
                  : "text-gray-600 hover:bg-gray-100"}`
              }
            >

              <Icon size={18} />

              {item.label}

            </NavLink>

          );

        })}

      </div>

    </div>

  );

};

export default AdminSidebar;