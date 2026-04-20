import { useState } from "react";
import { primaryBtn, secondaryBtn, cardStyle } from "../../../../utils/UIStyles";

const Agreements = ({ next, back }) => {
  const [checked, setChecked] = useState(false);

  return (
    <div className={cardStyle}>
      <h2 className="text-xl font-semibold mb-4">Agreements</h2>

      <label className="flex gap-2">
        <input type="checkbox" onChange={() => setChecked(!checked)} />
        Accept Terms
      </label>

      <div className="flex justify-between mt-4">
        <button onClick={back} className={secondaryBtn}>← Back</button>
        <button
          disabled={!checked}
          onClick={next}
          className={`${primaryBtn} ${!checked && "opacity-50"}`}
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

export default Agreements;