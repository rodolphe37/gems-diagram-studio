import React from 'react';

interface ControlPanelProps {
  angles: { x: number; y: number; z: number };
  onAngleChange: (axis: string, value: number) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ angles, onAngleChange }) => {
  return (
    <div style={{ padding: '10px', backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', zIndex: 1 }}>
      <h3>Contrôles des angles de facettes</h3>
      <div>
        <label>X: {angles.x.toFixed(2)}°</label>
        <input
          type="range"
          min="-90"
          max="90"
          value={angles.x}
          onChange={(e) => onAngleChange('x', parseFloat(e.target.value))}
        />
      </div>
      <div>
        <label>Y: {angles.y.toFixed(2)}°</label>
        <input
          type="range"
          min="-90"
          max="90"
          value={angles.y}
          onChange={(e) => onAngleChange('y', parseFloat(e.target.value))}
        />
      </div>
      <div>
        <label>Z: {angles.z.toFixed(2)}°</label>
        <input
          type="range"
          min="-90"
          max="90"
          value={angles.z}
          onChange={(e) => onAngleChange('z', parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
};

export default ControlPanel;
