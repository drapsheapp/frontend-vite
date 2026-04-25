const HowItWorks = () => {
  return (
    <div className="bg-[#f7f5f2] py-16 px-4">

      <div className="max-w-5xl mx-auto bg-white p-10 rounded-xl shadow-sm">

        <h1 className="text-3xl font-bold text-royal-plum mb-6">
          How Drapshe Works
        </h1>

        <p className="text-gray-600 mb-10">
          Drapshe makes custom clothing simple. Instead of standard sizes,
          you can design garments tailored to your exact measurements and
          style preferences.
        </p>

        <div className="space-y-8">

          <div>
            <h2 className="text-xl font-semibold text-royal-plum">
              1. Choose Your Style
            </h2>
            <p className="text-gray-600">
              Select the garment you want such as blouse, kurta set, pant or
              salwar kameez from our collection.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-royal-plum">
              2. Customize Your Design
            </h2>
            <p className="text-gray-600">
              Choose sleeve style, neckline, waist style, pockets and other
              customization options.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-royal-plum">
              3. Add Measurements
            </h2>
            <p className="text-gray-600">
              Enter your measurements or select an existing measurement profile.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-royal-plum">
              4. Place Order
            </h2>
            <p className="text-gray-600">
              Complete checkout securely and confirm your custom garment order.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-royal-plum">
              5. Stitching & Delivery
            </h2>
            <p className="text-gray-600">
              Our expert stitching partners craft your garment and deliver it
              to your doorstep.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default HowItWorks;