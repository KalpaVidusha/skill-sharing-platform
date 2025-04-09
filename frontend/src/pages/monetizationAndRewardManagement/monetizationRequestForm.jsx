import React, { useState } from "react";
import "../../styles/monetization.css"; // Import the external CSS file

const PersonalInformationForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/api/personal-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        alert("Form submitted successfully!");
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          address: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        });
      } else {
        alert("Failed to submit form.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("An error occurred while submitting the form.");
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">1. Personal / Business Information</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name / Business Name"
            value={formData.fullName}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="input"
            required
          />
          <input
            type="text"
            name="address"
            placeholder="Street Address"
            value={formData.address}
            onChange={handleChange}
            className="input"
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            className="input"
          />
          <input
            type="text"
            name="state"
            placeholder="State / Province"
            value={formData.state}
            onChange={handleChange}
            className="input"
          />
          <input
            type="text"
            name="postalCode"
            placeholder="Zip / Postal Code"
            value={formData.postalCode}
            onChange={handleChange}
            className="input"
          />
          <input
            type="text"
            name="country"
            placeholder="Country"
            value={formData.country}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div className="submit-btn-container">
          <button
            type="submit"
            className="submit-btn"
          >
            Save & Continue
          </button>
        </div>
      </form>

      {submitted && (
        <p className="success-message">
          Your information was saved successfully!
        </p>
      )}
    </div>
  );
};

export default PersonalInformationForm;
