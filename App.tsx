
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import PatientView from './components/PatientView';
import Header from './components/Header';
import MainLayout from './components/MainLayout';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />
      <main>
        <HashRouter>
          <Routes>
            <Route path="/workspace" element={<MainLayout />} />
            <Route path="/patient/:data" element={<PatientView />} />
            <Route path="*" element={<Navigate to="/workspace" />} />
          </Routes>
        </HashRouter>
      </main>
    </div>
  );
};

export default App;
