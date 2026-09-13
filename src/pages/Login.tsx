import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BlobCharacter from '../components/BlobCharacter';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({
      uid: '123',
      name: 'Alice Student',
      email,
      class: '12th Grade',
      board: 'CBSE',
      subjects: ['Physics', 'Maths'],
      totalPoints: 1240,
      rank: 42,
      questionsAttempted: 350,
      testsCompleted: 12,
      correctAnswers: 290,
      accuracy: 82,
      badges: ['first-test'],
      streak: 7,
      status: 'active'
    });
    navigate('/');
  };

  return (
    <div className="min-h-full bg-gradient-mood flex flex-col p-6 pt-24">
      <div className="flex-1 flex flex-col items-center justify-center -mt-12">
        <BlobCharacter emotion="happy" className="w-48 h-48 mb-6" />
        
        <div className="bg-white/80 backdrop-blur-xl rounded-[24px] p-6 w-full shadow-soft">
          <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
          <p className="text-gray-500 text-sm mb-6">Let's continue your exam preparation.</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Email</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#fed282] transition-all"
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
                className="w-full bg-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#fed282] transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            
            <div className="flex justify-end">
              <button type="button" className="text-sm font-semibold text-[#77d6bd]">
                Forgot Password?
              </button>
            </div>
            
            <button 
              type="submit"
              className="w-full bg-black text-white rounded-full py-4 font-bold text-lg mt-2 shadow-lg"
            >
              Sign In
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">Don't have an account? </span>
            <Link to="/register" className="font-bold text-[#b587fb]">Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
