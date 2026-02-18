// LIBRARIES
import { useId, useMemo, useState } from "react";

// STYLES
import "../styles/Accordion.css";

/**
 * GENERIC ACCORDION
 * [{id, title, content, meta?}]
 * 
 * Props:
 * - defaultAllOpen: boolean (default: false)
 * - singleOpen: boolean (default: false)
 * - onToggle: (id, nextIsOpen) => void
 * - renderRight: (item, isOpen) => ReactNode // (arrow + loading label, etc.)
 * - getHeaderState: (item) => {loading?: bool, loaded?: bool, progress?: number}
*/
export default function Accordion({
  items = [],
  defaultAllOpen = false,
  singleOpen = false,
  onToggle,
  renderRight,
  getHeaderState,
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

      let nextIsOpen = false;
      
      // SINGLE OPEN: TRUE
      if (singleOpen) {
        next.clear();
        if (!isOpen) {
          next.add(id);
          nextIsOpen = true;
        }
      } else {
        // SINGLE OPEN: FALSE
        if (isOpen) next.delete(id);
        else {
          next.add(id);
          nextIsOpen = true;
        }
      }

      if (onToggle) onToggle(id, nextIsOpen);
      return next;
    });
  }

  return (
    <div className="acc-root">
      {items.map((it, idx) => {
        const isOpen = openSet.has(it.id);
        const headerId = `${baseId}-h-${idx}`;
        const contentId = `${baseId}-c-${idx}`;

        const hs = getHeaderState ? getHeaderState(it) : {};
        const progress = Math.max(0, Math.min(100, hs?.progress ?? 0));
        const loading = !!hs?.loading;
        const loaded = !!hs?.loaded;


        // RENDER LEFT CONTENT + FILL
        return (
          <div className="acc-item" key={it.id}>
            <button
              type="button"
              className={[
                "acc-header",
                loading ? "is-loading" : "",
                loaded ? "is-loaded" : "",
              ].join(" ")}
              style={{
                // CSS variable for fill
                "--acc-fill": `${progress}%`,
              }}
              id={headerId}
              aria-controls={contentId}
              aria-expanded={isOpen}
              onClick={() => toggle(it.id)}
            >
              <span className="acc-title">{it.title}</span>

              {/* RENDER RIGHT CONTENT */}
              <span className="acc-right">
                {renderRight ? (
                  renderRight(it, isOpen)
                ) : (
                  <span className="acc-icon" aria-hidden="true">
                    {isOpen ? "▲" : "▼"}
                  </span>
                )}
              </span>
            </button>
            
            {/* RENDER CONTENT */}
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
