import {  useState } from "react";
import { OnboardingContext } from "./OnboardingContext";


export const OnboardingProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    basicInfo: {
      name: "",
      email: "",
      phone: ""
    },
    business: {
      businessName: "",
      type: "",
      address: "",
      city: "",
      state: "",
      pincode: ""
    },
    store: {
      storeName: "",
      description: "",
      address: ""
    },
    branding: {
      logo: "",
      banner: "",
      instagram: "",
      facebook: "",
      website: ""
    },
    bank: {
      accountName: "",
      accountNumber: "",
      ifsc: "",
      bankName: ""
    },
    tax: {
      pan: "",
      gst: ""
    },
    kyc: {
      aadhar: "",
      pan: "",
      file: null
    }
  });

  const updateSection = (section, data) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...data
      }
    }));
  };

  return (
    <OnboardingContext.Provider value={{ formData, updateSection }}>
      {children}
    </OnboardingContext.Provider>
  );
};