import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import PanelContent from './PanelContent/PanelContent';

const Panel = () => {
  const [open, setOpen] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    if (open) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open]);

  return (
    <div>
      <Button
        ref={buttonRef}
        variant="ghost"
        className="hover: size-10 rounded-xl bg-neutral-800 p-0.5 hover:bg-brand"
        onClick={() => setOpen(!open)}
      >
        <div className="size-full rounded-[0.625rem] bg-neutral-700 p-1">
          <img
            src={chrome.runtime.getURL('assets/icon.svg')}
            alt="icon"
            className="size-full"
          />
        </div>
      </Button>
      <div
        data-state={open ? 'open' : 'closed'}
        ref={panelRef}
        className="absolute right-[4.5rem] top-0 z-50 h-screen w-96 py-4 transition-opacity data-[state=closed]:pointer-events-none data-[state=open]:pointer-events-auto data-[state=closed]:opacity-0 data-[state=open]:opacity-100"
      >
        <PanelContent />
      </div>
    </div>
  );
};

export default Panel;
