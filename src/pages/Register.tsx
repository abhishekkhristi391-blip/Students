import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BlobCharacter from '../components/BlobCharacter';

export default function Register() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({
      uid: '123',
      name: name || 'New Student',
      email,
      class: '12th Grade',
      board: 'CBSE',
      subjects: [],
      totalPoints: 0,
      rank: 0,
      questionsAttempted: 0,
      testsCompleted: 0,
      correctAnswers: 0,
      accuracy: 0,
      badges: [],
      streak: 0,
      status: 'active'
    });
    navigate('/');
  };

  return (
    <div className="min-h-full bg-gradient-dashboard flex flex-col p-6 pt-24">
      <div className="flex-1 flex flex-col items-center justify-center -mt-12">
        <BlobCharacter emotion="balanced" className="w-48 h-48 mb-6" />
        
        <div className="bg-white/80 backdrop-blur-xl rounded-[24px] p-6 w-full shadow-soft">
          <h1 className="text-2xl font-bold mb-2">Create Account</h1>
          <p className="text-gray-500 text-sm mb-6">Start your learning journey today.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Full Name</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#77d6bd] transition-all"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Email</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#77d6bd] transition-all"
                placeholder="student@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-1">Password</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#77d6bd] transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button 
              type="submit"
              className="w-full bg-black text-white rounded-full py-4 font-bold text-lg mt-4 shadow-lg"
            >
              Register
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">Already have an account? </span>
            <Link to="/login" className="font-bold text-[#b587fb]">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
