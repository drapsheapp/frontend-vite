import React, { useState } from "react";

const BusinessEnquiry = () => {

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    message: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
  };

  return (
    <div className="bg-[#faf9f7] min-h-screen py-14 px-4">

      <div className="max-w-4xl mx-auto">

        {/* White Card */}

        <div className="bg-white shadow-lg rounded-2xl p-8 md:p-12 border border-gray-100">

          <h1 className="text-3xl md:text-4xl font-bold text-center text-royal-plum mb-4">
            Business Enquiry
          </h1>

          <p className="text-center text-gray-600 mb-10">
            Interested in partnering with Drapshe? Fill out the form below
            and our team will get back to you shortly.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-royal-plum"
              required
            />

            {/* Email */}

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-royal-plum"
              required
            />

            {/* Company */}

            <input
              type="text"
              name="company"
              placeholder="Company / Business Name"
              value={form.company}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-royal-plum"
            />

            {/* Message */}

            <textarea
              name="message"
              placeholder="Tell us about your enquiry..."
              rows="5"
              value={form.message}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-royal-plum"
              required
            />

            {/* Button */}

            <button
              type="submit"
              className="bg-royal-plum text-white px-6 py-3 rounded-lg hover:bg-royal-plum/90 transition"
            >
              Submit Enquiry
            </button>

          </form>

        </div>

      </div>

    </div>
  );
};

export default BusinessEnquiry;