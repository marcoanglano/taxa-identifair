// LIBRARIES
import { useId, useMemo, useState } from "react";

// STYLES
import "../styles/Accordion.css";

/**
 * GENERIC ACCORDION
 * [{id: string|number, title: ReactNode, content: ReactNode}]
 * 
 * Props:
 * - defaultAllOpen: boolean (default: false)
 * - singleOpen: boolean (default: false)
*/
export default function Accordion({
  items = [],
  defaultAllOpen = false,
  singleOpen = false
}) {
  const baseId = useId();

  // INITIAL STATE: all open if defaultAllOpen is true, otherwise all closed
  const initialOpenState = useMemo(() => {
    if (defaultAllOpen) return new Set(items.map((it) => it.id));
    return new Set();
  }, [defaultAllOpen, items]);

  const [openSet, setOpenSet] = useState(initialOpenState);

  function toggle(id) {
    setOpenSet((prev) => {
      const next = new Set(prev);
      const isOpen = next.has(id);
      
      // SINGLE OPEN: TRUE
      if (singleOpen) {
        next.clear();
        if (!isOpen) next.add(id);
        return next;
      }

      // SINGLE OPEN: FALSE
      if (isOpen) next.delete(id);
      else next.add(id);

      return next;
    });
  }

  return (
    <div className="acc-root">
      {items.map((it, idx) => {
        const isOpen = openSet.has(it.id);
        const headerId = `${baseId}-h-${idx}`;
        const contentId = `${baseId}-c-${idx}`;

        return (
          <div className="acc-item" key={it.id}>
            <button
              type="button"
              className="acc-header"
              id={headerId}
              aria-controls={contentId}
              aria-expanded={isOpen}
              onClick={() => toggle(it.id)}
            >
              <span className="acc-title">{it.title}</span>
              <span className="acc-icon" aria-hidden="true">
                {isOpen ? "▲" : "▼"}
              </span>
            </button>

            <div
              className="acc-content"
              id={contentId}
              role="region"
              aria-labelledby={headerId}
              hidden={!isOpen}
            >
              <div className="acc-content-inner">{it.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
