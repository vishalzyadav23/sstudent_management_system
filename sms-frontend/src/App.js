import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import StudentList from './components/StudentList';
import AddStudent from './components/AddStudent';
import EditStudent from './components/EditStudent';
import './App.css'; // <-- Bringing in the magic paint!

function App() {
  return (
    <Router>
      <div className="dashboard-container">
        
        {/* Navigation Bar */}
        <nav className="navbar">
          <h1>Student Management System</h1>
          <div className="nav-links">
            <Link to="/">Dashboard</Link>
            <Link to="/add">+ Add Student</Link>
          </div>
        </nav>

        {/* The Routes */}
        <Routes>
          <Route path="/" element={<StudentList />} />
          <Route path="/add" element={<AddStudent />} />
          <Route path="/edit/:id" element={<EditStudent />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;