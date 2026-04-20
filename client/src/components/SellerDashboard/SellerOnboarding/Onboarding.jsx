import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from 'axios';

import BasicInfo from "./steps/BasicInfo";
import Business from "./steps/Business";
import Branding from "./steps/Branding";
import Store from "./steps/Store";
import Tax from "./steps/Tax";
import Bank from "./steps/Bank";
import Agreements from "./steps/Agreements";
import KYCPage from "./steps/KYCPage";

import Sidebar from "./StepSidebar";

const Onboarding = () => {
  const [step, setStep] = useState(0);

  const location = useLocation();

const savedUser = JSON.parse(localStorage.getItem("seller"));

const initialData = location.state || {
  fullName: savedUser?.full_name,
  email: savedUser?.email,
  phone: savedUser?.phone,
  shopName: savedUser?.shopname,
  storeName: savedUser?.shopName
};

  const [data, setData] = useState({
  name: initialData.fullName || "",
  email: initialData.email || "",
  phone: initialData.phone || "",

  businessName: initialData.shopName || "",

  address_line1: "",
  city: "",
  state: "",
  pincode: "",
  country: "",

  logo_url: "",

  storeName: initialData.storeName || "",
  storeDescription: "",

  pan: "",
  gst: "",

  accountHolder: "",
  accountNumber: "",
  accountType: "",
  confirmAccount: "",
  upiId: "",
  ifsc: "",
  bankName: "",

  aadhar: "",
});



  const next = () => setStep((prev) => prev + 1);
  const back = () => setStep((prev) => prev - 1);

  const steps = [
    <BasicInfo next={next} data={data} setData={setData} />,
    <Business next={next} back={back} data={data} setData={setData} />,
    <Branding next={next} back={back} data={data} setData={setData} />,
    <Store next={next} back={back} data={data} setData={setData} />,
    <Tax next={next} back={back} data={data} setData={setData} />,
    <Bank next={next} back={back} data={data} setData={setData} />,
    <Agreements next={next} back={back} data={data} setData={setData} />,
    <KYCPage back={back} data={data} setData={setData} />,
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">
    
    {/* Sidebar */}
    <Sidebar step={step} />

    {/* Form */}
    <div className="flex-1 flex justify-center items-center">
      {steps[step]}
    </div>

  </div>
  );
};

export default Onboarding;