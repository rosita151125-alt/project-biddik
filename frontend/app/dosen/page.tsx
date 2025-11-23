'use client';
import { useEffect, useState } from 'react';
import { dosenAPI } from '@/lib/services/api';
import ProtectedRoute from '../components/ProtectedRoute';

interface Dosen {
  id: number;
  nip: string;
  nidn: string;
  nama: string;
  gelarDepan: string;
  gelarBelakang: string;
  jurusan: string;
  programStudi: string;
  jabatan: string;
  pendidikanTerakhir: string;
  status: string;
  uptCode: string;
  email: string;
  telepon: string;
}

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  uptCode: string;
}

interface FormDataManual {
  nip: string;
  nidn: string;
  nama: string;
  gelarDepan: string;
  gelarBelakang: string;
  jurusan: string;
  programStudi: string;
  jabatan: string;
  pendidikanTerakhir: string;
  status: string;
  email: string;
  telepon: string;
}

export default function DosenPage() {
  const [dosen, setDosen] = useState<Dosen[]>([]);
  const [filteredDosen, setFilteredDosen] = useState<Dosen[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [pendidikanFilter, setPendidikanFilter] = useState('ALL');
  const [user, setUser] = useState<User | null>(null);
  
  // State untuk modal dan upload
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  
  // State untuk form manual
  const [formData, setFormData] = useState<FormDataManual>({
    nip: '',
    nidn: '',
    nama: '',
    gelarDepan: '',
    gelarBelakang: '',
    jurusan: '',
    programStudi: '',
    jabatan: '',
    pendidikanTerakhir: 'S1',
    status: 'AKTIF',
    email: '',
    telepon: ''
  });

  // ✅ LOAD DATA INITIAL
  useEffect(() => {
    loadDosen();
    loadUserData();
  }, []);

  // ✅ AUTO FILTER - SETIAP KALI SEARCH/FILTER BERUBAH
  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, pendidikanFilter, dosen]);

  // ✅ LOAD STATS - SETELAH DATA LOADED
  useEffect(() => {
    if (dosen.length > 0) {
      loadStats();
    }
  }, [dosen]);

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

  const loadDosen = async () => {
    try {
      const response = await dosenAPI.getAll();
      setDosen(response.data);
      setFilteredDosen(response.data);
    } catch (error) {
      console.error('Error loading dosen:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Stats dari semua data (bukan filtered)
      const total = dosen.length;
      const byStatus = dosen.reduce((acc: any, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      }, {});
      
      const byPendidikan = dosen.reduce((acc: any, curr) => {
        acc[curr.pendidikanTerakhir] = (acc[curr.pendidikanTerakhir] || 0) + 1;
        return acc;
      }, {});

      setStats({
        total,
        byStatus,
        byPendidikan
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // ✅ FILTER FUNCTION YANG WORK
  const applyFilters = () => {
    console.log('🔍 Applying filters dosen...', {
      search: searchTerm,
      status: statusFilter,
      pendidikan: pendidikanFilter
    });

    let result = [...dosen];

    // Search filter
    if (searchTerm && searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(d =>
        d.nip.toLowerCase().includes(term) ||
        (d.nidn && d.nidn.toLowerCase().includes(term)) ||
        d.nama.toLowerCase().includes(term) ||
        `${d.gelarDepan} ${d.nama} ${d.gelarBelakang}`.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(d => d.status === statusFilter);
    }

    // Pendidikan filter
    if (pendidikanFilter !== 'ALL') {
      result = result.filter(d => d.pendidikanTerakhir === pendidikanFilter);
    }

    console.log('✅ Dosen filter result:', result.length, 'items');
    setFilteredDosen(result);
  };

  // ✅ HANDLERS UNTUK INPUT
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handlePendidikanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPendidikanFilter(e.target.value);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setPendidikanFilter('ALL');
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
      
      const response = await fetch('/api/dosen/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      
      await loadDosen();
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
    if (!formData.nip || !formData.nama || !formData.email) {
      alert('NIP, Nama, dan Email wajib diisi!');
      return;
    }

    setManualLoading(true);
    try {
      const dataToSend = {
        ...formData,
        uptCode: user?.uptCode || 'UPT001'
      };

      await dosenAPI.create(dataToSend);
      await loadDosen();
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
      nip: '',
      nidn: '',
      nama: '',
      gelarDepan: '',
      gelarBelakang: '',
      jurusan: '',
      programStudi: '',
      jabatan: '',
      pendidikanTerakhir: 'S1',
      status: 'AKTIF',
      email: '',
      telepon: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AKTIF': return 'bg-green-100 text-green-800';
      case 'CUTI': return 'bg-yellow-100 text-yellow-800';
      case 'PENSION': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getPendidikanColor = (pendidikan: string) => {
    switch (pendidikan) {
      case 'S3': return 'bg-purple-100 text-purple-800';
      case 'S2': return 'bg-blue-100 text-blue-800';
      case 'S1': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="p-8">Loading data dosen...</div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-8">
        {/* Header dengan Tombol - SAMA PERSIS TARUNA */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Data Dosen</h1>
          
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

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800">Total Dosen</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800">Aktif</h3>
              <p className="text-2xl font-bold text-green-600">
                {stats.byStatus?.AKTIF || 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800">S3</h3>
              <p className="text-2xl font-bold text-purple-600">
                {stats.byPendidikan?.S3 || 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800">S2</h3>
              <p className="text-2xl font-bold text-blue-600">
                {stats.byPendidikan?.S2 || 0}
              </p>
            </div>
          </div>
        )}

        {/* Search & Filter Section - SAMA PERSIS TARUNA */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari (NIP/NIDN/Nama)
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Masukkan NIP, NIDN, atau Nama..."
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
                <option value="PENSION">Pensiun</option>
              </select>
            </div>

            {/* Pendidikan Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pendidikan
              </label>
              <select
                value={pendidikanFilter}
                onChange={handlePendidikanChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">Semua Pendidikan</option>
                <option value="S3">S3</option>
                <option value="S2">S2</option>
                <option value="S1">S1</option>
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
            Menampilkan {filteredDosen.length} dari {dosen.length} dosen
          </div>
        </div>

        {/* Dosen Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jurusan/Prodi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jabatan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pendidikan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">UPT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDosen.map((dosen) => (
                <tr key={dosen.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{dosen.nip}</div>
                      {dosen.nidn && (
                        <div className="text-sm text-gray-500">NIDN: {dosen.nidn}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {dosen.gelarDepan} {dosen.nama} {dosen.gelarBelakang}
                    </div>
                    <div className="text-sm text-gray-500">{dosen.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{dosen.jurusan}</div>
                    <div className="text-sm text-gray-500">{dosen.programStudi}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dosen.jabatan}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${getPendidikanColor(dosen.pendidikanTerakhir)}`}>
                      {dosen.pendidikanTerakhir}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(dosen.status)}`}>
                      {dosen.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dosen.uptCode}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Upload File Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">Upload Data Dosen</h3>
              
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
                  - Kolom: NIP, NIDN, Nama, Gelar Depan, Gelar Belakang, Jurusan, Program Studi, Jabatan, Pendidikan Terakhir, Status, Email, Telepon<br/>
                  - Status: AKTIF, CUTI, PENSION<br/>
                  - Pendidikan: S1, S2, S3
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

        {/* Tambah Manual Modal */}
        {showManualModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">Tambah Dosen Manual</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">NIP *</label>
                  <input
                    type="text"
                    name="nip"
                    value={formData.nip}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2 rounded"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">NIDN</label>
                  <input
                    type="text"
                    name="nidn"
                    value={formData.nidn}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2 rounded"
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
                  <label className="block text-sm font-medium mb-1">Gelar Depan</label>
                  <input
                    type="text"
                    name="gelarDepan"
                    value={formData.gelarDepan}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2 rounded"
                    placeholder="Dr., Ir., etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Gelar Belakang</label>
                  <input
                    type="text"
                    name="gelarBelakang"
                    value={formData.gelarBelakang}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2 rounded"
                    placeholder="S.Kom., M.Kom., etc."
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
                  <label className="block text-sm font-medium mb-1">Jurusan</label>
                  <input
                    type="text"
                    name="jurusan"
                    value={formData.jurusan}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Program Studi</label>
                  <input
                    type="text"
                    name="programStudi"
                    value={formData.programStudi}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Jabatan</label>
                  <input
                    type="text"
                    name="jabatan"
                    value={formData.jabatan}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2 rounded"
                    placeholder="Lektor, Asisten Ahli, etc."
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
                  <label className="block text-sm font-medium mb-1">Pendidikan Terakhir</label>
                  <select
                    name="pendidikanTerakhir"
                    value={formData.pendidikanTerakhir}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2 rounded"
                  >
                    <option value="S1">S1</option>
                    <option value="S2">S2</option>
                    <option value="S3">S3</option>
                  </select>
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
                    <option value="PENSION">Pensiun</option>
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