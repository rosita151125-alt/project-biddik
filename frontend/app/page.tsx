import Link from 'next/link';
import ProtectedRoute from './components/ProtectedRoute';


export default function HomePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Sistem Informasi Biddik</h1>
                <p className="text-gray-600 mt-2">Aplikasi web untuk akumulasi data akademik kampus</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Card Data Dosen */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center">
                <div className="text-4xl mr-4">👨‍🏫</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Data Dosen</h3>
                  <p className="text-gray-600 text-sm">Management data dosen & tenaga pengajar</p>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/dosen" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition">
                  → Kelola Data Dosen
                </Link>
              </div>
            </div>

            {/* Card Data Taruna */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center">
                <div className="text-4xl mr-4">🎓</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Data Taruna</h3>
                  <p className="text-gray-600 text-sm">Management data taruna/mahasiswa</p>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/taruna" className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium transition">
                  → Kelola Data Taruna
                </Link>
              </div>
            </div>

            {/* Card Lulusan */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Data Lulusan</h3>
              <p className="text-gray-600">Tracking lulusan dan daya serap industri</p>
              <div className="mt-4 text-gray-400">Coming Soon</div>
            </div>

            {/* Card Akreditasi */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Akreditasi</h3>
              <p className="text-gray-600">Management data akreditasi institusi & prodi</p>
              <div className="mt-4 text-gray-400">Coming Soon</div>
            </div>

            {/* Card Kursil */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Kursil</h3>
              <p className="text-gray-600">Kurikulum dan silabus program studi</p>
              <div className="mt-4 text-gray-400">Coming Soon</div>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Status Sistem</h2>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <span className="font-semibold">Backend API:</span>
                  <span className="ml-2 text-green-600">● Online</span>
                </div>
                <div>
                  <span className="font-semibold">Database:</span>
                  <span className="ml-2 text-green-600">● Connected</span>
                </div>
                <div>
                  <span className="font-semibold">Frontend:</span>
                  <span className="ml-2 text-green-600">● Running</span>
                </div>
                <div>
                  <span className="font-semibold">Authentication:</span>
                  <span className="ml-2 text-green-600">● Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
