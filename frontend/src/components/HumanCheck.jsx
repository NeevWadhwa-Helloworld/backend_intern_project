import React from 'react';
import { ShieldCheck } from 'lucide-react';

const HumanCheck = ({ checked, onChange, honeypotValue, onHoneypotChange }) => {
  return (
    <div className="human-check">
      <label className="human-check-label">
        <input
          type="checkbox"
          className="human-check-input"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <ShieldCheck size={18} className="human-check-icon" />
        <span>I am human</span>
      </label>

      {/* Honeypot — hidden from users, often filled by bots */}
      <input
        type="text"
        name="website"
        value={honeypotValue}
        onChange={(e) => onHoneypotChange(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="human-check-honeypot"
      />
    </div>
  );
};

export default HumanCheck;
