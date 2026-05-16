import React from 'react';
const StatCard = ({ label, value, tone }) => {
  return (
    <div className={`stat-card ${tone || ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
};

export default StatCard;
