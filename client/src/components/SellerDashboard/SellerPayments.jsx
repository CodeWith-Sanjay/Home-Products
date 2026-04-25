import React, { useState, useEffect } from "react";
import { getSellerEarningsSummary, getSellerPayoutHistory } from "../../services/payoutService";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';

const SellerPayments = () => {
  const seller = JSON.parse(localStorage.getItem("seller"));
  const sellerId = seller?.seller_id || seller?.id;
  
  const [data, setData] = useState({
    summary: {
      total_earnings: 0,
      pending_payouts: 0,
      completed_payouts: 0
    },
    transactions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sellerId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [summaryRes, historyRes] = await Promise.all([
          getSellerEarningsSummary(sellerId),
          getSellerPayoutHistory(sellerId)
        ]);

        if (summaryRes.success && historyRes.success) {
          setData({
            summary: {
              total_earnings: summaryRes.data.total_earnings,
              pending_delivery: summaryRes.data.pending_earnings,
              completed_payouts: summaryRes.data.paid_earnings
            },
            transactions: historyRes.data
          });
        }
      } catch (error) {
        console.error("Failed to fetch payment data", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [sellerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const cards = [
    { 
      title: "Total Earnings", 
      value: `₹${Number(data.summary.total_earnings).toLocaleString()}`, 
      icon: <AccountBalanceWalletIcon />, 
      color: "bg-blue-600",
      desc: "Gross revenue after commission"
    },
    { 
      title: "Pending Delivery", 
      value: `₹${Number(data.summary.pending_delivery).toLocaleString()}`, 
      icon: <PendingActionsIcon />, 
      color: "bg-orange-500",
      desc: "Earnings from orders not yet delivered"
    },
    { 
      title: "Completed Payout", 
      value: `₹${Number(data.summary.completed_payouts).toLocaleString()}`, 
      icon: <CheckCircleIcon />, 
      color: "bg-green-500",
      desc: "Successfully transferred to bank"
    },
  ];

  return (
    <div className="flex flex-col gap-8 pb-10">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.title} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className={`p-4 ${card.color} text-white rounded-2xl mb-6 shadow-lg`}>
              {card.icon}
            </div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{card.title}</p>
            <h3 className="text-3xl font-black text-gray-900 mt-2 mb-2 tracking-tight">{card.value}</h3>
            <p className="text-xs text-gray-400 font-medium">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Transaction History */}
      <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-xl font-black text-gray-800 tracking-tight">Payout History</h3>
            <p className="text-sm text-gray-500 font-semibold mt-1">Track your earnings and transfers</p>
          </div>
          <button className="flex items-center gap-2 text-xs font-black text-blue-600 bg-blue-50 px-5 py-3 rounded-2xl hover:bg-blue-100 transition">
            <DownloadIcon fontSize="small" /> Export Statement
          </button>
        </div>

        {data.transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                  <th className="pb-6 font-black">Transaction ID</th>
                  <th className="pb-6 font-black">Date</th>
                  <th className="pb-6 font-black">Method</th>
                  <th className="pb-6 font-black text-right">Amount</th>
                  <th className="pb-6 font-black text-center">Customer Payment</th>
                  <th className="pb-6 font-black text-center">Payout Status</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-600">
                {data.transactions.map((tx) => (
                  <tr key={tx.payout_id} className="group hover:bg-gray-50/70 transition-all">
                    <td className="py-6 font-black text-gray-400 group-hover:text-blue-600 transition-colors uppercase">
                      #{tx.payout_id.slice(0, 10)}
                    </td>
                    <td className="py-6">
                      <div className="font-bold text-gray-800">{new Date(tx.created_at).toLocaleDateString()}</div>
                      <div className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase tracking-wider">{new Date(tx.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </td>
                    <td className="py-6 font-semibold text-gray-600 capitalize">
                      {tx.payment_method}
                    </td>
                    <td className="py-6 font-black text-gray-900 text-right">
                      ₹{Number(tx.amount).toLocaleString()}
                    </td>
                    <td className="py-6 text-center text-xs font-bold text-gray-400 uppercase">
                      N/A
                    </td>
                    <td className="py-6 text-center">
                      <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest
                        ${tx.status === 'completed' || tx.status === 'Paid' ? 'bg-blue-100 text-blue-700' : 
                          tx.status === 'pending' || tx.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        ) : (
          <div className="text-sm text-gray-500 py-20 text-center bg-gray-50/50 rounded-[2.5rem] border-4 border-dashed border-gray-100">
             <AccountBalanceWalletIcon sx={{ fontSize: 60, color: '#e2e8f0' }} className="mb-4" />
             <p className="font-bold text-xl text-gray-400 tracking-tight">No transactions found</p>
             <p className="text-xs text-gray-400 mt-2">Earnings will appear here once orders are processed.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default SellerPayments;
