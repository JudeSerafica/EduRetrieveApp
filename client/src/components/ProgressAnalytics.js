function ProgressAnalytics({ user }) {
  if (!user) return <p>Please log in to view analytics.</p>;

  return (
    <div className="analytics-panel">
      <h4>Your Progress Analytics</h4>
      <p>This section will show your activity, such as:</p>
      <ul>
        <li><strong>Modules Uploaded:</strong> 0 (Placeholder)</li>
        <li><strong>Modules Saved:</strong> 0 (Placeholder)</li>
        <li><strong>Discussions Participated:</strong> 0 (Placeholder)</li>
      </ul>
      <p>More detailed analytics will be implemented here later.</p>
    </div>
  );
}

export default ProgressAnalytics;