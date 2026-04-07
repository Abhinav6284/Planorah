import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#F5F1E8] dark:bg-charcoalDark border-t border-gray-300 dark:border-charcoalMuted py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 rounded-full bg-white overflow-hidden flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300">
                <img src="/planorah_logo.png" alt="Planorah" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-gray-950 dark:text-white font-cormorant text-lg">Planorah</span>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400">Master your daily progress with AI-powered planning.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-950 dark:text-white mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#features" className="hover:text-gray-950 dark:hover:text-white transition">Features</a></li>
              <li><a href="#pricing" className="hover:text-gray-950 dark:hover:text-white transition">Pricing</a></li>
              <li><Link to="/" className="hover:text-gray-950 dark:hover:text-white transition">Roadmap</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-950 dark:text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><Link to="/" className="hover:text-gray-950 dark:hover:text-white transition">About</Link></li>
              <li><Link to="/blogs" className="hover:text-gray-950 dark:hover:text-white transition">Blog</Link></li>
              <li><Link to="/" className="hover:text-gray-950 dark:hover:text-white transition">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-950 dark:text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><Link to="/" className="hover:text-gray-950 dark:hover:text-white transition">Privacy</Link></li>
              <li><Link to="/" className="hover:text-gray-950 dark:hover:text-white transition">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-300 dark:border-charcoalMuted pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© 2024 Planorah. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
