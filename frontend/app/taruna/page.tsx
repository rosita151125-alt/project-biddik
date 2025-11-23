'use client';
import { useEffect, useState } from 'react';
import { tarunaAPI } from '@/lib/services/api';
import ProtectedRoute from '../components/ProtectedRoute';

interface Taruna {
  id: number;
  nim: string;
  nama: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  agama: string;
  alamat: string;
  email: string;
  telepon: string;
  program_studi: string;
  jurusan: string;
  tahun_masuk: number;
  semester: number;
  status: string;
  upt_code: string;
}

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  uptCode: string;
}

interface FormDataManual {
  nim: string;
  nama: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: string;
  agama: string;
  alamat: string;
  email: string;
  telepon: string;
  program_studi: string;
  jurusan: string;
  tahun_masuk: number;
  semester: number;
  status: string;
}

export default function TarunaPage() {
  const [taruna, setTaruna] = useState<Taruna[]>([]);
  const [filteredTaruna, setFilteredTaruna] = useState<Taruna[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [jurusanFilter, setJurusanFilter] = useState('ALL');
  const [user, setUser] = useState<User | null>(null);
  
  // State untuk modal dan upload
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  
  // State untuk form manual
  const [formData, setFormData] = useState<FormDataManual>({
    nim: '',
    nama: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: 'L',
    agama: 'Islam',
    alamat: '',
    email: '',
    telepon: '',
    program_studi: 'S1',
    jurusan: '',
    tahun_masuk: new Date().getFullYear(),
    semester: 1,
    status: 'AKTIF'
  });

  // ✅ LOAD DATA INITIAL
  useEffect(() => {
    loadTaruna();
    loadUserData();
  }, []);

  // ✅ AUTO FILTER - SETIAP KALI SEARCH/FILTER BERUBAH
  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, jurusanFilter, taruna]);

  // ✅ LOAD STATS - SETELAH DATA LOADED
  useEffect(() => {
    if (taruna.length > 0) {
      loadStats();
    }
  }, [taruna]);

  const loadUserData = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadTaruna = async () => {
    try {
      const response = await tarunaAPI.getAll();
      setTaruna(response.data);
      setFilteredTaruna(response.data);
    } catch (error) {
      console.error('Error loading taruna:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Stats dari semua data (bukan filtered)
      const total = taruna.length;
      const byStatus = taruna.reduce((acc: any, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      }, {});
      
      const byJurusan = taruna.reduce((acc: any, curr) => {
        acc[curr.jurusan] = (acc[curr.jurusan] || 0) + 1;
        return acc;
      }, {});

      setStats({
        total,
        byStatus,
        byJurusan
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // ✅ FILTER FUNCTION YANG WORK
  const applyFilters = () => {
    console.log('🔍 Applying filters...', {
      search: searchTerm,
      status: statusFilter,
      jurusan: jurusanFilter
    });

    let result = [...taruna];

    // Search filter
    if (searchTerm && searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(t =>
        t.nim.toLowerCase().includes(term) ||
        t.nama.toLowerCase().includes(term) ||
        t.email.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(t => t.status === statusFilter);
    }

    // Jurusan filter
    if (jurusanFilter !== 'ALL') {
      result = result.filter(t => t.jurusan === jurusanFilter);
    }

    console.log('✅ Filter result:', result.length, 'items');
    setFilteredTaruna(result);
  };

  // ✅ HANDLERS UNTUK INPUT
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleJurusanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setJurusanFilter(e.target.value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setJurusanFilter('ALL');
  };

  const handleFileUpload = async () => {
    if (!uploadFile) {
      alert('Pilih file terlebih dahulu!');
      return;
    }

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      
      const response = await fetch('/api/taruna/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      
      await loadTaruna();
      setShowUploadModal(false);
      setUploadFile(null);
      
      alert('Data berhasil diupload!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading file. Pastikan format file benar.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleTambahManual = async () => {
    if (!formData.nim || !formData.nama || !formData.email) {
      alert('NIM, Nama, dan Email wajib diisi!');
      return;
    }

    setManualLoading(true);
    try {
      const dataToSend = {
        ...formData,
        upt_code: user?.uptCode || 'UPT001'
      };

      await tarunaAPI.create(dataToSend);
      await loadTaruna();
      setShowManualModal(false);
      resetForm();
      alert('Data berhasil ditambahkan!');
    } catch (error) {
      console.error('Error tambah manual:', error);
      alert('Error menambah data. Cek kembali inputan.');
    } finally {
      setManualLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nim: '',
      nama: '',
      tempat_lahir: '',
      tanggal_lahir: '',
      jenis_kelamin: 'L',
      agama: 'Islam',
      alamat: '',
      email: '',
      telepon: '',
      program_studi: 'S1',
      jurusan: '',
      tahun_masuk: new Date().getFullYear(),
      semester: 1,
      status: 'AKTIF'
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'tahun_masuk' || name === 'semester' ? parseInt(value) : value
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AKTIF': return 'bg-green-100 text-green-800';
      case 'CUTI': return 'bg-yellow-100 text-yellow-800';
      case 'LULUS': return 'bg-blue-100 text-blue-800';
      case 'DO': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGenderIcon = (jenisKelamin: string) => {
    return jenisKelamin === 'L' ? '👨' : '👩';
  };

  // Get unique jurusan for filter
  const uniqueJurusan = [...new Set(taruna.map(t => t.jurusan))].filter(Boolean);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="p-8 flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data taruna...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-8">
        {/* Header dengan Tombol - SAMA PERSIS DOSEN */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Data Taruna/Mahasiswa</h1>
          
          {/* TOMBOL UNTUK ADMIN UPT - DUAL ACTION */}
          {user?.role === 'admin_upt' && (
            <div className="flex gap-3">
              {/* Upload File Button */}
              <button 
                onClick={() => setShowUploadModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload File Excel
              </button>
              
              {/* Tambah Manual Button */}
              <button 
                onClick={() => setShowManualModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                + Tambah Manual
              </button>
            </div>
          )}
          
          {/* INFO UNTUK SUPER ADMIN */}
          {user?.role === 'super_admin' && (
            <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">
              <p className="text-blue-700 text-sm">
                💡 <strong>Akses Read-Only:</strong> Hanya dapat melihat dan mendownload laporan
              </p>
            </div>
          )}
        </div>

        {/* Statistics Cards - SAMA PERSIS DOSEN */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800">Total Taruna</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800">Aktif</h3>
              <p className="text-2xl font-bold text-green-600">
                {stats.byStatus?.AKTIF || 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800">Cuti</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.byStatus?.CUTI || 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800">Lulus</h3>
              <p className="text-2xl font-bold text-blue-600">
                {stats.byStatus?.LULUS || 0}
              </p>
            </div>
          </div>
        )}

        {/* Search & Filter Section - SAMA PERSIS DOSEN */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari (NIM/Nama/Email)
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Masukkan NIM, Nama, atau Email..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={handleStatusChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Semua Status</option>
                <option value="AKTIF">Aktif</option>
                <option value="CUTI">Cuti</option>
                <option value="LULUS">Lulus</option>
                <option value="DO">DO</option>
              </select>
            </div>

            {/* Jurusan Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jurusan
              </label>
              <select
                value={jurusanFilter}
                onChange={handleJurusanChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Semua Jurusan</option>
                {uniqueJurusan.map(jurusan => (
                  <option key={jurusan} value={jurusan}>{jurusan}</option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Menampilkan {filteredTaruna.length} dari {taruna.length} taruna
          </div>
        </div>

        {/* Taruna Table - DESIGN SAMA DOSEN */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIM</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Program Studi/Jurusan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tahun Masuk</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Semester</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">UPT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTaruna.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.nim}</div>
                      <div className="text-sm text-gray-500">{item.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="mr-2">{getGenderIcon(item.jenis_kelamin)}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.nama}</div>
                        <div className="text-sm text-gray-500">{item.telepon}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.jurusan}</div>
                    <div className="text-sm text-gray-500">{item.program_studi}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.tahun_masuk}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Semester {item.semester}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.upt_code}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Upload File Modal - SAMA PERSIS DOSEN */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">Upload Data Taruna</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Pilih File Excel (.xlsx, .xls)
                </label>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full border border-gray-300 p-2 rounded"
                />
                <p className="text-xs text-gray-500 mt-2">
                  📝 <strong>Format file harus sesuai template:</strong><br/>
                  - Kolom: NIM, Nama, Tempat Lahir, Tanggal Lahir, Jenis Kelamin, Agama, Alamat, Email, Telepon, Program Studi, Jurusan, Tahun Masuk, Semester, Status<br/>
                  - Format tanggal: YYYY-MM-DD<br/>
                  - Status: AKTIF, CUTI, LULUS, DO<br/>
                  - Jenis Kelamin: L, P
                </p>
              </div>
              
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFile(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
                >
                  Batal
                </button>
                <button
                  onClick={handleFileUpload}
                  disabled={!uploadFile || uploadLoading}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadLoading ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tambah Manual Modal - SAMA PERSIS DOSEN */}
        {showManualModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">Tambah Taruna Manual</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">NIM *</label>
                  <input
                    type="text"
                    name="nim"
                    value={formData.nim}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2 rounded"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2 rounded"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    name="tempat_lahir"
                    value={formData.tempat_lahir}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    name="tanggal_lahir"
                    value={formData.tanggal_lahir}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Jenis Kelamin</label>
                  <select
                    name="jenis_kelamin"
                    value={formData.jenis_kelamin}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2 rounded"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Agama</label>
                  <select
                    name="agama"
                    value={formData.agama}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2 rounded"
                  >
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Alamat</label>
                  <input
                    type="text"
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2 rounded"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Telepon</label>
                  <input
                    type="text"
                    name="telepon"
                    value={formData.telepon}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Program Studi</label>
                  <select
                    name="program_studi"
                    value={formData.program_studi}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2 rounded"
                  >
                    <option value="S1">S1</option>
                    <option value="S2">S2</option>
                    <option value="S3">S3</option>
                    <option value="D3">D3</option>
                    <option value="D4">D4</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Jurusan</label>
                  <input
                    type="text"
                    name="jurusan"
                    value={formData.jurusan}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2 rounded"
                    placeholder="Teknik Informatika, Manajemen, dll."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Tahun Masuk</label>
                  <input
                    type="number"
                    name="tahun_masuk"
                    value={formData.tahun_masuk}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2 rounded"
                    min="2000"
                    max="2030"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Semester</label>
                  <input
                    type="number"
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2 rounded"
                    min="1"
                    max="14"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2 rounded"
                  >
                    <option value="AKTIF">Aktif</option>
                    <option value="CUTI">Cuti</option>
                    <option value="LULUS">Lulus</option>
                    <option value="DO">DO</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowManualModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
                >
                  Batal
                </button>
                <button
                  onClick={handleTambahManual}
                  disabled={manualLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  {manualLoading ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}