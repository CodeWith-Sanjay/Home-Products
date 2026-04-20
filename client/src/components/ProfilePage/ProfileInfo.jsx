import Card from "./Card";
import { Mail, Phone, User } from "lucide-react";

const ProfileInfo = ({ user }) => {
  if (!user) return null;

  const fields = [
    { label: "Full Name", value: user.name, icon: User },
    { label: "Email", value: user.email, icon: Mail },
    { label: "Phone", value: user.phone, icon: Phone },
  ];

  return (
    <Card title="Profile Details">
      <div className="space-y-4">

        {fields.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-xl bg-gray-50"
            >
              {/* LEFT */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-200 text-gray-600">
                  <Icon size={16} />
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    {item.label}
                  </p>
                  <p className="font-medium text-gray-800">
                    {item.value}
                  </p>
                </div>
              </div>

              {/* RIGHT (optional future edit button) */}
              <button className="text-xs text-blue-600 hover:underline">
                Edit
              </button>
            </div>
          );
        })}

      </div>
    </Card>
  );
};

export default ProfileInfo;