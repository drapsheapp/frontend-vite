import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { GoogleLogin } from "@react-oauth/google";
import API from '@/api/api';
import { toast } from 'sonner';

const Login = () => {
  const [step, setStep] = useState('email'); 
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // ✅ FUTURE MOBILE
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();
  const { loadCart } = useCart();

  /* ================= EMAIL OTP SEND ================= */
  const handleSendEmailOTP = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/auth/send-email-otp", { email });
      if (response.data.success || response.status === 200) {
        toast.success("OTP sent to your email");
        setStep('email-otp');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY EMAIL OTP ================= */
  const handleVerifyEmailOTP = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/auth/verify-email-otp", {
        email,
        otp: otp
      });

      if (response.data.token) {
        login(response.data.token, {
          email: email,
          name: "Customer",
          user_id: response.data.user_id // 🔥 ADD THIS
        });

        // 🔥 MOST IMPORTANT
        localStorage.setItem("user_id", response.data.user_id);
        await loadCart();
        toast.success('Login successful!');
        const redirectTo = location.state?.from ?? "/profile";

        navigate(redirectTo, { 
          replace: true,
          state: location.state 
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ================= GOOGLE LOGIN ================= */
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await API.post("/auth/google", {
        token: credentialResponse.credential
      });

      if (res.data.token && res.data.user_id) {
        login(res.data.token, {
          ...res.data.user,
          user_id: res.data.user_id
        });

        localStorage.setItem("user_id", res.data.user_id);

        await loadCart();
        toast.success("Google Login Successful 🚀");

        const redirectTo = location.state?.from ?? "/profile";

        navigate(redirectTo, { 
          replace: true,
          state: location.state
        });

      } else {
        toast.error("Login failed: Missing user data");
      }
      
    } catch (err) {
        console.error("Google login error:", err);
        toast.error(err.response?.data?.message || "Google login failed");
      }
  };

  /* ================= FUTURE MOBILE OTP ================= */
  /*
  const handleSendPhoneOTP = async () => {
    try {
      await API.post("/auth/send-otp", {
        phone_number: phone
      });
      toast.success("OTP sent to phone");
      setStep("phone-otp");

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyPhoneOTP = async () => {
    try {
      const res = await API.post("/auth/verify-otp", {
        phone_number: phone,
        otp_code: otp
      });

      if (res.data.token) {
        login(res.data.token, phone);
        await loadCart();
        navigate("/profile", { replace: true });
      }
    } catch {
      toast.error("Invalid OTP");
    }
  };
  */

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#F8F5F2]">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">

          {/* HEADER */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif font-semibold text-[#7A0C18] mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              {step === 'email' ? 'Login to your account' : 'Verify your identity'}
            </p>
          </div>

          {/* GOOGLE LOGIN */}
          <div className="mb-6 flex flex-col items-center justify-center border-b pb-6 border-gray-100">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google Login Failed")}            
            />
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="mx-3 text-sm text-gray-400">OR CONTINUE WITH EMAIL</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
          </div>

          {/* EMAIL STEP */}
          {step === 'email' && (
            <div className="space-y-5 mt-2">
              <Input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7A0C18] focus:border-[#7A0C18]"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button
                onClick={handleSendEmailOTP}
                disabled={loading || !email}
                className="w-full bg-[#7A0C18] hover:bg-[#5E0A13] text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? 'Sending OTP...' : 'Continue with Email'}
              </Button>
            </div>
          )}

          {/* EMAIL OTP STEP */}
          {step === 'email-otp' && (
            <div className="space-y-5 mt-2">

              <InputOTP maxLength={6} value={otp} onChange={setOtp} className="justify-center">
                <InputOTPGroup className="gap-2">
                  {[0,1,2,3,4,5].map(i => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="w-12 h-12 border rounded-lg text-lg focus:ring-2 focus:ring-[#7A0C18]"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>

              <Button
                onClick={handleVerifyEmailOTP}
                disabled={loading || otp.length !== 6}
                className="w-full bg-[#7A0C18] hover:bg-[#5E0A13] text-white py-3 rounded-lg font-semibold shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>

              <button
                onClick={() => setStep('email')}
                className="text-sm text-[#7A0C18] font-medium text-center w-full hover:underline"
              >
                Change Email
              </button>
            </div>
          )}

          {/* ================= FUTURE MOBILE UI ================= */}
          {/*
          {step === 'phone' && (
            <div className="space-y-5 mt-2">
              <Input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Button onClick={handleSendPhoneOTP} className="w-full">
                Send OTP
              </Button>
            </div>
          )}
          */}

          {/* FOOTER */}
          <div className="mt-8 pt-6 border-t border-silk-border">
            <p className="text-xs text-gray-500 text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;