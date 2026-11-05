import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function AddPointForm({ onSave, editingPoint = null, onCancelEdit }) {
  const { user } = useAuth();
  const [form, setForm] = useState(() => ({
    name: editingPoint?.name || "",
    type: editingPoint?.type || "coleta",
    description: editingPoint?.description || ""
  }));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Se o usuário não estiver logado, mostramos um aviso em vez do formulário
  if (!user) {
    return (
      <div style={{
        padding: "1.5rem",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        border: "1px dashed #ccc",
        textAlign: "center"
      }}>
        <h3>Quer contribuir?</h3>
        <p>Faça login para adicionar novos pontos sustentáveis no mapa.</p>
        <Link to="/login" style={{
          display: "inline-block",
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#4CAF50",
          color: "white",
          textDecoration: "none",
          borderRadius: "4px",
          fontWeight: "bold"
        }}>
          Ir para Login
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) {
      setError("Dê um nome ao local");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    // Em modo edição, mantemos a coordenada original do ponto
    if (editingPoint) {
      await onSave({ ...form, latitude: editingPoint.latitude, longitude: editingPoint.longitude });
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newPoint = {
          ...form,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        await onSave(newPoint);
        setForm({ name: "", type: "coleta", description: "" });
        setIsLoading(false);
      },
      (err) => {
        setError("Não foi possível acessar sua localização atual.");
        setIsLoading(false);
      }
    );
  };

  return (
    <div style={{
      padding: "1.5rem",
      backgroundColor: "#fff",
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ marginTop: 0 }}>{editingPoint ? "Editar Ponto" : "Novo Ponto"}</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
        
        <label>Nome do Local</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Ex: Ponto de Reciclagem"
          style={{ padding: "0.8rem", marginBottom: "1rem", borderRadius: "4px", border: "1px solid #ddd" }}
        />

        <label>Tipo</label>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          style={{ padding: "0.8rem", marginBottom: "1rem", borderRadius: "4px", border: "1px solid #ddd" }}
        >
          <option value="coleta">Coleta Seletiva</option>
          <option value="verde">Área Verde</option>
          <option value="feira">Feira Orgânica</option>
        </select>

        <label>Descrição</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="O que tem lá?"
          style={{ padding: "0.8rem", marginBottom: "1rem", borderRadius: "4px", border: "1px solid #ddd", minHeight: "80px" }}
        />

        {error && <p style={{ color: "red", fontSize: "0.9rem" }}>{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? "#ccc" : "#4CAF50",
            color: "white",
            padding: "1rem",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          {isLoading ? "Salvando..." : editingPoint ? "Salvar alterações" : "Marcar minha localização"}
        </button>

        {editingPoint && (
          <button
            type="button"
            onClick={onCancelEdit}
            style={{
              marginTop: "0.5rem",
              padding: "0.8rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              background: "transparent",
              color: "#666",
              cursor: "pointer"
            }}
          >
            Cancelar edição
          </button>
        )}
      </form>
    </div>
  );
}