'use client';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo & Brand */}
        <div className="text-left">
          <h1 className="text-xl font-bold">Sistem Informasi Bidang Pendidikan</h1>
          {user && (
            <span className="text-blue-200 text-sm">
              Selamat datang, {user.name}
            </span>
          )}
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {/* User Role Badge */}
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                user.role === 'admin' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-green-500 text-white'
              }`}>
                {user.role.toUpperCase()}
              </span>

              {/* UPT Code */}
              <span className="text-blue-200 text-sm">
                {user.uptCode}
              </span>

              {/* Navigation Links */}
              <div className="flex space-x-4">
                <button
                  onClick={() => router.push('/')}
                  className="hover:text-blue-200 transition-colors"
                >
                  Dashboard
                </button>
                
                {user.role === 'admin' && (
                  <>
                    <button
                      onClick={() => router.push('/users')}
                      className="hover:text-blue-200 transition-colors"
                    >
                      Manage Users
                    </button>
                    <button
                      onClick={() => router.push('/dosen')}
                      className="hover:text-blue-200 transition-colors"
                    >
                      Data Dosen
                    </button>
                  </>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
