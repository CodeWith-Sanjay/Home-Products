

const SellerAuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">

      <div className="flex w-full max-w-5xl shadow-2xl rounded-2xl overflow-hidden bg-white">

        <div className="hidden md:flex flex-col justify-center items-center bg-blue-600 text-white w-1/2 p-10">
          <h1 className="text-3xl font-bold mb-4">Seller Portal</h1>
          <p className="text-center text-blue-100">
            Manage products, orders, and customers in one place.
          </p>
        </div>

        <div className="w-full md:w-1/2 p-10 bg-white">
          {children}
        </div>

      </div>
    </div>
  );
};

export default SellerAuthLayout;