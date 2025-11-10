import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Title, Tooltip, Legend);

const API_BASE_URL = 'https://brain-mri-backend.onrender.com/api';

// Interceptor para debug
axios.interceptors.response.use(
  response => {
    console.log('API Response:', response.config.url, response.data);
    return response;
  },
  error => {
    console.error('API Error:', error.config?.url, error.response?.data);
    return Promise.reject(error);
  }
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-blue-600 text-white p-4">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">Brain MRI Dashboard</h1>
            <div className="flex space-x-4 mt-2">
              <Link to="/" className="hover:underline">Dashboard</Link>
              <Link to="/patients" className="hover:underline">Patients</Link>
              <Link to="/images" className="hover:underline">Images</Link>
              <Link to="/upload" className="hover:underline">Upload Data</Link>
            </div>
          </div>
        </nav>

        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/images" element={<Images />} />
            <Route path="/upload" element={<FileUpload />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [maskStats, setMaskStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchMaskStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/patients/stats/`);
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  const fetchMaskStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/images/mask_stats/`);
      setMaskStats(response.data);
    } catch (error) {
      console.error('Error fetching mask stats:', error);
    }
  };

  const maskChartData = maskStats ? {
    labels: ['Without Mask', 'With Mask'],
    datasets: [
      {
        data: [maskStats.mask_0, maskStats.mask_1],
        backgroundColor: ['#FF6384', '#36A2EB'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB'],
      },
    ],
  } : null;

  if (loading) return <div className="text-center py-8">Loading dashboard...</div>;
  if (!stats) return <div className="text-center py-8">No data available</div>;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Patients" value={stats.total_patients} />
        <StatCard title="Total Images" value={stats.total_images} />
        <StatCard title="Images with Mask" value={stats.images_with_mask} />
        <StatCard title="Mask Percentage" value={`${stats.mask_percentage}%`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {maskChartData && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Mask Distribution</h3>
            <div className="h-64">
              <Pie 
                data={maskChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-600">{title}</h3>
      <p className="text-3xl font-bold text-blue-600">{value}</p>
    </div>
  );
}

function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/patients/`);
      console.log('Patients API Response:', response.data);
      
      // Validación robusta de la respuesta
      if (response.data && Array.isArray(response.data)) {
        setPatients(response.data);
      } else if (response.data && response.data.results) {
        // Si usa paginación de Django REST Framework
        setPatients(response.data.results);
      } else {
        console.error('Unexpected response format:', response.data);
        setPatients([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setPatients([]);
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading patients...</div>;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Patients</h2>
      
      {!patients || patients.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No patients found
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Images
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Images with Mask
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {patient.patient_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {patient.image_count || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {patient.mask_count || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Images() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/images/`);
      console.log('Images API Response:', response.data);
      
      // Validación robusta de la respuesta
      if (response.data && Array.isArray(response.data)) {
        setImages(response.data);
      } else if (response.data && response.data.results) {
        // Si usa paginación de Django REST Framework
        setImages(response.data.results);
      } else {
        console.error('Unexpected response format:', response.data);
        setImages([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching images:', error);
      setImages([]);
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading images...</div>;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">MRI Images</h2>
      
      {/* Verificación antes de usar .map() */}
      {!images || images.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No images found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => (
            <div key={image.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="mb-2">
                <strong>Patient:</strong> {image.patient?.patient_id || image.patient_id || 'N/A'}
              </div>
              <div className="mb-2">
                <strong>Image Path:</strong> 
                <div className="text-sm text-gray-600 truncate">{image.image_path}</div>
              </div>
              <div className="mb-2">
                <strong>Mask Path:</strong> 
                <div className="text-sm text-gray-600 truncate">{image.mask_path}</div>
              </div>
              <div className="mb-2">
                <strong>Mask:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  image.mask === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {image.mask === 1 ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FileUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a CSV file');
      return;
    }

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('csv_file', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/upload-csv/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage('✅ ' + response.data.message);
    } catch (error) {
      setMessage('❌ Error: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Upload CSV Data</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select data_mask.csv file:
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        className={`px-4 py-2 rounded text-white ${
          uploading || !file
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {uploading ? 'Uploading...' : 'Upload Data'}
      </button>

      {message && (
        <div className={`mt-4 p-3 rounded ${
          message.includes('✅') 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}

export default App;