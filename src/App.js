import { useState, useEffect } from 'react';
import { ecoPointsCollection } from './firebase';
import { addDoc, onSnapshot, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Snackbar, CircularProgress } from '@mui/material';

import { db } from './firebase';

// Contexto
import { useAuth } from './contexts/AuthContext';

// Componentes
import MapView from './components/MapView';
import AddPointForm from './components/AddPointForm';
import Login from './components/Login';

function App() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [editingPoint, setEditingPoint] = useState(null);
  const { user, logout} = useAuth();
 
  const filteredPoints = points.filter(point => {
    const validName = point.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const validType = typeFilter ? point.type === typeFilter : true;
    const validCoords = point.latitude != null && point.longitude != null;
    return validName && validType && validCoords;
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      ecoPointsCollection,
      (snapshot) => {
        const pointsData = [];
        snapshot.forEach((d) => pointsData.push({ id: d.id, ...d.data() }));
        setPoints(pointsData);
        setLoading(false);
      },
      (error) => {
        console.error("Erro ao carregar pontos:", error);
        setLoading(false);
        setSnackbar({ open: true, message: "Erro ao carregar os pontos do mapa. Verifique as regras do Firestore." });
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSavePoint = async (newPoint) => {
    try {
      if (editingPoint) {
        // Edição: atualiza apenas os campos editáveis (a coordenada original é mantida)
        await updateDoc(doc(db, "ecoPoints", editingPoint.id), {
          name: newPoint.name || "Sem nome",
          type: newPoint.type || "coleta",
          description: newPoint.description || ""
        });
        setSnackbar({ open: true, message: "Ponto atualizado com sucesso!" });
      } else {
        await addDoc(ecoPointsCollection, {
          name: newPoint.name || "Sem nome",
          type: newPoint.type || "coleta",
          description: newPoint.description || "",
          latitude: newPoint.latitude,
          longitude: newPoint.longitude,
          userId: user.uid,
          createdAt: serverTimestamp()
        });
        setSnackbar({ open: true, message: "Ponto adicionado com sucesso!" });
      }
      setEditingPoint(null);
    } catch (err) {
      console.error("Erro ao salvar:", err);
      setSnackbar({ open: true, message: "Erro ao salvar ponto." });
    }
  };

  const handleDeletePoint = async (point) => {
    try {
      await deleteDoc(doc(db, "ecoPoints", point.id));
      setSnackbar({ open: true, message: "Ponto removido com sucesso!" });
    } catch (err) {
      console.error("Erro ao remover:", err);
      setSnackbar({ open: true, message: "Erro ao remover o ponto." });
    }
  };

  return (
      <Router>
        <div className="app">
      <header className="app-header">
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
              <Link to="/login" className="btn-login">
                Entrar / Cadastrar
              </Link>
            )
          )}
        </nav>
      </header>

          <Routes>
            <Route path="/" element={
              <div className="main-container"> 
                <aside className="aside-form">
                  <AddPointForm
                    key={editingPoint ? editingPoint.id : "novo"}
                    onSave={handleSavePoint}
                    editingPoint={editingPoint}
                    onCancelEdit={() => setEditingPoint(null)}
                  />
                </aside>
              <main className="main-map">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Buscar pontos (ex: coleta, feira)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Todos os tipos</option>
                  <option value="coleta">Coleta Seletiva</option>
                  <option value="verde">Área Verde</option>
                  <option value="feira">Feira Orgânica</option>
                </select>
              </div>
              <div className="map-wrapper">
                {loading && (
                  <div className="map-loading">
                    <CircularProgress size={28} />
                    <span>Carregando pontos…</span>
                  </div>
                )}
                <MapView
                  points={filteredPoints}
                  user={user}
                  onEdit={setEditingPoint}
                  onDelete={handleDeletePoint}
                />
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