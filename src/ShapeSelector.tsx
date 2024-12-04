import React from 'react';

interface ShapeSelectorProps {
  onShapeChange: (shape: string) => void;
}

const ShapeSelector: React.FC<ShapeSelectorProps> = ({ onShapeChange }) => {
  return (
    <div style={{ padding: '10px', backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
      <h3>Choisir la forme de la pierre</h3>
      <select onChange={(e) => onShapeChange(e.target.value)} defaultValue="cube">
        <option value="cube">Cube</option>
        <option value="sphere">Rond</option>
        <option value="cylinder">Ovale</option>
        <option value="tetrahedron">Triangle</option>
        <option value="octahedron">Octaèdre</option>
        <option value="marquise">Marquise</option>
        <option value="pear">Poire</option>
      </select>
    </div>
  );
};

export default ShapeSelector;
