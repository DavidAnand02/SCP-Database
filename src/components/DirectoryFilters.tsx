import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

export const CollapsibleFilter = ({ 
  label, 
  children, 
  isOpen: externalIsOpen, 
  onToggle 
}: { 
  label: string, 
  children: React.ReactNode, 
  isOpen?: boolean,
  onToggle?: () => void
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const toggle = onToggle || (() => setInternalIsOpen(!internalIsOpen));
  
  return (
    <div className="space-y-2">
      <button 
        onClick={toggle}
        className="w-full flex items-center justify-between text-xs font-mono text-foundation-muted uppercase tracking-widest hover:text-white transition-colors group"
      >
        <span>{label}</span>
        <ChevronRight className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''} group-hover:text-foundation-accent`} />
      </button>
      {isOpen && (
        <div className="space-y-4 pt-2 pl-2 border-l border-white/5 ml-1">
          {children}
        </div>
      )}
    </div>
  );
};

export const FilterGroup = ({ label, options, current, onChange }: { label: string, options: string[], current: string, onChange: (val: string) => void }) => (
  <div className="space-y-2">
    <label className="text-[11px] font-mono text-foundation-muted uppercase">{label}</label>
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt, idx) => (
        <button 
          key={`${label}-${opt}-${idx}`}
          onClick={() => onChange(opt)}
          className={`px-1.5 py-0.5 rounded-sm text-[10px] font-mono uppercase border transition-all ${current === opt ? 'bg-foundation-accent/20 border-foundation-accent text-foundation-accent' : 'bg-white/5 border-foundation-border text-foundation-muted hover:border-foundation-muted'}`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);
