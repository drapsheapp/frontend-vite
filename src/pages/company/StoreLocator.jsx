import React from "react";

const StoreLocator = () => {
  return (
    <div className="bg-[#faf9f7] min-h-screen py-14 px-4">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl md:text-4xl font-bold text-center text-royal-plum mb-6">
          Store Locator
        </h1>

        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
          Visit our partner stitching studios and experience Drapshe quality craftsmanship.
          Our studios help customers with measurements, customization guidance,
          and order assistance.
        </p>

        <div className="grid md:grid-cols-2 gap-8">

          {/* Gurugram Studio */}

          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">

            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Drapshe Studio – Gurugram
            </h2>

            <p className="text-gray-600 mb-4">
              Purakart India Private Limited <br/>
              1/6, Near Plot No.105 <br/>
              Udyog Vihar Phase VI <br/>
              Sector 37 <br/>
              Gurugram, Haryana – 122001 <br/>
              India
            </p>

            <h3 className="font-semibold mb-2">Services Available</h3>

            <ul className="list-disc pl-6 text-gray-600 space-y-1">
              <li>Measurement assistance</li>
              <li>Custom clothing consultation</li>
              <li>Order support</li>
              <li>Fabric & design guidance</li>
            </ul>

          </div>

          {/* Pataudi Studio */}

          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">

            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Drapshe Studio – Pataudi
            </h2>

            <p className="text-gray-600 mb-4">
              Drapshe Stitching Studio <br/>
              Near Nohta Chowk <br/>
              Pataudi <br/>
              Gurugram, Haryana – 122503 <br/>
              India
            </p>

            <h3 className="font-semibold mb-2">Services Available</h3>

            <ul className="list-disc pl-6 text-gray-600 space-y-1">
              <li>Custom garment consultation</li>
              <li>Body measurement support</li>
              <li>Drapshe order assistance</li>
              <li>Personalized fitting guidance</li>
            </ul>

          </div>

        </div>

      </div>

    </div>
  );
};

export default StoreLocator;