import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { adminAPI } from "../api/admin.api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { downloadInvoice } from "../../api/api";

const AdminOrderDetail = () => {

const { id } = useParams();
const navigate = useNavigate();

const [order, setOrder] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [updating, setUpdating] = useState(false);
const [successMsg, setSuccessMsg] = useState("");
const statusOptions = [
  "confirmed",
  "in_production",
  "stitching",
  "qc",
  "shipped",
  "delivered",
  "cancelled",
];

useEffect(() => {
loadOrder();
}, [id]);

const loadOrder = async () => {
try {
setLoading(true);
const { data } = await adminAPI.getOrderById(id);
setOrder(data);
} catch (err) {
console.error("Failed to load order", err);
setError("Failed to load order");
} finally {
setLoading(false);
}
};

const handleStatusChange = async (newStatus) => {
try {
setUpdating(true);
await adminAPI.updateOrderStatus(id, newStatus);
await loadOrder();
setSuccessMsg("Order status updated successfully!");
} catch (err) {
console.error("Failed to update status", err);
setSuccessMsg("Failed to update status");
} finally {
setUpdating(false);
}
};

/* =========================================
TAILOR SHEET PDF
========================================= */

const downloadPDF = async (item) => {

const doc = new jsPDF();

const customization = item?.customization_snapshot || {};
const measurements = item?.measurement_snapshot || {};
const address = order?.address || {};

const category = customization?.category?.toLowerCase() || "";

const imageUrl =
item?.image_url || item?.customization_snapshot?.image_url;

doc.setFontSize(18);
doc.text("DRAPSHE - TAILOR MEASUREMENT SHEET", 14, 20);

doc.setFontSize(12);

doc.text(`Order ID : ${order.order_id}`, 14, 35);
doc.text(`Customer Name : ${address.name || "-"}`, 14, 42);
doc.text(`Phone : ${order.user_phone}`, 14, 49);

doc.text(`Address : ${address.address_line1 || ""}`, 14, 56);
doc.text(`${address.city || ""} ${address.state || ""} ${address.pincode || ""}`, 14, 63);

doc.text(`Product : ${item?.name}`, 14, 78);

if (imageUrl) {

const img = new Image();
img.crossOrigin = "anonymous";
img.src = imageUrl;

await new Promise((resolve) => {
img.onload = resolve;
});

try {
doc.addImage(img, "JPEG", 150, 40, 40, 40);
} catch (err) {
console.warn("Image load failed in PDF");
}

}

/* STYLE OPTIONS */

const styleRows = Object.entries(customization)
.filter(([k, v]) => typeof v !== "object" && k !== "image_url")
.map(([k, v]) => [
k.replace(/_/g, " ").toUpperCase(),
String(v)
]);

autoTable(doc, {
startY: 95,
head: [["STYLE OPTION", "VALUE"]],
body: styleRows
});

/* CATEGORY BASED MEASUREMENTS */

const topKeys = [
"bust",
"underbust",
"shoulder",
"armhole",
"waist_top",
"length_top"
];

const bottomKeys = [
"waist_bottom",
"hip",
"thigh",
"knee",
"calf",
"ankle",
"crotch_rise",
"length_bottom"
];

const topMeasurements = [];
const bottomMeasurements = [];

Object.entries(measurements).forEach(([k, v]) => {

const key = k.toLowerCase();

if (category.includes("blouse")) {

if (topKeys.includes(key)) {
topMeasurements.push([
k.replace(/_/g," ").toUpperCase(),
`${v}"`
]);
}

}

else if (category.includes("pant")) {

if (bottomKeys.includes(key)) {
bottomMeasurements.push([
k.replace(/_/g," ").toUpperCase(),
`${v}"`
]);
}

}

else {

if (topKeys.includes(key)) {
topMeasurements.push([
k.replace(/_/g," ").toUpperCase(),
`${v}"`
]);
}

if (bottomKeys.includes(key)) {
bottomMeasurements.push([
k.replace(/_/g," ").toUpperCase(),
`${v}"`
]);
}

}

});

/* TOP TABLE */

if (topMeasurements.length > 0) {

autoTable(doc, {
startY: doc.lastAutoTable.finalY + 10,
head: [["TOP MEASUREMENTS", "VALUE"]],
body: topMeasurements
});

}

/* BOTTOM TABLE */

if (bottomMeasurements.length > 0) {

autoTable(doc, {
startY: doc.lastAutoTable.finalY + 10,
head: [["BOTTOM MEASUREMENTS", "VALUE"]],
body: bottomMeasurements
});

}

doc.save(`tailor-sheet-${order.order_id}-${item.name}.pdf`);

};

if (loading) return <div className="p-6">Loading...</div>;
if (error) return <div className="p-6 text-red-500">{error}</div>;
if (!order) return <div className="p-6">Order not found</div>;

// ✅ PAYMENT FIX (IMPORTANT)
const paymentMethod = (
  order?.payment_method ||
  order?.payment_type ||
  order?.payment ||
  ""
).toLowerCase();

// ✅ FIXED PAYMENT LOGIC (AUTO)
const paymentStatus =
  paymentMethod === "cod" && order.status === "delivered"
    ? "Paid"
    : (order?.payment_status || "pending").toLowerCase() === "paid"
    ? "Paid"
    : "pending";

return (

<div className="p-6 max-w-6xl mx-auto">

<div className="flex items-center justify-between mb-5">

  {/* LEFT SIDE */}
  <div className="flex items-center gap-3">

    <button
      onClick={() => navigate("/admin/orders")}
      className="flex items-center gap-2 px-3 py-1.5 border rounded-lg bg-gray-50 hover:bg-gray-100 transition text-sm"
    >
      <ArrowLeft size={16} />
      Back to Orders
    </button>

    <div>
      <h1 className="text-xl font-semibold">Order Detail</h1>

      {/* ✅ PAYMENT INFO */}
<div className="flex items-center gap-3 mt-2">

  {/* PAYMENT TYPE */}
  <span
    className={`px-3 py-1 text-xs font-semibold rounded-full ${
      paymentMethod === "cod"
        ? "bg-gray-300 text-black"
        : "bg-blue-600 text-white"
    }`}
  >
    {paymentMethod === "cod" ? "COD" : "ONLINE"}
  </span>

  {/* PAYMENT STATUS */}
  <span
    className={`px-3 py-1 text-xs font-semibold rounded-full ${
      paymentStatus === "Paid"
        ? "bg-green-100 text-green-700"
        : "bg-yellow-100 text-yellow-700"
    }`}
  >
    {paymentStatus}
  </span>

</div>

      {/* ✅ NEW LINE ADD */}
      <div className="flex items-center gap-2 mt-1">

  <span className="text-sm text-gray-500">
    Order ID:
  </span>

  <span className="px-4 py-2 text-sm font-bold bg-gray-900 text-white rounded-lg shadow-sm tracking-wide">
    {order.order_id}
  </span>

</div>

    </div>

  </div>

</div>

<div className="mb-5">

<h2 className="text-lg font-semibold mb-4">Ordered Items</h2>

{Array.isArray(order.items) && order.items.map((item, i) => {

const imageUrl =
item?.image_url || item?.customization_snapshot?.image_url;

const measurements = item?.measurement_snapshot || {};
const customization = item?.customization_snapshot || {};

const category = customization?.category?.toLowerCase() || "";

const topKeys = [
"bust",
"underbust",
"shoulder",
"armhole",
"waist_top",
"length_top"
];

const bottomKeys = [
"waist_bottom",
"hip",
"thigh",
"knee",
"calf",
"ankle",
"crotch_rise",
"length_bottom"
];

const topMeasurements = [];
const bottomMeasurements = [];

Object.entries(measurements).forEach(([k, v]) => {

const key = k.toLowerCase();

if (category.includes("blouse")) {

if (topKeys.includes(key)) {
topMeasurements.push([k,v]);
}

}

else if (category.includes("pant")) {

if (bottomKeys.includes(key)) {
bottomMeasurements.push([k,v]);
}

}

else {

if (topKeys.includes(key)) {
topMeasurements.push([k,v]);
}

if (bottomKeys.includes(key)) {
bottomMeasurements.push([k,v]);
}

}

});

return (

<div key={i} className="border rounded-lg p-4 mb-4 bg-white shadow-sm">

<div className="flex items-center justify-between border-b pb-3 mb-3">

<div className="flex items-center gap-3">

{imageUrl && (
<img
src={imageUrl}
alt={item.name}
className="w-16 h-16 object-cover rounded-md border"
/>
)}

<div>
<p className="font-semibold text-base text-gray-800">
{item.name}
</p>
<p className="text-xs text-gray-500">
Custom Garment
</p>
</div>

</div>

<div className="text-right">
<p className="text-xs text-gray-500">
₹{item.price} × {item.quantity}
</p>
<p className="font-semibold text-gray-900">
₹{item.line_total}
</p>
</div>

</div>

<button
onClick={() => downloadPDF(item)}
className="mb-3 bg-black text-white text-sm px-3 py-1.5 rounded hover:bg-gray-800"
>
Download Tailor Sheet
</button>

<button
  onClick={() => downloadInvoice(order._id)}
  className="mb-3 ml-2 bg-green-600 text-white text-sm px-3 py-1.5 rounded hover:bg-green-700"
>
  Download Invoice
</button>

{/* STYLE */}

<div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">

{Object.entries(customization).map(([k, v]) => (

typeof v !== "object" &&
k !== "image_url" && (

<div key={k} className="bg-blue-50 p-2 rounded border border-blue-100">

<p className="text-[10px] text-blue-400 uppercase">
{k.replace(/_/g," ")}
</p>

<p className="text-sm font-medium text-gray-700">
{String(v)}
</p>

</div>

)

))}

</div>

{/* TOP */}

{topMeasurements.length > 0 && (

<div className="grid grid-cols-3 md:grid-cols-6 gap-2">

{topMeasurements.map(([k, v]) => (

<div key={k} className="bg-green-50 p-2 rounded border border-green-100">

<p className="text-[10px] text-green-500 uppercase">
{k.replace(/_/g," ")}
</p>

<p className="text-sm font-bold text-gray-800">
{v}"
</p>

</div>

))}

</div>

)}

{/* BOTTOM */}

{bottomMeasurements.length > 0 && (

<div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4">

{bottomMeasurements.map(([k, v]) => (

<div key={k} className="bg-green-50 p-2 rounded border border-green-100">

<p className="text-[10px] text-green-500 uppercase">
{k.replace(/_/g," ")}
</p>

<p className="text-sm font-bold text-gray-800">
{v}"
</p>

</div>

))}

</div>

)}

</div>

);

})}

</div>

{/* ================= UPDATE ORDER STATUS ================= */}

<div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 shadow-md mt-4">

  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

    {/* LEFT */}
    <div>
      <h2 className="text-lg font-semibold text-gray-900">
        Update Order Status
      </h2>
      <p className="text-sm text-gray-500 mt-1">
        Change order stage for production & delivery
      </p>
    </div>

    {/* RIGHT CONTROLS */}
    <div className="flex gap-3 items-center">

      {/* DROPDOWN */}
      <select
        value={order.status}
        onChange={(e) => handleStatusChange(e.target.value)}
        className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        disabled={updating}
      >
        {statusOptions.map((status) => (
          <option key={status} value={status}>
            {status.replace("_", " ").toUpperCase()}
          </option>
        ))}
      </select>

      {/* BUTTON */}
      <button
        onClick={() => handleStatusChange(order.status)}
        disabled={updating}
        className={`px-5 py-2 rounded-xl text-sm font-semibold text-white shadow-md transition 
        ${
          updating
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-pink-500 to-rose-500 hover:scale-105 hover:shadow-lg"
        }`}
      >
        {updating ? "Updating..." : "Update"}
      </button>

    </div>

  </div>

</div>

{/* ================= ORDER SUMMARY ================= */}

<div className="border rounded-lg p-4 bg-white shadow-sm mt-4">

  <h2 className="text-lg font-semibold mb-3">Order Summary</h2>

  <div className="flex justify-between text-sm mb-2">
    <span>Subtotal</span>
    <span>₹{order.subtotal}</span>
  </div>

  <div className="flex justify-between text-sm mb-2">
    <span>Tax (5%)</span>
    <span>₹{order.tax_amount}</span>
  </div>

  <div className="flex justify-between text-sm mb-2">
    <span>Delivery Charges</span>
    <span>₹{order.delivery_fee}</span>
  </div>

  <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-3">
    <span>Total</span>
    <span>₹{order.total_amount}</span>
  </div>

</div>

{/* ================= CUSTOMER DETAILS ================= */}

<div className="border rounded-xl p-5 bg-white shadow-sm mt-5">

  <h2 className="text-lg font-semibold mb-4">Customer Details</h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">

    {/* LEFT SIDE */}
    <div className="space-y-4">

      <div>
        <p className="text-gray-400 text-xs">Customer Name</p>
        <p className="font-semibold text-gray-800 text-base">
          {order.address?.name || "-"}
        </p>
      </div>

      <div>
        <p className="text-gray-400 text-xs">Phone Number</p>
        <p className="font-semibold text-gray-800">
          {order.user_phone || "-"}
        </p>
      </div>

      <div>
        <p className="text-gray-400 text-xs mb-1">Full Address</p>
        <p className="font-medium text-gray-700 leading-relaxed">
          {order.address?.address_line1 || ""}
          {order.address?.address_line2 && `, ${order.address?.address_line2}`}
        </p>
      </div>

    </div>

    {/* RIGHT SIDE */}
    <div className="space-y-4">

      <div>
        <p className="text-gray-400 text-xs">City</p>
        <p className="font-medium text-gray-800">
          {order.address?.city || "-"}
        </p>
      </div>

      <div>
        <p className="text-gray-400 text-xs">State</p>
        <p className="font-medium text-gray-800">
          {order.address?.state || "-"}
        </p>
      </div>

      <div>
        <p className="text-gray-400 text-xs">Pincode</p>
        <p className="font-medium text-gray-800">
          {order.address?.pincode || "-"}
        </p>
      </div>

    </div>

  </div>

</div>

{successMsg && (
  <div className="fixed inset-0 flex items-center justify-center z-50">

    {/* BACKDROP */}
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

    {/* POPUP */}
    <div className="relative bg-white rounded-2xl shadow-2xl px-8 py-6 w-[90%] max-w-sm text-center animate-fadeIn">

      {/* ICON */}
      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
        <span className="text-green-600 text-2xl">✔</span>
      </div>

      {/* TITLE */}
      <h3 className="text-lg font-semibold text-gray-900">
        Success
      </h3>

      {/* MESSAGE */}
      <p className="text-sm text-gray-500 mt-2">
        {successMsg}
      </p>

      {/* BUTTON */}
      <button
        onClick={() => setSuccessMsg("")}
        className="mt-5 w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2 rounded-xl font-medium hover:scale-105 transition"
      >
        Done
      </button>

    </div>

  </div>
)}

</div>
);
};

export default AdminOrderDetail;