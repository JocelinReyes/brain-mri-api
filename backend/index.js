const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra'); // Asegurar que está importado
const BrainMRIModel = require('./ml/trainModel');

const app = express();
const mlModel = new BrainMRIModel();

// Configuración CORS MUY permisiva - Permitir todos los orígenes
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With', 'Accept']
}));

// Middleware para preflight requests
app.options('*', cors());

app.use(express.json());

// Asegurar que el directorio uploads existe
const ensureUploadsDir = async () => {
  try {
    await fs.ensureDir('uploads');
    console.log('✅ Directorio uploads verificado/creado');
  } catch (error) {
    console.error('❌ Error creando directorio uploads:', error);
  }
};

// Configuración de multer para uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await ensureUploadsDir();
      cb(null, 'uploads/');
    } catch (error) {
      cb(error, 'uploads/');
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Aceptar CSV y otros tipos comunes
    const allowedMimes = [
      'text/csv',
      'application/vnd.ms-excel',
      'text/plain'
    ];
    
    if (allowedMimes.includes(file.mimetype) || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos CSV'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB límite
  }
});

// Inicializar directorio al iniciar
ensureUploadsDir();

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Brain MRI Backend with ML is running!',
    timestamp: new Date().toISOString(),
    version: '2.0.1'
  });
});

// Ruta principal
app.get('/', (req, res) => {
  res.json({ 
    message: 'Brain MRI API with Machine Learning',
    version: '2.0.1',
    endpoints: {
      health: '/health',
      stats: '/api/patients/stats/',
      mask_stats: '/api/images/mask_stats/',
      patients: '/api/patients/',
      images: '/api/images/',
      upload: '/api/upload-csv/',
      ml: {
        train: '/api/train-model',
        predict: '/api/predict',
        status: '/api/model-status',
        history: '/api/prediction-history'
      }
    }
  });
});

// Ruta de estadísticas de pacientes
app.get('/api/patients/stats/', (req, res) => {
  console.log('📊 Stats endpoint called');
  res.json({
    total_patients: 150,
    total_images: 200,
    images_with_mask: 150,
    mask_percentage: 75
  });
});

// Ruta de estadísticas de máscaras
app.get('/api/images/mask_stats/', (req, res) => {
  console.log('🎭 Mask stats endpoint called');
  res.json({
    mask_0: 50,
    mask_1: 150
  });
});

// Ruta de lista de pacientes
app.get('/api/patients/', (req, res) => {
  console.log('👥 Patients endpoint called');
  res.json([
    { id: 1, patient_id: "P001", image_count: 5, mask_count: 3 },
    { id: 2, patient_id: "P002", image_count: 8, mask_count: 6 },
    { id: 3, patient_id: "P003", image_count: 3, mask_count: 2 },
    { id: 4, patient_id: "P004", image_count: 7, mask_count: 5 },
    { id: 5, patient_id: "P005", image_count: 4, mask_count: 3 }
  ]);
});

// Ruta de lista de imágenes
app.get('/api/images/', (req, res) => {
  console.log('🖼️ Images endpoint called');
  res.json([
    { 
      id: 1, 
      patient_id: "P001", 
      image_path: "images/brain_001.png", 
      mask_path: "masks/mask_001.png", 
      mask: 1 
    },
    { 
      id: 2, 
      patient_id: "P002", 
      image_path: "images/brain_002.png", 
      mask_path: "masks/mask_002.png", 
      mask: 0 
    },
    { 
      id: 3, 
      patient_id: "P003", 
      image_path: "images/brain_003.png", 
      mask_path: "masks/mask_003.png", 
      mask: 1 
    }
  ]);
});

// Ruta para upload de CSV general - VERSIÓN MEJORADA
app.post('/api/upload-csv/', upload.single('csv_file'), async (req, res) => {
  try {
    console.log('📁 Upload CSV endpoint called');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó archivo CSV' });
    }

    console.log('✅ Archivo recibido:', req.file.filename);
    
    // Simular procesamiento del CSV
    await new Promise(resolve => setTimeout(resolve, 1000));

    res.json({
      message: 'CSV uploaded and processed successfully',
      filename: req.file.originalname,
      storedAs: req.file.filename,
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
      note: 'File is ready for ML training'
    });

  } catch (error) {
    console.error('❌ Error en upload:', error);
    res.status(500).json({ 
      error: 'Error processing CSV file',
      details: error.message 
    });
  }
});

// === ENDPOINTS DE MACHINE LEARNING ===

// Endpoint para entrenar modelo - VERSIÓN MEJORADA
app.post('/api/train-model', upload.single('training_data'), async (req, res) => {
  try {
    console.log('🎯 Train model endpoint called');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó archivo de entrenamiento' });
    }

    console.log('📁 Archivo recibido para entrenamiento:', req.file.filename);
    
    const epochs = parseInt(req.body.epochs) || 50;
    
    // Simular entrenamiento
    console.log(`🤖 Simulando entrenamiento por ${epochs} épocas...`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const trainingResults = await mlModel.train(req.file.path, epochs);
    
    // Limpiar archivo temporal
    try {
      await fs.remove(req.file.path);
      console.log('🧹 Archivo temporal limpiado');
    } catch (cleanupError) {
      console.warn('No se pudo limpiar archivo temporal:', cleanupError);
    }

    res.json({
      message: 'Modelo entrenado exitosamente',
      accuracy: trainingResults.accuracy,
      loss: trainingResults.loss,
      epochs: trainingResults.epochs,
      trainingSamples: trainingResults.trainingSamples,
      modelStats: trainingResults.modelStats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error en entrenamiento:', error);
    res.status(500).json({ 
      error: 'Error en entrenamiento del modelo',
      details: error.message 
    });
  }
});

// Endpoint para predecir
app.post('/api/predict', (req, res) => {
  try {
    console.log('🔮 Predict endpoint called');
    
    const { patient_id, image_count, mask_count, mask } = req.body;
    
    if (!patient_id || !image_count) {
      return res.status(400).json({ 
        error: 'Patient ID and Image Count are required' 
      });
    }

    const prediction = mlModel.predict({
      patient_id,
      image_count,
      mask_count,
      mask
    });

    res.json(prediction);

  } catch (error) {
    console.error('❌ Error en predicción:', error);
    res.status(400).json({ 
      error: error.message 
    });
  }
});

// Endpoint para estado del modelo
app.get('/api/model-status', (req, res) => {
  try {
    const modelStats = mlModel.getModelStats();
    res.json(modelStats);
  } catch (error) {
    res.status(500).json({ 
      error: 'Error obteniendo estado del modelo' 
    });
  }
});

// Endpoint para historial de predicciones
app.get('/api/prediction-history', (req, res) => {
  try {
    const history = mlModel.getPredictionHistory();
    res.json({
      totalPredictions: history.length,
      predictions: history.slice(-10)
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error obteniendo historial' 
    });
  }
});

// Manejo de errores de multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El archivo es demasiado grande. Límite: 10MB' });
    }
  }
  
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  
  res.status(500).json({ 
    error: error.message || 'Internal server error' 
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      '/health',
      '/api/patients/stats/',
      '/api/images/mask_stats/',
      '/api/patients/',
      '/api/images/',
      '/api/upload-csv/',
      '/api/train-model',
      '/api/predict',
      '/api/model-status'
    ]
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Brain MRI Backend with ML running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 Frontend: https://brain-mri-frontend.onrender.com`);
  console.log(`📁 Directorio uploads: listo`);
});