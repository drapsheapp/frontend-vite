import React, { useState, useEffect } from "react";
import API from "@/api/api";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { orderAPI } from "@/features/orders/api/orders.api";
import { profileAPI } from "@/features/profile/api/profile.api";
import { calculatePricing } from "@/lib/pricing";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";

import { toast } from "sonner";
import { Loader2, Tag } from "lucide-react";

const CheckoutPage = () => {

  const { cart, getTotalAmount, clearCart, loadCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [coupon, setCoupon] = useState("");

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressList, setShowAddressList] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  /* LOAD ADDRESSES */

  useEffect(() => {

     if (!user) return; // ⭐ सबसे important fix

     const loadAddresses = async () => {

       try {

         const res = await profileAPI.getAddresses();
         const data = res.data || [];

         setAddresses(data);

         if (data.length === 0) {
           setShowAddAddress(true);
           return;
         }

         const defaultAddress =
           data.find(a => a.is_default) || data[0];

         if (defaultAddress) {
           selectAddress(defaultAddress);
         }
  
       } catch (e) {

         console.error("Address load failed", e);

         if (e.response?.status === 401) {
           toast.error("Session expired. Login again.");
         }

       }

     };

     loadAddresses();

   }, [user]); // ⭐ dependency add करो

  useEffect(() => {

  if (!cart.length && !loading && !orderPlaced) {
    navigate("/cart");
  }

}, [cart, loading, orderPlaced, navigate]);

  const selectAddress = (address) => {

    setSelectedAddressId(address._id);
    setShowAddressList(false);
    setShowAddAddress(false);

    setShippingAddress({
      name: address.name,
      phone: address.phone,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    });

  };

  /* ADD NEW ADDRESS */

  const handleAddAddress = async () => {

    // ✅ PHONE VALIDATION
    if (!newAddress.phone || !/^[6-9]\d{9}$/.test(newAddress.phone)) {
      toast.error("Enter valid 10-digit phone number");
      return;
    }

    // ✅ REQUIRED FIELDS
    if (!newAddress.name || !newAddress.address_line1) {
      toast.error("Fill all required fields");
      return;
    }

    try {

      await profileAPI.addAddress(newAddress);

      toast.success("Address Added");

      const res = await profileAPI.getAddresses();
      const updated = res.data || [];

      setAddresses(updated);

      const last = updated[updated.length - 1];
      if (last) selectAddress(last);

      setNewAddress({
        name: "",
        phone: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        pincode: "",
      });

    } catch (e) {

      toast.error("Failed to add address");

    }

  };

  const pricing = calculatePricing(getTotalAmount());

  const subtotal = pricing.subtotal;
  const tax = pricing.tax;
  const delivery = pricing.delivery;
  const total = pricing.total;

  const handleOnlinePayment = async (orderId) => {
    
    try {

      const res = await API.post("/create-payment",{ 
        order_id: orderId }
      );

      const data = res.data;

      const cashfree = window.Cashfree({
        mode: "sandbox"
      });

      cashfree.checkout({
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_modal"
      });
 
    } catch (err) {
      console.error("Payment failed", err);
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Payment failed. Try again.");
      }
    }
  
  };
  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.address_line1) {
      toast.error("Please select or add delivery address");
      return;
    }
    if (!paymentMethod) {
      toast.error("Please select payment method");
      return;
    }

    if (!cart.length) {
      toast.error("Cart empty");
      return;
    }

    if (loading) return;

    setLoading(true);

    try {

      const hasSample = cart.some(
        (item) =>
          item.size_mode === "sample" ||
          item.configuration?.size_mode === "sample"
      );

      const orderSizeMode = hasSample ? "sample" : "measurement";

      const sampleItem = cart.find(
        (item) =>
          item.size_mode === "sample" ||
          item.configuration?.size_mode === "sample"
      );

      const orderSamplePickup =
        sampleItem?.sample_pickup ||
        sampleItem?.configuration?.sample_pickup ||
        null;

      const response = await orderAPI.createOrder({
        items: cart.map((item) => ({
          product_id: item.product_id || item.id,
          name: item.product_name || item.name,
          quantity: item.quantity,
          locked_price: item.price,

          configuration: item.configuration || {},
        })),

        // 🔥 MAIN FIX (TOP LEVEL)
        size_mode: orderSizeMode,
        sample_pickup: orderSamplePickup,

        measurement_id: localStorage.getItem("measurement_id"),

        delivery_address: shippingAddress,
        payment_method: paymentMethod,
      });

      const orderId =
        response?.data?.order_id ||
        response?.data?._id ||
        response?.data?.id;

      const handleOrderSuccess = async () => {

        setOrderPlaced(true);
        clearCart();
        await loadCart();

        navigate(`/order-success/${orderId}`);

      };

      if (paymentMethod === "online") {

        await handleOnlinePayment(orderId);

        return;

      }

      if (paymentMethod === "cod") {
        toast.success("Order placed successfully");
        await handleOrderSuccess();
      }

    } catch (err) {

      console.error(err);
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen py-12 px-6 md:px-12 lg:px-24 bg-secondary">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-bold mb-10">
          Checkout
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid lg:grid-cols-3 gap-10"
        >

          {/* LEFT SIDE */}

          <div className="lg:col-span-2 space-y-8">

            {/* DEFAULT ADDRESS */}

            {addresses.length > 0 && (

              <Card className="bg-white shadow-md border rounded-xl">

                <CardHeader className="flex flex-row items-center justify-between">

                  <CardTitle>
                    Delivering To
                  </CardTitle>

                  <button
                    type="button"
                    className="text-sm text-royal-plum font-medium"
                    onClick={() => {
                      setShowAddressList(!showAddressList)
                      setShowAddAddress(false)
                    }}
                  >
                    Change
                  </button>

                </CardHeader>

                <CardContent>

                  <p className="font-semibold text-lg">
                    {shippingAddress.name}
                  </p>

                  <p className="text-gray-600">
                    {shippingAddress.address_line1}
                  </p>

                  <p className="text-gray-600">
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.pincode}
                  </p>

                  <p className="text-gray-600">
                    📞 {shippingAddress.phone}
                  </p>

                </CardContent>

              </Card>

            )}

            {/* ADDRESS LIST */}

            {showAddressList && (

              <Card className="bg-white shadow-md border rounded-xl">

                <CardHeader>
                  <CardTitle>Select Address</CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">

                  {addresses.map((a) => (

                    <div
                      key={a._id}
                      onClick={() => selectAddress(a)}
                      className="border rounded-lg p-4 cursor-pointer hover:border-royal-plum transition"
                    >

                      <p className="font-medium">{a.name}</p>

                      <p className="text-sm text-gray-600">
                        {a.address_line1}
                      </p>

                      <p className="text-sm text-gray-600">
                        {a.city}, {a.state} {a.pincode}
                      </p>

                      <p className="text-sm text-gray-600">
                        📞 {a.phone}
                      </p>

                    </div>

                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={()=>{
                      setShowAddAddress(true)
                      setShowAddressList(false)
                    }}
                  >
                    + Add New Address
                  </Button>

                </CardContent>

              </Card>

            )}

            {/* ADD ADDRESS FORM */}

            {showAddAddress && (

              <Card className="bg-white shadow-md border rounded-xl">

                <CardHeader>
                  <CardTitle>Add Delivery Address</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">

                  <Input placeholder="Full Name"
                    value={newAddress.name}
                    onChange={(e)=>setNewAddress({...newAddress,name:e.target.value})}
                  />

                  <Input
                    placeholder="Enter 10-digit phone number"
                    type="tel"
                    value={newAddress.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ""); // only numbers
                      if (value.length <= 10) {
                        setNewAddress({ ...newAddress, phone: value });
                      }
                    }}
                  />

                  <p className="text-xs text-gray-400">
                    Enter only mobile number (not address)
                  </p>

                  <Input placeholder="Address Line 1"
                    value={newAddress.address_line1}
                    onChange={(e)=>setNewAddress({...newAddress,address_line1:e.target.value})}
                  />

                  <Input placeholder="Address Line 2"
                    value={newAddress.address_line2}
                    onChange={(e)=>setNewAddress({...newAddress,address_line2:e.target.value})}
                  />

                  <div className="grid grid-cols-3 gap-3">

                    <Input placeholder="City"
                      value={newAddress.city}
                      onChange={(e)=>setNewAddress({...newAddress,city:e.target.value})}
                    />

                    <Input placeholder="State"
                      value={newAddress.state}
                      onChange={(e)=>setNewAddress({...newAddress,state:e.target.value})}
                    />

                    <Input placeholder="Pincode"
                      value={newAddress.pincode}
                      onChange={(e)=>setNewAddress({...newAddress,pincode:e.target.value})}
                    />

                  </div>

                  <Button
                    type="button"
                    className="w-full py-5 text-lg bg-royal-plum text-white"
                    onClick={handleAddAddress}
                  >
                    Save Address
                  </Button>

                </CardContent>

              </Card>

            )}

            {/* PAYMENT */}

            <Card className="bg-white shadow-md border rounded-xl">

              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>

              <CardContent>

                  {/* COD */}
                  <div
                    onClick={() => setPaymentMethod("cod")}   // ✅ ADD THIS LINE
                    className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition
                      ${paymentMethod === "cod"
                        ? "border-royal-plum bg-royal-plum/5"
                        : "border-gray-300"
                      }`}
                  >
                    <span className="font-medium">
                      Cash on Delivery (COD)
                    </span>

                    {paymentMethod === "cod" && (
                      <span className="text-royal-plum font-semibold">✔</span>
                    )}
                  </div>

                  {/* ONLINE */}
                  <div
                    onClick={() => setPaymentMethod("online")}  // ✅ ADD THIS LINE
                    className={`flex items-center space-x-3 border rounded-lg p-4 mt-3 cursor-pointer transition
                      ${paymentMethod === "online"
                        ? "border-royal-plum bg-royal-plum/5"
                        : "border-gray-300 hover:border-royal-plum"
                      }`}
                  >
                    <span className="font-medium">
                      UPI / Card / Net Banking
                    </span>

                    {paymentMethod === "online" && (
                      <span className="text-royal-plum font-semibold">✔</span>
                    )}
                  </div>

                </CardContent>

              </Card>

          </div>

          {/* RIGHT SIDE */}

          <div className="lg:col-span-1">

            <div className="sticky top-24 space-y-6">

              <Card className="bg-white shadow-md border rounded-xl">

                <CardContent className="p-4 flex gap-2 items-center">

                  <Tag size={18} />

                  <Input
                    placeholder="Apply Coupon"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                  />

                  <Button type="button">
                    Apply
                  </Button>

                </CardContent>

              </Card>

              <Card className="bg-white shadow-md border rounded-xl mb-4">

                <CardHeader>
                  <CardTitle className="text-lg">
                    Review Items ({cart.length})
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id || item.product_id}> className="flex gap-4 items-center">
                      <div className="h-16 w-12 bg-gray-100 rounded-md overflow-hidden">
                        <img src={item.image} alt={item.name} className="object-cover h-full w-full" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.product_name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        {/* 🔥 ADD THIS */}
                        {item.configuration?.recommended_size && (
                        <p className="text-xs text-green-600">
                          Size: {item.configuration.recommended_size}
                        </p>
                      )}

                      {item.configuration?.smartfit_size && (
                        <p className="text-[11px] text-green-500">
                             AI Sized
                           </p>
                        )}
                      </div>
                      <p className="text-sm font-semibold">₹{item.price}</p>
                    </div>
                  ))}
                </CardContent>

              </Card>

              {/* ORDER SUMMARY */}
              <Card className="bg-white shadow-md border rounded-xl">

                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">

                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₹{tax}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>{delivery === 0 ? "FREE" : `₹${delivery}`}</span>
                  </div>

                  <div className="border-t pt-3 flex justify-between text-lg font-semibold">

                    <span>Total</span>

                    <span className="text-royal-plum">
                      ₹{total}
                    </span>

                  </div>

                  <Button
                    type="submit"
                    className="w-full py-6 text-lg bg-royal-plum text-white"
                    disabled={loading}
                  >

                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Place Order"
                    )}

                  </Button>

                </CardContent>

              </Card>

            </div>

          </div>

        </form>

      </div>

    </div>

  );

};

export default CheckoutPage;