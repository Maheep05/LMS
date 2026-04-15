import { BookOpen, Users, ArrowLeftRight, AlertTriangle, Banknote, Bookmark, Sparkles } from 'lucide-react'
import { StatCard, StatusBadge } from '../components/UI.jsx'
import { formatDate, formatCurrency } from '../lib/utils.js'

export default function Dashboard() {

   const userName = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}')
      return u.name || 'User'
    } catch {
      return 'User'
    }
  })()

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Aesthetic Greeting Section */}
      <style>{`
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes floatIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes glow {
          0%, 100% { text-shadow: 0 0 20px rgba(79, 70, 229, 0.3); }
          50% { text-shadow: 0 0 40px rgba(124, 58, 237, 0.5), 0 0 60px rgba(79, 70, 229, 0.2); }
        }

        .greeting-text {
          animation: floatIn 0.8s ease-out;
        }

        .greeting-highlight {
          background: linear-gradient(90deg, var(--brand), var(--accent), var(--brand));
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientFlow 4s ease infinite;
        }

        .greeting-container:hover .greeting-icon {
          animation: glow 2s ease-in-out;
        }

        .greeting-container {
          transition: transform 0.3s ease, filter 0.3s ease;
        }

        .greeting-container:hover {
          transform: translateY(-2px);
          filter: drop-shadow(0 10px 25px rgba(79, 70, 229, 0.15));
        }
      `}</style>

      <div className="greeting-container group">
        <div className="flex items-center gap-3 mb-6">
          <div className="greeting-icon relative">
            <Sparkles 
              className="w-6 h-6 text-brand/60 group-hover:text-brand transition-colors duration-300" 
              strokeWidth={2}
            />
          </div>
          <div className="greeting-text">
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              Welcome back
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold">
              Hello <span className="greeting-highlight">{userName}</span>
            </h1>
            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
              Good to see you here. Here's your library overview.
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
