import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, List, FileText, Download, Settings, BarChart2, Save, Eye, Clock, Check, XCircle, AlertCircle, Grid, Inbox, RefreshCw } from 'lucide-react';

// Main App Component
const ProductInspectionApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inspectionActive, setInspectionActive] = useState(false);
  const [detectedProducts, setDetectedProducts] = useState([]);
  const [productStats, setProductStats] = useState({
    total: 0,
    good: 0,
    bad: 0,
    speed: 0
  });
  const [companyInfo, setCompanyInfo] = useState({
    name: "Demo Manufacturing Ltd",
    products: [
      { id: 1, name: "Water Bottle 500ml", type: "Bottle", criteria: "Label position, Cap integrity, Fill level" },
      { id: 2, name: "Carbonated Drink 330ml", type: "Can", criteria: "Dent detection, Print quality" }
    ]
  });
  
  // Add product to the database
  const addProduct = (product) => {
    const newProduct = {
      id: companyInfo.products.length + 1,
      ...product
    };
    
    setCompanyInfo(prev => ({
      ...prev,
      products: [...prev.products, newProduct]
    }));
  };
  
  // Update product information
  const updateProduct = (id, updatedData) => {
    setCompanyInfo(prev => ({
      ...prev,
      products: prev.products.map(product => 
        product.id === id ? { ...product, ...updatedData } : product
      )
    }));
  };
  
  // Delete product from database
  const deleteProduct = (id) => {
    setCompanyInfo(prev => ({
      ...prev,
      products: prev.products.filter(product => product.id !== id)
    }));
  };
  
  // Handle new product detection (from camera feed)
  const handleNewDetection = (detection) => {
    setDetectedProducts(prev => [detection, ...prev].slice(0, 50));
    
    // Update stats
    setProductStats(prev => ({
      total: prev.total + 1,
      good: prev.good + (detection.class === 'good' ? 1 : 0),
      bad: prev.bad + (detection.class === 'bad' ? 1 : 0),
      speed: detection.processingTime || Math.floor(2 + Math.random() * 3)
    }));
  };
  
  // Load saved inspection data from localStorage
  useEffect(() => {
    try {
      const savedStats = localStorage.getItem('productInspectionStats');
      const savedProducts = localStorage.getItem('detectedProducts');
      const savedCompanyInfo = localStorage.getItem('companyInfo');
      
      if (savedStats) {
        setProductStats(JSON.parse(savedStats));
      }
      
      if (savedProducts) {
        setDetectedProducts(JSON.parse(savedProducts));
      }
      
      if (savedCompanyInfo) {
        setCompanyInfo(JSON.parse(savedCompanyInfo));
      }
    } catch (error) {
      console.error("Error loading saved data:", error);
    }
  }, []);
  
  // Save inspection data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('productInspectionStats', JSON.stringify(productStats));
      localStorage.setItem('detectedProducts', JSON.stringify(detectedProducts));
      localStorage.setItem('companyInfo', JSON.stringify(companyInfo));
    } catch (error) {
      console.error("Error saving data:", error);
    }
  }, [productStats, detectedProducts, companyInfo]);

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return <Dashboard stats={productStats} setInspectionActive={setInspectionActive} inspectionActive={inspectionActive} />;
      case 'live':
        return <LiveView detectedProducts={detectedProducts} inspectionActive={inspectionActive} setInspectionActive={setInspectionActive} />;
      case 'products':
        return <ProductConfig />;
      case 'reports':
        return <Reports stats={productStats} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white">
        <div className="p-4 border-b border-blue-800">
          <h1 className="text-xl font-bold">ProductInspect AI</h1>
          <p className="text-sm text-blue-300">Quality Control System</p>
        </div>
        
        <nav className="p-4">
          <SidebarLink 
            icon={<BarChart2 size={18} />} 
            title="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarLink 
            icon={<Camera size={18} />} 
            title="Live Inspection" 
            active={activeTab === 'live'} 
            onClick={() => setActiveTab('live')} 
          />
          <SidebarLink 
            icon={<Inbox size={18} />} 
            title="Products Setup" 
            active={activeTab === 'products'} 
            onClick={() => setActiveTab('products')} 
          />
          <SidebarLink 
            icon={<FileText size={18} />} 
            title="Reports" 
            active={activeTab === 'reports'} 
            onClick={() => setActiveTab('reports')} 
          />
          <SidebarLink 
            icon={<Settings size={18} />} 
            title="Settings" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white p-4 shadow-sm flex justify-between items-center">
          <h2 className="text-xl font-semibold">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Company: Demo Manufacturing Ltd</span>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Settings size={18} />
            </button>
          </div>
        </header>
        
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// Sidebar Link Component
const SidebarLink = ({ icon, title, active, onClick }) => {
  return (
    <button 
      className={`flex items-center gap-3 p-3 rounded-lg w-full text-left mb-1 ${active ? 'bg-blue-800' : 'hover:bg-blue-800/50'}`}
      onClick={onClick}
    >
      {icon}
      <span>{title}</span>
    </button>
  );
};

// Dashboard Component
const Dashboard = ({ stats, setInspectionActive, inspectionActive }) => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Inspected" 
          value={stats?.total || 0}
          icon={<Eye className="text-blue-500" />}
          color="blue"
        />
        <StatCard 
          title="Pass Rate" 
          value={stats?.total ? `${Math.round((stats.good / stats.total) * 100)}%` : '0%'}
          icon={<Check className="text-green-500" />}
          color="green"
        />
        <StatCard 
          title="Defect Rate" 
          value={stats?.total ? `${Math.round((stats.bad / stats.total) * 100)}%` : '0%'}
          icon={<AlertCircle className="text-red-500" />}
          color="red"
        />
        <StatCard 
          title="Processing Speed" 
          value={`${stats?.speed || 0} ms`}
          icon={<Clock className="text-purple-500" />}
          color="purple"
        />
      </div>
      
      <div className="flex gap-4 mb-6">
        <button 
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${inspectionActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white font-medium`}
          onClick={() => setInspectionActive(!inspectionActive)}
        >
          {inspectionActive ? (
            <>
              <XCircle size={18} />
              Stop Inspection
            </>
          ) : (
            <>
              <Camera size={18} />
              Start Inspection
            </>
          )}
        </button>
        
        <button className="px-4 py-2 rounded-lg flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium">
          <Download size={18} />
          Export Report
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Inspection Performance</h3>
            <select className="text-sm border rounded p-1">
              <option>Today</option>
              <option>Last 7 Days</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
            <div className="text-center text-gray-500">
              <BarChart2 size={48} className="mx-auto mb-2 opacity-50" />
              <p>Inspection statistics chart would appear here</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Recent Defects</h3>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 p-2 bg-red-50 rounded border border-red-100">
                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                  <Inbox size={18} className="text-gray-400" />
                </div>
                <div>
                  <div className="font-medium">Product #{30 + i}</div>
                  <div className="text-sm text-gray-500">{i * 5} minutes ago</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: 'bg-blue-50 border-blue-100',
    green: 'bg-green-50 border-green-100',
    red: 'bg-red-50 border-red-100',
    purple: 'bg-purple-50 border-purple-100',
  };
  
  return (
    <div className={`p-4 rounded-lg border ${colors[color]} flex items-center`}>
      <div className="bg-white p-3 rounded-full mr-4">
        {icon}
      </div>
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
    </div>
  );
};

// Live View Component
const LiveView = ({ detectedProducts, inspectionActive, setInspectionActive }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [detections, setDetections] = useState([]);
  const [error, setError] = useState(null);

  // Start camera when inspection is activated
  useEffect(() => {
    if (inspectionActive) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [inspectionActive]);

  // Initialize camera stream
  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "environment" // Use back camera on mobile if available
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setCameraReady(true);
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please check permissions.");
      setInspectionActive(false);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraReady(false);
    }
  };

  // Simple detection algorithm (runs on an interval when camera is active)
  useEffect(() => {
    let detectionInterval;
    
    if (cameraReady && inspectionActive) {
      detectionInterval = setInterval(() => {
        runObjectDetection();
      }, 1000); // Run detection every second
    }
    
    return () => {
      if (detectionInterval) clearInterval(detectionInterval);
    };
  }, [cameraReady, inspectionActive]);

  // Basic object detection algorithm
  const runObjectDetection = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data for processing
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Very basic detection algorithm (just for demo purposes)
    // This uses color detection to find objects - in a real app this would be replaced
    // with a proper computer vision model
    
    // Find regions of interest (simplified approach)
    let regions = [];
    const scanStep = 20; // Skip pixels for performance
    
    for (let y = 0; y < canvas.height; y += scanStep) {
      for (let x = 0; x < canvas.width; x += scanStep) {
        const idx = (y * canvas.width + x) * 4;
        
        // Look for blue pixels (like bottle caps in the example image)
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        
        // Simple color threshold for blue objects
        if (b > 120 && b > r * 1.5 && b > g * 1.5) {
          regions.push({x, y, width: 100, height: 250});
          // Skip ahead to avoid multiple detections of same object
          x += 100;
        }
      }
    }
    
    // Remove overlapping regions (very basic implementation)
    const finalRegions = [];
    for (const region of regions) {
      let shouldAdd = true;
      for (const existing of finalRegions) {
        if (Math.abs(region.x - existing.x) < 50) {
          shouldAdd = false;
          break;
        }
      }
      if (shouldAdd) finalRegions.push(region);
    }
    
    // Draw bounding boxes and update detections
    const newDetections = finalRegions.map((region, index) => {
      // Generate detection data
      const detection = {
        id: Math.floor(Math.random() * 100),
        x: region.x,
        y: region.y,
        width: region.width,
        height: region.height,
        class: Math.random() > 0.2 ? 'good' : 'bad',
        confidence: (0.85 + Math.random() * 0.15).toFixed(2),
        timestamp: new Date().toISOString()
      };
      
      // Draw bounding box
      ctx.strokeStyle = detection.class === 'good' ? '#00C853' : '#D50000';
      ctx.lineWidth = 2;
      ctx.strokeRect(region.x, region.y, region.width, region.height);
      
      // Draw label
      ctx.fillStyle = detection.class === 'good' ? '#00C853' : '#D50000';
      ctx.fillRect(region.x, region.y - 20, 100, 20);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.fillText(`ID: ${detection.id} (${detection.class})`, region.x + 5, region.y - 5);
      
      return detection;
    });
    
    // Update state with new detections
    if (newDetections.length > 0) {
      setDetections(prev => [...newDetections, ...prev].slice(0, 20));
      // Also add to the main app's detection list
      newDetections.forEach(detection => {
        const newProduct = {
          id: detection.id,
          class: detection.class,
          timestamp: detection.timestamp,
          confidence: detection.confidence
        };
        detectedProducts.unshift(newProduct);
      });
    }
  };
  
  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Live Camera Feed</h3>
        <button 
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${inspectionActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white font-medium`}
          onClick={() => setInspectionActive(!inspectionActive)}
        >
          {inspectionActive ? (
            <>
              <XCircle size={18} />
              Stop Inspection
            </>
          ) : (
            <>
              <Camera size={18} />
              Start Inspection
            </>
          )}
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video shadow">
            {/* Real camera feed */}
            <video 
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            
            {/* Canvas for drawing detection overlays */}
            <canvas 
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
            />
            
            {error && (
              <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center text-white p-4">
                <div className="bg-red-600 p-4 rounded shadow-lg max-w-md">
                  <p className="font-bold mb-2">Camera Error</p>
                  <p>{error}</p>
                </div>
              </div>
            )}
            
            {!inspectionActive && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <div className="text-center">
                  <Camera size={48} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-gray-300">Camera feed inactive</p>
                  <button 
                    className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    onClick={() => setInspectionActive(true)}
                  >
                    Start Inspection
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-medium mb-2 text-sm text-gray-500">Camera Settings</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Resolution</span>
                  <span className="font-medium">1080p</span>
                </div>
                <div className="flex justify-between">
                  <span>FPS</span>
                  <span className="font-medium">30</span>
                </div>
                <div className="flex justify-between">
                  <span>Model</span>
                  <span className="font-medium">ProductDetect v2</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h4 className="font-medium mb-2 text-sm text-gray-500">Detection Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Objects Detected</span>
                  <span className="font-medium">{detectedProducts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Good Products</span>
                  <span className="font-medium text-green-600">
                    {detectedProducts.filter(p => p.class === 'good').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Defective Products</span>
                  <span className="font-medium text-red-600">
                    {detectedProducts.filter(p => p.class === 'bad').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h4 className="font-medium">Detection Log</h4>
          </div>
          <div className="p-2 h-96 overflow-auto">
            {detectedProducts.length > 0 ? (
              <div className="space-y-2">
                {detectedProducts.map((product) => (
                  <div key={product.id + product.timestamp} className={`p-2 rounded border ${product.class === 'good' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                    <div className="flex justify-between">
                      <span className="font-medium">Object ID: {product.id}</span>
                      <span className={product.class === 'good' ? 'text-green-600' : 'text-red-600'}>
                        {product.class.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      <div>Confidence: {product.confidence}</div>
                      <div>{new Date(product.timestamp).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <List size={36} className="mb-2" />
                <p>No detections yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Product Configuration Component
const ProductConfig = () => {
  const [products, setProducts] = useState([
    { id: 1, name: "Water Bottle 500ml", type: "Bottle", criteria: "Label position, Cap integrity, Fill level" },
    { id: 2, name: "Carbonated Drink 330ml", type: "Can", criteria: "Dent detection, Print quality" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    criteria: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState({
    good: 0,
    defective: 0
  });
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingId) {
      // Update existing product
      setProducts(prev => 
        prev.map(product => 
          product.id === editingId ? { ...product, ...formData } : product
        )
      );
      setEditingId(null);
    } else {
      // Add new product
      const newProduct = {
        id: products.length + 1,
        ...formData
      };
      setProducts(prev => [...prev, newProduct]);
    }
    
    // Reset form
    setFormData({
      name: "",
      type: "",
      criteria: ""
    });
    setShowForm(false);
  };
  
  // Handle edit product
  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      type: product.type,
      criteria: product.criteria
    });
    setEditingId(product.id);
    setShowForm(true);
  };
  
  // Handle delete product
  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts(prev => prev.filter(product => product.id !== id));
    }
  };
  
  // Handle file upload
  const handleFileUpload = (type, e) => {
    const files = e.target.files;
    if (files.length > 0) {
      // In a real app, you would process and upload these files to the server
      // Here we just update the count for demonstration
      setUploadedFiles(prev => ({
        ...prev,
        [type]: prev[type] + files.length
      }));
      
      // Show success message
      alert(`Successfully uploaded ${files.length} ${type} sample images.`);
    }
  };
  
  // Train the model
  const trainModel = () => {
    // In a real app, this would send a request to the server to train the model
    alert("Training process initiated. This would typically take several minutes in a real system.");
  };
  
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Product Configuration</h3>
        <button className="px-4 py-2 rounded-lg flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium">
          <Save size={18} />
          Add New Product
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Inspection Criteria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {product.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.type}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {product.criteria}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Train Detection Model</h3>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="mb-6">
            <p className="mb-2 text-gray-600">Upload sample images to train the model for detecting defects specific to your products.</p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload size={36} className="mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">Drop files here or click to upload</p>
              <p className="text-xs text-gray-400 mt-1">Supported formats: JPG, PNG - minimum 10 samples recommended</p>
              <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Upload Images
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Good Samples</h4>
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Uploaded: 24 images</span>
                <span>Required: 20+</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Defective Samples</h4>
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Uploaded: 12 images</span>
                <span>Required: 20+</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
          
          <button className="mt-6 px-6 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600 mx-auto">
            <RefreshCw size={18} />
            Train Model
          </button>
        </div>
      </div>
    </div>
  );
};

// Reports Component
const Reports = ({ stats }) => {
  const exportToExcel = () => {
    try {
      // Create workbook
      const XLSX = window.XLSX || {};
      const workbook = XLSX.utils.book_new();
      
      // Create inspection data
      const inspectionData = [];
      
      // Add header row
      inspectionData.push([
        "Date", "Time", "Product ID", "Product Type", "Status", "Issue", "Confidence"
      ]);
      
      // Add sample data rows
      for (let i = 0; i < 10; i++) {
        const date = new Date(Date.now() - i * 300000);
        inspectionData.push([
          date.toLocaleDateString(),
          date.toLocaleTimeString(),
          `${30 - i}`,
          "Water Bottle 500ml",
          i % 3 === 0 ? "Failed" : "Passed",
          i % 3 === 0 ? "Label misalignment" : "-",
          (Math.random() * 0.2 + 0.8).toFixed(2)
        ]);
      }
      
      // Add summary data
      inspectionData.push([]);
      inspectionData.push(["Summary Statistics"]);
      inspectionData.push(["Total Inspected", stats.total]);
      inspectionData.push(["Good Products", stats.good]);
      inspectionData.push(["Defective Products", stats.bad]);
      inspectionData.push(["Pass Rate", stats.total ? `${Math.round((stats.good / stats.total) * 100)}%` : "0%"]);
      
      // Convert data to worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(inspectionData);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Inspection Report");
      
      // Generate Excel file and trigger download
      XLSX.writeFile(workbook, `Inspection_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Failed to export Excel file. Please try again.");
    }
  };
  
  const exportToPDF = () => {
    try {
      // Create a new jsPDF instance
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text("Product Inspection Report", 105, 15, { align: 'center' });
      
      // Add date
      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 25, { align: 'center' });
      
      // Add summary statistics
      doc.setFontSize(14);
      doc.text("Summary Statistics", 20, 40);
      
      doc.setFontSize(12);
      doc.text(`Total Inspected: ${stats.total}`, 20, 50);
      doc.text(`Pass Rate: ${stats.total ? Math.round((stats.good / stats.total) * 100) : 0}%`, 20, 57);
      doc.text(`Defect Rate: ${stats.total ? Math.round((stats.bad / stats.total) * 100) : 0}%`, 20, 64);
      
      // Add inspection log table
      doc.setFontSize(14);
      doc.text("Recent Inspection Log", 20, 80);
      
      const tableColumn = ["Time", "ID", "Product", "Status", "Issue"];
      const tableRows = [];
      
      // Generate sample data for the table
      for (let i = 0; i < 10; i++) {
        const date = new Date(Date.now() - i * 300000);
        const time = date.toLocaleTimeString();
        const id = `${30 - i}`;
        const product = "Water Bottle 500ml";
        const status = i % 3 === 0 ? "Failed" : "Passed";
        const issue = i % 3 === 0 ? "Label misalignment" : "-";
        
        tableRows.push([time, id, product, status, issue]);
      }
      
      // Create the table
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 85,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [66, 139, 202] }
      });
      
      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Page ${i} of ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
        doc.text("ProductInspect AI", 20, doc.internal.pageSize.height - 10);
      }
      
      // Save the PDF
      doc.save(`Inspection_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      alert("Failed to export PDF file. Please try again. You may need to include the jsPDF library.");
    }
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Inspection Reports</h3>
        <div className="flex gap-2">
          <button 
            className="px-4 py-2 rounded flex items-center gap-2 border hover:bg-gray-50"
            onClick={exportToPDF}
          >
            <Download size={18} />
            Export PDF
          </button>
          <button 
            className="px-4 py-2 rounded flex items-center gap-2 border hover:bg-gray-50"
            onClick={exportToExcel}
          >
            <Download size={18} />
            Export Excel
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="font-medium mb-4">Inspection Summary</h4>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Inspected Products</span>
              <span className="font-semibold">{stats.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pass Rate</span>
              <span className="font-semibold text-green-600">
                {stats.total ? Math.round((stats.good / stats.total) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Defect Rate</span>
              <span className="font-semibold text-red-600">
                {stats.total ? Math.round((stats.bad / stats.total) * 100) : 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Inspection Period</span>
              <span className="font-semibold">Today, Mar 16, 2025</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="font-medium mb-4">Quality by Product Type</h4>
          <div className="h-40 flex items-center justify-center bg-gray-100 rounded">
            <div className="text-center text-gray-500">
              <BarChart2 size={32} className="mx-auto mb-2 opacity-50" />
              <p>Product type comparison chart</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <h4 className="font-medium">Detailed Inspection Log</h4>
          <div className="flex gap-2">
            <select className="text-sm border rounded p-1">
              <option>All Products</option>
              <option>Water Bottle 500ml</option>
              <option>Carbonated Drink 330ml</option>
            </select>
            <select className="text-sm border rounded p-1">
              <option>Today</option>
              <option>Last 7 Days</option>
              <option>This Month</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue (if any)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(10)].map((_, i) => (
                <tr key={i} className={i % 3 === 0 ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(Date.now() - i * 300000).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {30 - i}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Water Bottle 500ml
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${i % 3 === 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {i % 3 === 0 ? 'Failed' : 'Passed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {i % 3 === 0 ? 'Label misalignment' : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(Math.random() * 0.2 + 0.8).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-3 flex items-center justify-between border-t">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of <span className="font-medium">30</span> results
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border rounded hover:bg-gray-50 text-sm">Previous</button>
            <button className="px-4 py-2 border rounded hover:bg-gray-50 text-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInspectionApp;
