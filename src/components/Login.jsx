import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase'; // Verifique se o caminho do firebase está correto aqui
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { Button, TextField, Snackbar, Alert } from '@mui/material';

export default function Login() {
  const navigate = useNavigate();
  
  // Estados do formulário
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [isLogin, setIsLogin] = useState(true); // Alternar entre Login e Cadastro
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpa erros anteriores
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, pass);
      } else {
        await createUserWithEmailAndPassword(auth, email, pass);
      }
      // Se der certo, redireciona o usuário para a Home ou para Adicionar Ponto
      navigate('/'); 
    } catch (err) {
      console.error(err);
      // Tratamento básico de erros do Firebase em português
      if (err.code === 'auth/invalid-email') setError('E-mail inválido.');
      else if (err.code === 'auth/wrong-password') setError('Senha incorreta.');
      else if (err.code === 'auth/email-already-in-use') setError('E-mail já cadastrado.');
      else if (err.code === 'auth/weak-password') setError('A senha deve ter pelo menos 6 caracteres.');
      else setError('Ocorreu um erro ao tentar entrar. Tente novamente.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      textAlign: 'center',
      padding: '1rem'
    }}>
      <h1 style={{ color: '#4CAF50', marginBottom: '1rem' }}>
        {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}
      </h1>
      
      <p style={{ color: '#555', marginBottom: '2rem' }}>
        {isLogin ? 'Faça login para continuar' : 'Preencha os dados abaixo'}
      </p>

      <form onSubmit={handleSubmit} style={{ 
        width: '100%', 
        maxWidth: '350px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem' 
      }}>
        
        {/* Campo de E-mail */}
        <TextField
          label="E-mail"
          variant="outlined"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          style={{ backgroundColor: 'white' }}
        />

        {/* Campo de Senha */}
        <TextField
          label="Senha"
          variant="outlined"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          required
          fullWidth
          style={{ backgroundColor: 'white' }}
        />

        {/* Botão de Ação */}
        <Button 
          type="submit" 
          variant="contained" 
          color="success" 
          size="large"
          style={{ padding: '0.8rem', marginTop: '0.5rem' }}
        >
          {isLogin ? 'Entrar' : 'Cadastrar'}
        </Button>

        {/* Mensagem de Erro (se houver) */}
        {error && (
          <Alert severity="error" style={{ marginTop: '0.5rem' }}>
            {error}
          </Alert>
        )}
      </form>

      {/* Botão para alternar entre Login e Cadastro */}
      <Button 
        onClick={() => setIsLogin(!isLogin)} 
        style={{ marginTop: '1.5rem', textTransform: 'none' }}
      >
        {isLogin 
          ? "Não tem conta? Clique aqui para cadastrar" 
          : "Já tem conta? Clique aqui para entrar"}
      </Button>

      <p style={{ marginTop: '2rem', color: '#777' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#666' }}>
          ← Voltar para o mapa
        </Link>
      </p>
    </div>
  );
}