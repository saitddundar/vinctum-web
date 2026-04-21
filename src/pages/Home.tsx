import { useState } from "react";
import FeedTab from "./home/FeedTab";
import InboxTab from "./home/InboxTab";
import AccountTab from "./home/AccountTab";
import { useAuth } from "../context/AuthContext";

const tabs = [
  { id: "feed", label: "Feed" },
  { id: "inbox", label: "Inbox" },
  { id: "account", label: "Account" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function Home() {
  const { user } = useAuth();
  const [active, setActive] = useState<TabId>("feed");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-gray-100">
            {user?.username ? `Welcome back, ${user.username}` : "Home"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Your Vinctum network</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700/50 flex items-center justify-center text-xs text-gray-400 uppercase">
          {user?.username?.charAt(0) || "?"}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-800/40">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-4 py-2.5 text-sm transition-colors relative ${
              active === tab.id
                ? "text-gray-100"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab.label}
            {active === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-px bg-gray-100" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {active === "feed" && <FeedTab />}
      {active === "inbox" && <InboxTab />}
      {active === "account" && <AccountTab />}
    </div>
  );
}
