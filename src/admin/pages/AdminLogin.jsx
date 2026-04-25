import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api/api";

// ✅ IMPORT LOGO (PUT FILE IN src/assets/logo.png)
import logo from "@/assets/logo.png";

const AdminLogin = () => {

  const navigate = useNavigate();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [loading,setLoading] = useState(false);

  const handleLogin = async () => {

    if(!email || !password){
      alert("Enter email & password");
      return;
    }

    try{
      setLoading(true);

      const res = await API.post("/admin/login",{
        email,
        password
      });

      localStorage.setItem("admin_token", res.data.access_token);

      navigate("/admin/dashboard");

    }catch(e){
      alert("Invalid credentials");
    }finally{
      setLoading(false);
    }

  };

  return (

    <div className="h-screen w-full flex bg-[#062f2f] text-white">

      {/* LEFT SIDE */}
      <div className="w-1/2 flex flex-col items-center justify-center text-center">

        {/* ✅ LOGO FIXED */}
        <img 
          src={logo}
          alt="Drapshe Logo"
          className="w-52 mb-6"
        />

        {/* BRAND NAME */}
        <h1 className="text-4xl font-semibold tracking-wide">
          Drapshe
        </h1>

        {/* SLOGAN */}
        <p className="text-sm mt-2 opacity-70">
          Clothing for every occasion
        </p>

      </div>

      {/* CENTER DIVIDER */}
      <div className="w-[1px] bg-white opacity-30 my-20"></div>

      {/* RIGHT SIDE */}
      <div className="w-1/2 flex items-center justify-center">

        <div className="w-80 text-center">

          <h2 className="text-2xl mb-1">
            Welcome
          </h2>

          <p className="text-xs opacity-70 mb-6">
            Please login to Admin Dashboard
          </p>

          <input
            className="w-full mb-3 px-3 py-2 bg-white text-black rounded-sm outline-none"
            placeholder="Username"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />

          <input
            className="w-full mb-6 px-3 py-2 bg-white text-black rounded-sm outline-none"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-[#ff6a00] hover:opacity-90 text-white py-2 text-sm font-semibold tracking-wide"
          >
            {loading ? "LOGGING..." : "LOGIN"}
          </button>

          <p className="text-[10px] mt-3 opacity-70 cursor-pointer">
            FORGOTTEN YOUR PASSWORD?
          </p>

        </div>

      </div>

    </div>

  );

};

export default AdminLogin;