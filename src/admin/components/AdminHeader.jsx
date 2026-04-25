import { useAuth } from "@/context/AuthContext";

const AdminHeader = () => {

  const { user } = useAuth();

  return (

    <div className="h-16 border-b flex items-center justify-between px-6 bg-white">

      <h2 className="font-semibold text-lg">
        Admin Panel
      </h2>

      <div className="text-sm text-gray-600">
        {user?.phone}
      </div>

    </div>

  );

};

export default AdminHeader;