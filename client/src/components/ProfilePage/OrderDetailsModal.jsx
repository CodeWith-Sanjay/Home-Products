import React, { useState, useEffect } from "react";
import { X, Package, MapPin, CreditCard, Clock, CheckCircle, Truck, AlertCircle } from "lucide-react";
import { getOrderDetails } from "../../services/orderService";

const OrderDetailsModal = ({ orderId, onClose }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      setLoading(true);
      getOrderDetails(orderId)
        .then((res) => {
          if (res.success) setOrder(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [orderId]);

  if (!orderId) return null;

  const getStatusConfig = (status) => {
    switch (status) {
      case "Pending": return { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" };
      case "Processing": return { icon: Package, color: "text-blue-600", bg: "bg-blue-100" };
      case "Shipped": return { icon: Truck, color: "text-indigo-600", bg: "bg-indigo-100" };
      case "Delivered": return { icon: CheckCircle, color: "text-green-600", bg: "bg-green-100" };
      case "Cancelled": return { icon: AlertCircle, color: "text-red-600", bg: "bg-red-100" };
      default: return { icon: Package, color: "text-gray-600", bg: "bg-gray-100" };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* HEADER */}
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
            <p className="text-sm text-gray-500">ID: {orderId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 animate-pulse">Loading order details...</p>
            </div>
          ) : order ? (
            <>
              {/* TOP SECTION: SUMMARY & STATUS */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-gray-50 p-6 rounded-2xl flex items-center justify-between">
                   <div>
                      <p className="text-sm text-gray-500">Order Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(order.placed_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                   </div>
                   <div className="text-right">
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-2xl font-bold text-blue-600">₹{order.total_amount}</p>
                   </div>
                </div>

                <div className={`${getStatusConfig(order.order_status).bg} p-6 rounded-2xl flex flex-col items-center justify-center text-center`}>
                   {React.createElement(getStatusConfig(order.order_status).icon, { size: 32, className: getStatusConfig(order.order_status).color })}
                   <p className={`mt-2 font-bold ${getStatusConfig(order.order_status).color}`}>{order.order_status}</p>
                   <p className="text-xs opacity-70">Current Status</p>
                </div>
              </div>

              {/* MIDDLE SECTION: ITEMS */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Package size={20} className="text-blue-600" />
                  Order Items ({order.items.length})
                </h3>
                <div className="border rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-6 py-3">Product</th>
                        <th className="px-6 py-3 text-center">Quantity</th>
                        <th className="px-6 py-3 text-right">Price</th>
                        <th className="px-6 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                      {order.items.map((item) => (
                        <tr key={item.order_item_id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={item.images?.[0] || "https://via.placeholder.com/100"} 
                                alt={item.product_name} 
                                className="w-12 h-12 object-cover rounded-lg border"
                              />
                              <div>
                                <p className="font-medium text-gray-900">{item.product_name}</p>
                                {item.variant_name && (
                                  <p className="text-xs text-gray-500">{item.variant_name}: {item.variant_value}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">{item.quantity}</td>
                          <td className="px-6 py-4 text-right">₹{item.unit_price}</td>
                          <td className="px-6 py-4 text-right font-semibold">₹{item.total_price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* BOTTOM SECTION: ADDRESS & PAYMENT */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Shipping Address */}
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <MapPin size={20} className="text-blue-600" />
                    Shipping Address
                  </h3>
                  <div className="bg-gray-50 p-6 rounded-2xl space-y-1 text-sm text-gray-600">
                    <p className="font-bold text-gray-900 text-base mb-1">{order.shipping_name}</p>
                    <p>{order.address_line_1}</p>
                    <p>{order.city}, {order.state} - {order.pincode}</p>
                    <p className="pt-2">📞 {order.shipping_phone}</p>
                  </div>
                </div>

                {/* Payment & History */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                      <CreditCard size={20} className="text-blue-600" />
                      Payment Details
                    </h3>
                    <div className="bg-gray-50 p-6 rounded-2xl flex justify-between items-center text-sm">
                       <div>
                          <p className="uppercase text-xs text-gray-400 font-bold">{order.payment_method}</p>
                          <p className="font-medium text-gray-900 mt-1">
                            {order.payment?.transaction_id ? `Txn: ${order.payment.transaction_id}` : "No transaction ID"}
                          </p>
                       </div>
                       <div className={`px-3 py-1 rounded-full text-xs font-bold ${order.payment_status === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                          {order.payment_status}
                       </div>
                    </div>
                  </div>

                  {/* Status History */}
                  <div className="space-y-4">
                     <h3 className="font-bold text-gray-900 text-sm opacity-50 uppercase tracking-wider">Status History</h3>
                     <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                        {order.status_history?.map((history, idx) => (
                          <div key={idx} className="relative pl-8">
                            <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm ${idx === 0 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                            <p className="text-sm font-bold text-gray-800">{history.status}</p>
                            <p className="text-xs text-gray-500">{history.notes}</p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {new Date(history.changed_at).toLocaleString()}
                            </p>
                          </div>
                        ))}
                     </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
              <p className="text-gray-600">Failed to load order details. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
