import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import './App.css';
import LoginScreen from './screens/LoginScreen';
import ExamList from './screens/ExamList';
import ExamDetail from './screens/ExamDetail';
import Bookmarks from './screens/Bookmarks';
import RemindersScreen from './screens/RemindersScreen';
import AdminPanel from './screens/AdminPanel';
import Header from './components/header';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

const AppContent = () => {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '24px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <>
      <Header user={user} />
      <Routes>
        <Route path='/' element={<ExamList />} />
        <Route path='/login' element={user ? <Navigate to="/exams" /> : <LoginScreen />} />
        <Route
          path='/exams'
          element={<ExamList />}
        />
        <Route
          path='/exam/:id'
          element={<ExamDetail />}
        />
        <Route
          path='/bookmarks'
          element={user ? <Bookmarks /> : <Navigate to="/" />}
        />
        <Route
          path='/reminders'
          element={user ? <RemindersScreen /> : <Navigate to="/" />}
        />
        <Route
          path='/admin'
          element={user ? <AdminPanel /> : <Navigate to="/" />}
        />
      </Routes>
    </>
  );
};

export default App;
