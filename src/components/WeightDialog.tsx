import { useState, useEffect, useRef } from 'react';

interface WeightDialogProps {
  open: boolean;
  fromLabel: string;
  toLabel: string;
  onSubmit: (weight: number) => void;
  onCancel: () => void;
}

export default function WeightDialog({ open, fromLabel, toLabel, onSubmit, onCancel }: WeightDialogProps) {
  const [weight, setWeight] = useState('1');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setWeight('1');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, fromLabel, toLabel]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseInt(weight, 10);
    if (!isNaN(w) && w > 0) {
      onSubmit(w);
    }
  };

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <h3 className="dialog-title">Peso del arco</h3>
        <p className="dialog-desc">
          {fromLabel} → {toLabel}
        </p>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            className="dialog-input"
            type="number"
            min="1"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder="Peso..."
          />
          <div className="dialog-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Aceptar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
