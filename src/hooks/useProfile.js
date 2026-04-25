import { useEffect, useState } from "react";
import { profileAPI } from "@/features/profile/api/profile.api";

export const useProfile = () => {
  const [orders, setOrders] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProfileData = async () => {
    setLoading(true);

    /* ================= ORDERS (CRITICAL) ================= */
    try {
      const ordersRes = await profileAPI.getOrders();
      setOrders(ordersRes.data || []);
    } catch (e) {
      console.error("Orders load failed", e);
    }

    /* ================= MEASUREMENTS (OPTIONAL) ================= */
    try {
      const measureRes = await profileAPI.getMeasurements();
      setMeasurements(measureRes.data || []);
    } catch (e) {
      console.warn("Measurements API not available");
    }

    /* ================= ADDRESSES (OPTIONAL) ================= */
    try {
      const addressRes = await profileAPI.getAddresses();
      setAddresses(addressRes.data || []);
    } catch (e) {
      console.warn("Addresses API not available");
    }

    setLoading(false);
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  return {
    orders,
    measurements,
    addresses,
    loading,
    reload: loadProfileData,
  };
};