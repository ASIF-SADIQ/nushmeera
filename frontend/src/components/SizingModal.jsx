import React, { useContext } from 'react';
import { ProductContext } from '../context/ProductContext';

export default function SizingModal() {
  const { showSizingModal, setShowSizingModal } = useContext(ProductContext);

  if (!showSizingModal) return null;

  return (
    <div className={`modal-overlay ${showSizingModal ? 'active' : ''}`} onClick={() => setShowSizingModal(false)}>
      <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">📐 Nushmeera Clothes Size Guide</h3>
          <button className="modal-close-btn" onClick={() => setShowSizingModal(false)}>×</button>
        </div>
        <div className="modal-body">
          <p style={{ marginBottom: '15px', fontSize: '0.85rem' }}>
            All measurements are in inches. Standard fit measurements:
          </p>
          <table className="size-chart-table">
            <thead>
              <tr>
                <th>Size</th>
                <th>Chest</th>
                <th>Length</th>
                <th>Hips</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Small</td>
                <td>19"</td>
                <td>38"</td>
                <td>20"</td>
              </tr>
              <tr>
                <td>Medium</td>
                <td>20.5"</td>
                <td>39"</td>
                <td>22"</td>
              </tr>
              <tr>
                <td>Large</td>
                <td>22"</td>
                <td>40"</td>
                <td>24"</td>
              </tr>
              <tr>
                <td>Extra Large</td>
                <td>23.5"</td>
                <td>41"</td>
                <td>26"</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
