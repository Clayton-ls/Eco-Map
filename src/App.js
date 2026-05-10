import { useState, useEffect } from 'react';
import { ecoPointsCollection } from './firebase';
import { addDoc, onSnapshot } from 'firebase/firestore';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Snackbar } from '@mui/material';

// Contexto
import { useAuth } from './contexts/AuthContext';

// Componentes
import MapView from './components/MapView';
import AddPointForm from './components/AddPointForm';
import Login from './components/Login';

function App() {
  const [points, setPoints] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const { user, logout} = useAuth();
 
  const filteredPoints = points.filter(point => {
    const validName = point.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const validCoords = point.latitude != null && point.longitude != null;
    return validName && validCoords;
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(ecoPointsCollection, (snapshot) => {
      const pointsData = [];
      snapshot.forEach(doc => pointsData.push({ id: doc.id, ...doc.data() }));
      setPoints(pointsData);
    });
    return () => unsubscribe();
  }, []);

  const handleAddPoint = async (newPoint) => {
    try {
      await addDoc(ecoPointsCollection, {
        name: newPoint.name || "Sem nome",
        type: newPoint.type || "coleta",
        description: newPoint.description || "",
        latitude: newPoint.latitude,
        longitude: newPoint.longitude,
        createdAt: new Date()
      });
      setSnackbar({ open: true, message: "Ponto adicionado com sucesso!" });
    } catch (err) {
      console.error("Erro ao salvar:", err);
      setSnackbar({ open: true, message: "Erro ao salvar ponto." });
    }
  };

  return (
      <Router>
        <div className="app" style={{ padding: "1rem", maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        borderBottom: '1px solid #eee',
        paddingBottom: '1rem'
      }}>
        <div>
          <h1 style={{ margin: 0, color: '#2E7D32' }}>EcoMap</h1>
          <p style={{ margin: 0, color: "#666" }}>Mapeando um mundo mais sustentável</p>
        </div>

        <nav>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.9rem' }}>Olá, <strong>{user.email}</strong></span>
              <button 
                onClick={logout}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Sair
              </button>
            </div>
          ) : (
            window.location.pathname !== '/login' && (
              <a href="/login" className="btn-login">
                Entrar / Cadastrar
              </a>
            )
          )}
        </nav>
      </header>

          <Routes>
            <Route path="/" element={
              <div className="main-container"> 
                <aside className="aside-form">
                  <AddPointForm onAdd={handleAddPoint} />
                </aside>
              <main className="main-map">
              <input
                type="text"
                placeholder="Buscar pontos (ex: coleta, feira)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <div className="map-wrapper">
                <MapView points={filteredPoints} />
              </div>
            </main>
            </div>
            }/>

            <Route path="/login" element={<Login />} />
          </Routes>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar({ open: false, message: "" })}
            message={snackbar.message}
          />
        </div>
      </Router>
  );
}

export default App;