import React from "react";

const ContactUs = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-14">

      <h1 className="text-3xl font-bold text-center text-royal-plum mb-10">
        Contact Us
      </h1>

      <div className="grid md:grid-cols-2 gap-12">

        {/* Contact Info */}

        <div className="space-y-6 text-gray-600">

          <p>
            If you have any questions related to orders, customization,
            measurements, or deliveries, our support team is here to help.
          </p>

          <div>
            <h3 className="font-semibold text-lg text-black">
              Customer Support Hours
            </h3>

            <p>Monday – Saturday</p>
            <p>10:00 AM – 7:00 PM (IST)</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-black">
              Customer Support
            </h3>

            <p>Email: support@drapshe.com</p>
            <p>Phone / WhatsApp: +91 9205445152</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-black">
              Business / Partnership Enquiries
            </h3>

            <p>Email: business@drapshe.com</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg text-black">
              Corporate Office
            </h3>

            <p>
              Purakart India Private Limited
              <br />
              1/6, Near Plot No. 105
              <br />
              Udyog Vihar Phase – VI
              <br />
              Sector – 37
              <br />
              Gurugram, Haryana – 122001
              <br />
              India
            </p>
          </div>

        </div>

        {/* Contact Form */}

        <div className="bg-white p-6 rounded-xl shadow border">

          <h2 className="text-xl font-semibold mb-6">
            Drop Us a Message
          </h2>

          <form className="space-y-4">

            <input
              type="text"
              placeholder="Full Name"
              className="w-full border p-3 rounded"
            />

            <input
              type="email"
              placeholder="Email Address"
              className="w-full border p-3 rounded"
            />

            <input
              type="text"
              placeholder="Phone Number"
              className="w-full border p-3 rounded"
            />

            <input
              type="text"
              placeholder="Subject"
              className="w-full border p-3 rounded"
            />

            <textarea
              placeholder="Message"
              rows="4"
              className="w-full border p-3 rounded"
            ></textarea>

            <button
              type="submit"
              className="bg-royal-plum text-white px-6 py-3 rounded w-full"
            >
              Submit
            </button>

          </form>

        </div>

      </div>

    </div>
  );
};

export default ContactUs;