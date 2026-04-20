import { inputStyle, primaryBtn, secondaryBtn, cardStyle } from "../../../../utils/UIStyles";

const Branding = ({ next, back, data, setData }) => {
  return (
    <div className={cardStyle}>
      <h2 className="text-xl font-semibold mb-4">Branding</h2>

      <input
        placeholder="Logo URL"
        value={data.logo_url}
        onChange={(e) => setData({ ...data, logo_url: e.target.value })}
        className={inputStyle}
      />

      <div className="flex justify-between mt-4">
        <button onClick={back} className={secondaryBtn}>← Back</button>
        <button onClick={next} className={primaryBtn}>Continue →</button>
      </div>
    </div>
  );
};

export default Branding;