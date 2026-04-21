export default function FeedTab() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">Activity feed across your network</p>

      <div className="rounded-md border border-gray-800/40 bg-gray-900/30 p-8 text-center">
        <p className="text-gray-400">No activity yet</p>
        <p className="text-xs text-gray-600 mt-1">
          Transfers, device events and session activity will show up here.
        </p>
      </div>
    </div>
  );
}
