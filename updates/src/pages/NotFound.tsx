import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <p className="text-6xl font-light text-gray-300">404</p>
        <p className="text-gray-500 text-sm">This page doesn't exist.</p>
        <Link
          to="/"
          className="inline-block px-5 py-2 rounded-md bg-gray-800/80 border border-gray-700/50 text-sm text-gray-300 hover:text-gray-100 hover:border-gray-600 transition-all duration-200"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
