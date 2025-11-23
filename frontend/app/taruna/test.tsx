'use client';
import { useState, useEffect } from 'react';

export default function TestFilter() {
  const [data] = useState([
    { id: 1, name: 'Ahmad', status: 'Aktif' },
    { id: 2, name: 'Budi', status: 'Cuti' },
    { id: 3, name: 'Siti', status: 'Aktif' }
  ]);
  
  const [filtered, setFiltered] = useState(data);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const result = data.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
    console.log('🔍 Search:', search, 'Results:', result.length);
  }, [search, data]);

  return (
    <div className="p-8">
      <h1>Test Filter</h1>
      <input 
        type="text" 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari nama..."
        className="border p-2"
      />
      <div>
        {filtered.map(item => (
          <div key={item.id}>{item.name} - {item.status}</div>
        ))}
      </div>
    </div>
  );
}