import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#F5F1E8] dark:bg-gray-950 border-t border-gray-300 dark:border-gray-800 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <Link to="/" className="font-bold text-gray-950 dark:text-white mb-4 block">
              Planorah
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400">Master your daily progress with AI-powered planning.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-950 dark:text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#features" className="hover:text-gray-950 dark:hover:text-white transition">Features</a></li>
              <li><a href="#pricing" className="hover:text-gray-950 dark:hover:text-white transition">Pricing</a></li>
              <li><a href="#" className="hover:text-gray-950 dark:hover:text-white transition">Roadmap</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-950 dark:text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-gray-950 dark:hover:text-white transition">About</a></li>
              <li><a href="#" className="hover:text-gray-950 dark:hover:text-white transition">Blog</a></li>
              <li><a href="#" className="hover:text-gray-950 dark:hover:text-white transition">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-950 dark:text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-gray-950 dark:hover:text-white transition">Privacy</a></li>
              <li><a href="#" className="hover:text-gray-950 dark:hover:text-white transition">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-300 dark:border-gray-800 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© 2024 Planorah. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
