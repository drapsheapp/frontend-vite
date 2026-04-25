import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import { 
  LayoutDashboard, ShoppingCart, Users, BarChart3, 
  Package, Tag, Layers, ChevronLeft, ChevronRight,
  Truck   // 🔥 ADDED
} from "lucide-react";

const AdminLayout = () => {

  const [collapsed, setCollapsed] = useState(false);

  const linkClass = ({ isActive }) =>
    `relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
    ${isActive 
      ? "bg-gradient-to-r from-[#1e293b] to-[#334155] text-white shadow-inner before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] before:bg-[#6366f1] before:rounded-r"
      : "text-gray-400 hover:bg-[#1e293b] hover:text-white"
    }`;

  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">

      {/* 🔥 SIDEBAR */}
      <aside className={`${collapsed ? "w-20" : "w-64"} bg-[#020617] text-white transition-all duration-300 flex flex-col`}>

        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {!collapsed && (
            <h1 className="text-lg font-semibold tracking-wide">
              Drapshe
            </h1>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-[#1e293b]"
          >
            {collapsed ? <ChevronRight size={18}/> : <ChevronLeft size={18}/>}
          </button>
        </div>

        {/* NAV */}
        <nav className="flex-1 px-3 py-4 space-y-2">

          <NavLink to="/admin" end className={linkClass}>
            <LayoutDashboard size={18}/>
            {!collapsed && "Dashboard"}
          </NavLink>

          <NavLink to="/admin/orders" className={linkClass}>
            <ShoppingCart size={18}/>
            {!collapsed && "Orders"}
          </NavLink>

          {/* 🔥 NEW ADDED LINK */}
          <NavLink to="/admin/sample-orders" className={linkClass}>
            <Truck size={18}/>
            {!collapsed && "Sample Orders"}
          </NavLink>

          <NavLink to="/admin/customers" className={linkClass}>
            <Users size={18}/>
            {!collapsed && "Customers"}
          </NavLink>

          <NavLink to="/admin/analytics" className={linkClass}>
            <BarChart3 size={18}/>
            {!collapsed && "Analytics"}
          </NavLink>

          {/* SECTION */}
          {!collapsed && (
            <div className="pt-4 text-[10px] text-gray-500 uppercase tracking-wider px-2">
              Catalog
            </div>
          )}

          <NavLink to="/admin/categories" className={linkClass}>
            <Tag size={18}/>
            {!collapsed && "Categories"}
          </NavLink>

          <NavLink to="/admin/collections" className={linkClass}>
            <Layers size={18}/>
            {!collapsed && "Collections"}
          </NavLink>

          <NavLink to="/admin/products" className={linkClass}>
            <Package size={18}/>
            {!collapsed && "Products"}
          </NavLink>

        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
          {!collapsed && "Drapshe Admin v1.0"}
        </div>

      </aside>

      {/* 🔥 MAIN CONTENT */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>

    </div>
  );
};

export default AdminLayout;