import React, { useState, useEffect } from 'react';

function ProgressAnalytics({ user }) {
  const [analyticsData, setAnalyticsData] = useState({
    modulesUploaded: 0,
    modulesSaved: 0,
    discussionsParticipated: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user || !user.uid) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://localhost:5000/api/analytics/${user.uid}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch analytics.');
        }
        const data = await response.json();
        setAnalyticsData(data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError(err.message || 'Could not load analytics data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (!user) {
    return <p>Please log in to view analytics.</p>;
  }

  if (loading) {
    return (
      <div className="analytics-panel">
        <h4>Your Progress Analytics</h4>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-panel">
        <h4>Your Progress Analytics</h4>
        <p className="error-message">Error: {error}</p>
        <p>Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="analytics-panel">
      <h4>Your Progress Analytics</h4>
      <p>This section shows your activity:</p>
      <ul>
        <li style={{color: 'green'}}><strong>Modules Uploaded:</strong> {analyticsData.modulesUploaded}</li>
        <li style={{color: 'green'}}><strong>Modules Saved:</strong> {analyticsData.modulesSaved}</li>
        {/* <li style={{color: 'green'}}><strong>Discussions Participated:</strong> {analyticsData.discussionsParticipated}</li> */}
      </ul>
      <p>More detailed analytics will be implemented here later.</p>
    </div>
  );
}

export default ProgressAnalytics;