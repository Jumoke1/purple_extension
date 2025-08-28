import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function ClientComplaint() {
  const { complain_id } = useParams();
  const [complaint, setComplaint] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const response = await fetch(`http://localhost:5002/complaints`);
        
        if (!response.ok) {
          throw new Error(`Complaint not found (status: ${response.status})`);
        }
        
        const data = await response.json();
        setComplaint(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, []);

  if (loading) return <p>Loading complaint...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!complaint) return <p>No complaint found.</p>;

  return (
    <div>
      <h2 className="font-semibold text-2xl mb-4">All Complaints</h2>
      {complaint.map((complaints) => (
        <div key={complaint.id} style={{ marginBottom: "1rem" }}>
          <p><strong>Name:</strong> {complaints.name}</p>
          <p><strong>Email:</strong> {complaints.email}</p>
          <p><strong>Subject:</strong> {complaints.subject}</p>
          <p><strong>Message:</strong> {complaints.message}</p>
        </div>
      ))}
    </div>
  );
}

export default ClientComplaint;
