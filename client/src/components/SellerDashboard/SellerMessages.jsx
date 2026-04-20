import React, { useState } from "react";
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const SellerMessages = () => {
  const [conversations] = useState([
    { id: 1, name: "John", lastMsg: "Is the product available in blue?", time: "10:30 AM", unread: 2, online: true },
  ]);

  const [selectedConv, setSelectedConv] = useState(conversations[0]);

  return (
    <div className="flex h-[calc(100vh-180px)] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-50">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-2.5 text-gray-400 text-sm" />
            <input 
              type="text" 
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div 
              key={conv.id}
              onClick={() => setSelectedConv(conv)}
              className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition ${selectedConv?.id === conv.id ? 'bg-blue-50' : ''}`}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                  {conv.name.split(' ').map(n => n[0]).join('')}
                </div>
                {conv.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-semibold text-gray-800 truncate">{conv.name}</h4>
                  <span className="text-[10px] text-gray-400">{conv.time}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{conv.lastMsg}</p>
              </div>
              {conv.unread > 0 && (
                <div className="w-5 h-5 bg-blue-600 text-white text-[10px] flex items-center justify-center rounded-full">
                  {conv.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConv ? (
          <>
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500 text-sm">
                  {selectedConv.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">{selectedConv.name}</h4>
                  <p className="text-[10px] text-green-500 font-medium">{selectedConv.online ? 'Online' : 'Offline'}</p>
                </div>
              </div>
              <MoreVertIcon className="text-gray-400 cursor-pointer" />
            </div>

            <div className="flex-1 p-6 overflow-y-auto bg-gray-50 space-y-4">
              <div className="flex justify-start">
                <div className="max-w-[70%] bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-700">
                  Hi, I'm interested in the wooden chair. Is it still in stock?
                  <p className="text-[10px] text-gray-400 mt-1 text-right">10:30 AM</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[70%] bg-blue-600 p-3 rounded-2xl rounded-tr-none shadow-sm text-sm text-white">
                  Yes, we have 5 units left. Would you like to place an order?
                  <p className="text-[10px] text-blue-200 mt-1 text-right">10:32 AM</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[70%] bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-700">
                  Is the product available in blue?
                  <p className="text-[10px] text-gray-400 mt-1 text-right">10:35 AM</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-2 px-4 border border-gray-200">
                <input 
                  type="text" 
                  placeholder="Type your message..."
                  className="flex-1 bg-transparent text-sm outline-none py-2"
                />
                <button className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
                  <SendIcon fontSize="small" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <p className="text-sm">Select a conversation to start messaging</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default SellerMessages;
