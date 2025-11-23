// lib/services/api.ts
export const tarunaAPI = {
  getAll: async () => {
    try {
      const response = await fetch('http://localhost:3001/taruna');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};

// lib/services/api.ts - UPDATE dosenAPI
export const dosenAPI = {
  getAll: async () => {
    try {
      const response = await fetch('http://localhost:3001/dosen');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  // ✅ TAMBAHKIN INI - getStats
  getStats: async () => {
    try {
      const response = await fetch('http://localhost:3001/dosen/stats');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  create: async (dosenData: any) => {
    const response = await fetch('http://localhost:3001/dosen', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dosenData),
    });
    return response.json();
  },
  update: async (id: number, dosenData: any) => {
    const response = await fetch(`http://localhost:3001/dosen/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dosenData),
    });
    return response.json();
  },
  delete: async (id: number) => {
    const response = await fetch(`http://localhost:3001/dosen/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  }
};
