# 🌱 EcoMap – Mapa Colaborativo de Sustentabilidade Urbana

> Mapeando um mundo mais sustentável.

**EcoMap** é uma plataforma web colaborativa para mapear pontos sustentáveis da cidade: coleta seletiva, áreas verdes e feiras orgânicas. Qualquer pessoa pode navegar pelo mapa; usuários cadastrados contribuem com novos pontos usando a geolocalização do próprio dispositivo — e todos os dados são atualizados em tempo real.

O projeto foi desenvolvido no âmbito de uma atividade extensionista (AE-I/II), aplicado ao bairro Pedreira, Guarujá/SP, alinhado aos **ODS 11** (Cidades e Comunidades Sustentáveis) e **12** (Consumo e Produção Responsáveis).

## ✨ Funcionalidades

- 🗺️ Mapa interativo (Leaflet + OpenStreetMap) centralizado na localização do usuário
- 📍 Cadastro de pontos pela geolocalização atual: nome, tipo e descrição
- 🎨 Marcadores coloridos por categoria:

  | Categoria | Cor do marcador |
  | --- | --- |
  | Coleta Seletiva | 🟢 Verde |
  | Área Verde | 🟣 Violeta |
  | Feira Orgânica | 🟠 Laranja |

- 🔎 Busca/filtro de pontos por nome
- ⚡ **Tempo real**: novos pontos aparecem instantaneamente no mapa de todos os usuários (`onSnapshot` do Firestore)
- 🔐 Criação de conta e login com e-mail/senha (Firebase Authentication) — apenas usuários logados podem adicionar pontos; convidados podem navegar pelo mapa
- ✅ Mensagens de erro amigáveis em português (e-mail inválido, senha incorreta, etc.)

## 🛠️ Stack tecnológica

| Camada | Tecnologia |
| --- | --- |
| Frontend | React 19 (Create React App) |
| Mapa | Leaflet + react-leaflet (tiles OpenStreetMap) |
| Componentes de UI | MUI (Material UI) v7 |
| Banco de dados | Firebase Firestore (tempo real) |
| Autenticação | Firebase Authentication (e-mail/senha) |
| Roteamento | React Router v7 |

## 🚀 Como rodar localmente

### Pré-requisitos

- Node.js 18+ e npm
- Um projeto no Firebase com **Authentication** (e-mail/senha) e **Firestore Database** habilitados

### Passos

```bash
# 1. Instale as dependências
npm install

# 2. Crie o arquivo .env na raiz do projeto (veja "Variáveis de ambiente")

# 3. Rode em modo desenvolvimento
npm start
# → http://localhost:3000

# Build de produção (gerado na pasta build/)
npm run build
```

## 🔐 Variáveis de ambiente

As chaves do Firebase **não estão escritas no código** — são lidas de variáveis de ambiente em tempo de build. Crie um arquivo `.env` na raiz do projeto (ele já está no `.gitignore`, então nunca o commite):

```env
REACT_APP_FIREBASE_API_KEY=<sua_api_key>
REACT_APP_FIREBASE_AUTH_DOMAIN=<seu_projeto>.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=<id_do_seu_projeto>
REACT_APP_FIREBASE_STORAGE_BUCKET=<bucket_do_seu_projeto>
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=<sender_id>
REACT_APP_FIREBASE_APP_ID=<app_id>
```

Todos os valores estão disponíveis em **Firebase Console → Project settings**.

## 📁 Estrutura do projeto

```
src/
├── App.js                 # Rotas, busca e estado dos pontos
├── firebase.js            # Inicialização do Firebase (Auth + Firestore) e coleção ecoPoints
├── index.js               # Entry point
├── index.css              # Estilos e layout
├── components/
│   ├── AddPointForm.jsx   # Formulário de novo ponto (geolocalização)
│   ├── Login.jsx          # Login e cadastro (e-mail/senha)
│   └── MapView.jsx        # Mapa Leaflet com marcadores e popups
└── contexts/
    └── AuthContext.jsx    # Sessão do usuário (useAuth / logout)
```

## 🧭 Como usar

1. Acesse a aplicação (`http://localhost:3000` em desenvolvimento);
2. Clique em **Entrar / Cadastrar** e crie sua conta com e-mail/senha;
3. No formulário **Novo Ponto**, preencha o nome, selecione o tipo (Coleta Seletiva, Área Verde ou Feira Orgânica), adicione uma descrição e clique em **Marcar minha localização** — o navegador pedirá permissão de geolocalização;
4. O ponto é salvo no Firestore e aparece no mapa — e também no mapa dos demais usuários, em tempo real;
5. Use a barra de busca acima do mapa para filtrar pontos por nome.
