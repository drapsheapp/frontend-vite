import React from "react";

const FAQ = () => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-14">

      <h1 className="text-3xl font-bold text-royal-plum mb-8">
        Frequently Asked Questions
      </h1>

      <div className="space-y-8 text-gray-600">

        <div>
          <h2 className="font-semibold text-lg text-black">What is Drapshe?</h2>
          <p>
            Drapshe is a custom clothing platform where customers can design
            garments tailored to their measurements and style preferences.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-lg text-black">
            What products does Drapshe offer?
          </h2>
          <p>
            Drapshe specializes in custom stitched clothing including blouses,
            kurta sets, salwar suits, and custom pants.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-lg text-black">
            How do I customize my garment?
          </h2>
          <p>
            You can choose design options like neck style, sleeve type, bottom
            style and add your measurements directly on the product page.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-lg text-black">
            Can I save my measurements?
          </h2>
          <p>
            Yes. Drapshe allows you to save measurement profiles so you can use
            them for future orders.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-lg text-black">
            How long does delivery take?
          </h2>
          <p>
            Custom garments usually take 5–10 working days for stitching and
            quality checks before shipping.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-lg text-black">
            Can I return custom garments?
          </h2>
          <p>
            No. Custom stitched garments are made specifically for you and are
            not eligible for return or exchange.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-lg text-black">
            What if I receive a damaged product?
          </h2>
          <p>
            Please contact our support team within 24 hours of delivery if you
            receive a defective or incorrect item.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-lg text-black">
            How can I contact Drapshe?
          </h2>
          <p>
            Email: support@drapshe.com <br />
            Phone / WhatsApp: +91 9205445152
          </p>
        </div>

      </div>
    </div>
  );
};

export default FAQ;