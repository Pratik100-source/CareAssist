import React, { useState, useEffect } from 'react';
import './displayprofessional.css';

const DisplayProfessional = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [professionalData, setProfessionalsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewClicked, setViewClicked] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState(null);

  useEffect(() => {
    const fetchProfessional = async () => {
      try {
        const response = await fetch('http://localhost:3003/api/display/getprofessional');
        if (!response.ok) {
          throw new Error('Failed to fetch professional data');
        }
        const data = await response.json();
        setProfessionalsData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfessional();
  }, []);

  const handleViewClick = (professional) => {
    setSelectedProfessional(professional);
    setViewClicked(true);
  };

  const handleModalClose = () => {
    setViewClicked(false);
    setSelectedProfessional(null);
  };

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const filteredProfessional = professionalData.filter(professional =>
    professional.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="professionals">
      <h2>Verified Professionals</h2>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Number</th>
            <th>Status</th>
            <th>Documents</th>
          </tr>
        </thead>
        <tbody>
          {filteredProfessional.map(professional => (
            <tr key={professional.id}>
              <td>{professional.name}</td>
              <td>{professional.email}</td>
              <td>{professional.number}</td>
              <td>{professional.status ? "Verified" : "Non-verified"}</td>
              <td>
                <div className='document_view' onClick={() => handleViewClick(professional)}>View</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedProfessional && viewClicked && (
        <div className="modal-overlay-view">
          <div className="selected-professional">
            <button className="close-button" onClick={handleModalClose}>&times;</button>
            <div className="professional-photo">
              {selectedProfessional.document?.photoUrl ? (
                <>
                  <img src={selectedProfessional.document.photoUrl} alt="Professional Photo" />
                  <button className="download-button" onClick={() => handleDownload(selectedProfessional.document.photoUrl, `${selectedProfessional.name}_photo.jpg`)}>
                    Download Photo
                  </button>
                </>
              ) : (
                <p>No photo available</p>
              )}
            </div>
            <div className="professional-document">
              {selectedProfessional.document?.documentUrl ? (
                <>
                  <img src={selectedProfessional.document.documentUrl} alt="Professional Document" />
                  <button className="download-button" onClick={() => handleDownload(selectedProfessional.document.documentUrl, `${selectedProfessional.name}_document.jpg`)}>
                    Download Document
                  </button>
                </>
              ) : (
                <p>No document available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayProfessional;
