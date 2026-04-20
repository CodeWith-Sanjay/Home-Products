const Card = ({ title, children, className = "" }) => {
  return (
    <div
      className={`bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}
    >
      {title && (
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
};

export default Card