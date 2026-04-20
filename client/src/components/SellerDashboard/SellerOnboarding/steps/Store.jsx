import { useState } from "react";
import { inputStyle, labelStyle, primaryBtn, secondaryBtn, cardStyle } from "../../../../utils/UIStyles";

const Store = ({ next, back, data, setData }) => {
  const [error, setError] = useState("");

  const handleNext = () => {
    // if (!data.storeName || !data.storeDescription) {
    //   return setError("All fields required");
    // }
    setError("");
    next();
  };

  return (
    <div className={cardStyle}>
      <h2 className="text-2xl font-semibold mb-1">Store Setup</h2>

      <div className="space-y-5">
        <div>
          <label className={labelStyle}>Store Name</label>
          <input
          name="storeName"
          placeholder="Shop Name"
          onChange={(e) => setData({...data, storeName: e.target.value})}
          className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200
                     focus:ring-2 focus:ring-blue-500 outline-none"
        />
        </div>

        <div>
          <label className={labelStyle}>Description</label>
          <textarea
            value={data.storeDescription}
            onChange={(e) => setData({ ...data, storeDescription: e.target.value })}
            className={inputStyle}
          />
        </div>

      </div>

      {error && <p className="text-red-500 px-2 text-sm mt-2">{error}</p>}

      <div className="flex justify-between mt-8">
        <button onClick={back} className={secondaryBtn}>← Back</button>
        <button onClick={handleNext} className={primaryBtn}>Continue →</button>
      </div>
    </div>
  );
};

export default Store;