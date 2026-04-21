export default function InboxTab() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">Incoming transfers and notifications</p>

      <div className="rounded-md border border-gray-800/40 bg-gray-900/30 p-8 text-center">
        <p className="text-gray-400">Inbox is empty</p>
        <p className="text-xs text-gray-600 mt-1">
          Incoming file transfers and pairing requests will appear here.
        </p>
      </div>
    </div>
  );
}
