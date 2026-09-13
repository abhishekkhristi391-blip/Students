import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import BlobCharacter from '../components/BlobCharacter';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { motion } from 'framer-motion';

export default function Register() {
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  
  // Username check states
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (username.length < 3) {
      setIsAvailable(null);
      setIsChecking(false);
      return;
    }

    setIsChecking(true);
    const checkUsername = async () => {
      try {
        const lowerUser = username.toLowerCase();
        const docRef = doc(db, 'usernames', lowerUser);
        const docSnap = await getDoc(docRef);
        
        setIsAvailable(!docSnap.exists());
      } catch (err) {
        console.error(err);
      } finally {
        setIsChecking(false);
      }
    };
    
    // Debounce the check
    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleGoogleSignup = async () => {
    try {
      setLoading(true);
      setError('');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if already registered
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (userDoc.exists()) {
        navigate('/'); // Already has an account
        return;
      }
      
      // Move to step 2 (set username)
      setGoogleUser(result.user);
      setName(result.user.displayName || '');
      setEmail(result.user.email || '');
      
    } catch (err: any) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Failed to authenticate with Google');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!googleUser) return;
    if (isAvailable === false) {
      setError("Please choose an available username.");
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const lowerUser = username.toLowerCase();
      // Double check availability
      const docRef = doc(db, 'usernames', lowerUser);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setError('Username was just taken, please choose another.');
        return;
      }
      
      const batch = writeBatch(db);
      
      // Save User Data
      batch.set(doc(db, 'users', googleUser.uid), {
        uid: googleUser.uid,
        name: name,
        username: lowerUser,
        email: email,
        class: '12th Grade', // Defaults for now
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
      
      // Save Username Map
      batch.set(doc(db, 'usernames', lowerUser), {
        uid: googleUser.uid
      });
      
      await batch.commit();
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to complete registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-gradient-dashboard flex flex-col p-6 pt-16 overflow-y-auto">
      <div className="flex-1 flex flex-col items-center justify-center">
        <BlobCharacter emotion="balanced" className="w-32 h-32 mb-6" />
        
        <div className="bg-white/80 backdrop-blur-xl rounded-[24px] p-6 w-full shadow-soft">
          <h1 className="text-2xl font-bold mb-2">Create Account</h1>
          <p className="text-gray-500 text-sm mb-6">Start your learning journey today.</p>
          
          {error && <div className="mb-4 text-red-500 text-sm font-semibold">{error}</div>}
          
          {!googleUser ? (
            <div className="space-y-4">
              <button 
                onClick={handleGoogleSignup}
                disabled={loading}
                className={`w-full bg-white border border-gray-200 text-black rounded-full py-4 font-bold text-lg shadow-sm flex items-center justify-center gap-3 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : 'active:scale-95 hover:bg-gray-50'}`}
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <>
                    <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                      </g>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
            </div>
          ) : (
            <motion.form 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmitProfile} 
              className="space-y-4"
            >
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

              {/* Username Field with Availability Check */}
              <div>
                <label className="block text-sm font-semibold mb-1">Choose a Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                  <input 
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    className={`w-full bg-white rounded-xl pl-9 pr-12 py-3 outline-none focus:ring-2 transition-all ${
                      isAvailable === false ? 'focus:ring-red-400 border-red-400 border' : 'focus:ring-[#77d6bd] border-transparent border'
                    }`}
                    placeholder="johndoe"
                    required
                  />
                  
                  {/* Status Indicator */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {isChecking && <Loader2 size={18} className="text-gray-400 animate-spin" />}
                    {!isChecking && isAvailable === true && <CheckCircle2 size={18} className="text-green-500" />}
                    {!isChecking && isAvailable === false && <XCircle size={18} className="text-red-500" />}
                  </div>
                </div>
                
                {/* Feedback Text */}
                <div className="h-4 mt-1">
                  {username.length > 0 && username.length < 3 && (
                     <p className="text-[11px] font-semibold text-gray-500">Username must be at least 3 characters</p>
                  )}
                  {!isChecking && isAvailable === false && (
                     <p className="text-[11px] font-semibold text-red-500">Username is not available</p>
                  )}
                  {!isChecking && isAvailable === true && (
                     <p className="text-[11px] font-semibold text-[#77d6bd]">Username is available!</p>
                  )}
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={isAvailable === false || isChecking || username.length < 3 || loading}
                className={`w-full text-white rounded-full py-4 font-bold text-lg mt-2 shadow-lg transition-colors ${
                  isAvailable === false || isChecking || username.length < 3 || loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black active:scale-95'
                }`}
              >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Complete Profile'}
              </button>
            </motion.form>
          )}
          
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">Already have an account? </span>
            <Link to="/login" className="font-bold text-[#b587fb]">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
