import React from "react";

const ShippingPolicy = () => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-14">

      <h1 className="text-3xl font-bold text-royal-plum mb-6">
        Shipping Policy
      </h1>

      <p className="text-gray-600 mb-6">
        At Drapshe, we strive to deliver your orders safely and on time.
        Since many of our garments are custom stitched, shipping timelines
        may vary depending on the production process.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">
        Order Processing Time
      </h2>

      <ul className="list-disc pl-6 text-gray-600 space-y-2">
        <li>Custom stitched garments typically take 5–10 working days for stitching and quality checks.</li>
        <li>Once the garment passes inspection, it is packed and shipped.</li>
        <li>Ready-made products (if available) are usually processed within 1–2 working days.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2">
        Shipping Timeline
      </h2>

      <ul className="list-disc pl-6 text-gray-600 space-y-2">
        <li>Metro cities: 2–4 working days</li>
        <li>Other cities / towns: 3–7 working days</li>
      </ul>

      <p className="text-gray-600 mt-3">
        Delivery timelines may vary due to logistics conditions or public holidays.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">
        Shipping Charges
      </h2>

      <p className="text-gray-600">
        Drapshe may offer free shipping on eligible orders. For orders that do
        not qualify for free shipping, delivery charges will be displayed at
        checkout before payment.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">
        Order Tracking
      </h2>

      <p className="text-gray-600">
        Once your order is shipped, you will receive tracking details via email,
        SMS, or WhatsApp. You can also track your order from your Drapshe account.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">
        Delivery Delays
      </h2>

      <p className="text-gray-600">
        Delivery delays may occur due to high order volume, logistics issues,
        weather conditions, or public holidays. Our team will keep you updated
        in case of any delay.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">
        Incorrect Address
      </h2>

      <p className="text-gray-600">
        Customers must provide accurate delivery address details. Drapshe will
        not be responsible for delivery issues caused by incorrect addresses.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-2">
        Need Help?
      </h2>

      <p className="text-gray-600">
        Email: support@drapshe.com
        <br />
        Phone / WhatsApp: +91 9205445152
      </p>

    </div>
  );
};

export default ShippingPolicy;