import React, { useState, useEffect } from "react";
import { X, Package, MapPin, CreditCard, Clock, CheckCircle, Truck, AlertCircle } from "lucide-react";
import { getOrderDetails, cancelOrder } from "../../services/orderService";

const OrderDetailsModal = ({ orderId, onClose, onOrderUpdate }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

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

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert("Please provide a reason for cancellation");
      return;
    }
    
    setCancelling(true);
    const auth = JSON.parse(localStorage.getItem("auth"));
    
    try {
      const res = await cancelOrder(orderId, auth?.id, cancelReason);
      if (res.success) {
        setOrder(prev => ({ ...prev, order_status: 'Cancelled', cancellation_reason: cancelReason }));
        setShowCancelConfirm(false);
        if (onOrderUpdate) onOrderUpdate();
      } else {
        alert(res.message || "Failed to cancel order");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

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

  const canCancel = order && (order.order_status === "Pending" || order.order_status === "Processing");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* HEADER */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
            <p className="text-sm text-gray-500">ID: {orderId}</p>
          </div>
          <div className="flex items-center gap-4">
            {canCancel && !showCancelConfirm && (
              <button 
                onClick={() => setShowCancelConfirm(true)}
                className="px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-xl hover:bg-red-100 transition"
              >
                Cancel Order
              </button>
            )}
            <button onClick={onClose} className="p-2 bg-white border shadow-sm hover:bg-gray-50 rounded-full transition">
              <X size={20} />
            </button>
          </div>
        </div>

        {showCancelConfirm && (
          <div className="p-6 bg-red-50 border-b border-red-100">
            <h4 className="text-sm font-bold text-red-900 mb-2">Cancel Order</h4>
            <textarea 
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..."
              className="w-full p-4 rounded-2xl border border-red-200 text-sm focus:ring-2 focus:ring-red-100 outline-none min-h-[100px] mb-4"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowCancelConfirm(false)} className="px-4 py-2 text-sm font-bold text-gray-500">Go Back</button>
              <button onClick={handleCancelOrder} disabled={cancelling} className="px-6 py-2 bg-red-600 text-white text-sm font-bold rounded-xl">{cancelling ? "Processing..." : "Confirm Cancellation"}</button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500">Loading details...</p>
            </div>
          ) : order ? (
            <>
              {/* TOP SUMMARY & STATUS */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Order Date</p>
                      <p className="font-bold text-gray-800">{new Date(order.placed_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Payment Method</p>
                      <p className="font-bold text-gray-800">{order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                    </div>
                  </div>

                  {/* CLEAR PRICE BREAKDOWN SECTION */}
                  <div className="space-y-2 pt-4 border-t border-blue-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Items Subtotal</span>
                      <span className="font-semibold text-gray-800">₹{order.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">GST (5%)</span>
                      <span className="font-semibold text-gray-800">₹{parseFloat(order.tax_amount) || Math.round(order.subtotal * 0.05)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Platform Fee</span>
                      <span className="font-semibold text-gray-800">₹{parseFloat(order.platform_fee) || 10}</span>
                    </div>
                    {order.payment_method === 'cod' && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">COD Collection Fee</span>
                        <span className="font-semibold text-gray-800">₹{order.cod_fee || 50}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Charges</span>
                      <span className="font-semibold text-gray-800">₹{order.shipping_charges}</span>
                    </div>
                    {parseFloat(order.discount_amount) > 0 && (
                      <div className="flex justify-between text-sm text-green-600 font-bold">
                        <span>Coupon Discount Applied</span>
                        <span>- ₹{order.discount_amount}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-3 border-t border-blue-200">
                      <span className="text-lg font-bold text-gray-900">Total Amount Paid</span>
                      <span className="text-2xl font-black text-blue-600 tracking-tighter">₹{order.total_amount}</span>
                    </div>
                  </div>
                </div>

                <div className={`${getStatusConfig(order.order_status).bg} p-6 rounded-2xl flex flex-col items-center justify-center text-center border border-white`}>
                   {React.createElement(getStatusConfig(order.order_status).icon, { size: 40, className: getStatusConfig(order.order_status).color })}
                   <p className={`mt-3 font-black uppercase tracking-widest ${getStatusConfig(order.order_status).color}`}>{order.order_status}</p>
                   <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-tighter">Order Status</p>
                </div>
              </div>

              {/* ITEMS SECTION */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Package size={20} className="text-blue-600" />
                  Product Details
                </h3>
                <div className="border rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-black tracking-widest">
                      <tr>
                        <th className="px-6 py-4">Item</th>
                        <th className="px-6 py-4 text-center">Qty</th>
                        <th className="px-6 py-4 text-right">Price</th>
                        <th className="px-6 py-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                      {order.items.map((item) => (
                        <tr key={item.order_item_id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={item.images?.[0]} alt="" className="w-10 h-10 object-cover rounded-lg border shadow-sm" />
                              <div>
                                <p className="font-bold text-gray-900">{item.product_name}</p>
                                {item.variant_name && <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{item.variant_name}: {item.variant_value}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-gray-600">{item.quantity}</td>
                          <td className="px-6 py-4 text-right">₹{item.unit_price}</td>
                          <td className="px-6 py-4 text-right font-bold text-gray-900">₹{item.total_price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* FOOTER: ADDRESS & HISTORY */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <MapPin size={20} className="text-blue-600" />
                    Delivery Address
                  </h3>
                  <div className="bg-gray-50 p-6 rounded-2xl text-sm text-gray-600 space-y-1">
                    <p className="font-bold text-gray-900 text-base mb-1">{order.shipping_name}</p>
                    <p>{order.address_line_1}</p>
                    <p>{order.city}, {order.state} - {order.pincode}</p>
                    <p className="pt-2 font-bold text-gray-800 tracking-wider flex items-center gap-2">
                       📞 {order.shipping_phone}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                   <h3 className="font-bold text-gray-900 flex items-center gap-2 uppercase text-xs tracking-widest opacity-50">
                     Journey History
                   </h3>
                   <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                      {order.status_history?.map((history, idx) => (
                        <div key={idx} className="relative pl-8">
                          <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm ${idx === 0 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                          <p className={`text-sm font-bold ${idx === 0 ? 'text-gray-900' : 'text-gray-400'}`}>{history.status}</p>
                          <p className="text-[10px] text-gray-400">{new Date(history.changed_at).toLocaleString()}</p>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
