//navigate to README.md for instructions

import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import axios from 'axios';
import QRCode from 'qrcode.react';
import jsPDF from 'jspdf';
import { FaLock, FaBars } from 'react-icons/fa';
import './App.css';

function encodePassword(password) {
  return btoa(password);
}

function decodePassword(encodedPassword) {
  return atob(encodedPassword);
}

function App() {
  const [passwords, setPasswords] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [newSite, setNewSite] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [csvData, setCSVData] = useState([]);

  useEffect(() => {
    fetchPasswords();
  }, []);

  const fetchPasswords = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/passwords');
      setPasswords(response.data);
    } catch (error) {
      console.error('Error fetching passwords:', error);
    }
  };

  const handleAddEntry = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/passwords', {
        site: newSite,
        password: encodePassword(newPassword)
      });
      setPasswords(prevPasswords => [...prevPasswords, response.data]);
      setNewSite('');
      setNewPassword('');
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  };

  const handleDeletePassword = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/passwords/${id}`);
      setPasswords(prevPasswords => prevPasswords.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Error deleting password:', error);
    }
  };

  const handleGenerateQRCode = (index) => {
    const newPasswords = [...passwords];
    newPasswords[index].showQRCode = !newPasswords[index].showQRCode;
    setPasswords(newPasswords);
  };

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    passwords.forEach((entry, index) => {
      doc.text(`${entry.site}: ${decodePassword(entry.password)}`, 10, 10 + (index * 10));
    });
    doc.save('passwords.pdf');
  };

  const handleViewPassword = (index) => {
    const newPasswords = [...passwords];
    newPasswords[index].visible = !newPasswords[index].visible;
    setPasswords(newPasswords);
  };

  const handleCreateCSV = () => {
    const csvContent = passwords.map(entry => `${entry.site},${entry.password}`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'passwords.csv');
    document.body.appendChild(link);
    link.click();
  };

  const handleReadCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (result) => {
        const newData = result.data.slice(1).map(row => ({
          site: row[0],
          password: encodePassword(row[1]),
          visible: false,
          showQRCode: false,
        }));
        setCSVData(result.data);
      }
    });
  };

  return (
    <div className="container">
      <nav className="navbar">
        <div className="navbar-title">
          <FaLock /> Code Vault
        </div>
        <div className="navbar-burger" onClick={() => setMenuOpen(!menuOpen)}>
          <FaBars />
        </div>
        {menuOpen && (
          <div className="dropdown-menu">
            <button className="menu-button" onClick={handleGeneratePDF}>Generate PDF</button>
            <button className="menu-button" onClick={handleCreateCSV}>Create CSV</button>
            <label className="menu-button">
              <input type="file" accept=".csv" onChange={handleReadCSV} style={{ display: 'none' }} />
              Read CSV
            </label>
          </div>
        )}
      </nav>

      <div className="content">
        <div className="entry-form">
          <h2>Add New Entry</h2>
          <input
            type="text"
            placeholder="Site"
            value={newSite}
            onChange={(e) => setNewSite(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button onClick={handleAddEntry}>Add Entry</button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Site</th>
                <th className="password-header">Password</th>
                <th className="actions-header">Actions</th>
                <th className="qr-code-header">QR Code</th>
              </tr>
            </thead>
            <tbody>
              {passwords.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.site}</td>
                  <td className="password-cell">{entry.visible ? decodePassword(entry.password) : '********'}</td>
                  <td className="actions-cell">
                    <div className="button-container">
                      <button className="view-button" onClick={() => handleViewPassword(index)}>
                        {entry.visible ? 'Hide' : 'View'}
                      </button>
                      <button className="view-button" onClick={() => handleGenerateQRCode(index)}>
                        {entry.showQRCode ? 'Hide QR Code' : 'Show QR Code'}
                      </button>
                      <button className="delete-button" onClick={() => handleDeletePassword(entry.id)}>Delete</button>
                    </div>
                  </td>
                  <td className="qr-code-cell">
                    {entry.showQRCode && (
                      <QRCode value={`${entry.site}, ${decodePassword(entry.password)}`} size={64} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Container for displaying CSV file contents */}
          <div className="file-contents-container">
            <h2>CSV File Contents:</h2>
            <ul>
              {csvData.map((row, index) => (
                <li key={index}>{JSON.stringify(row)}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
