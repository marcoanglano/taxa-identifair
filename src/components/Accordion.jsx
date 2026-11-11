// ##### IMPORTS #####
// LIB
import { useId, useMemo, useState } from "react";


// ##### CONTENT & PROPS #####
export default function Accordion({
  items = [],               // Content: [{id, title, content, meta?}]
  // Props
  defaultAllOpen = false,   // All open when loading page
  singleOpen = false,       // Only one open at a time
  onToggle,                 // When an accordion is opened or closed
  renderRight,              // Arrow on the right of the header
}) {
  const baseId = useId();

  // ### defaultAllOpen ###
  const initialOpenState = useMemo(() => {
    if (defaultAllOpen) return new Set(items.map((it) => it.id));
    return new Set();
  }, [defaultAllOpen, items]);
  const [openSet, setOpenSet] = useState(initialOpenState);

  // ### singleOpen, onToggle ###
  function toggle(id) {
    setOpenSet((prev) => {
      const next = new Set(prev);
      const isOpen = next.has(id);
      let nextIsOpen = false;
      
      // # singleOpen = true #
      if (singleOpen) {
        next.clear();
        if (!isOpen) {
          next.add(id);
          nextIsOpen = true;
        }
      // # singleOpen = false #
      } else {
        if (isOpen) next.delete(id);
        else {
          next.add(id);
          nextIsOpen = true;
        }
      }
      // # onToggle #
      if (onToggle) onToggle(id, nextIsOpen);
      return next;
    });
  }


  // ##### RENDERING #####
  return (
    <div className="acc-root">
      {items.map((it, idx) => {
        const isOpen = openSet.has(it.id);
        const headerId = `${baseId}-h-${idx}`;
        const contentId = `${baseId}-c-${idx}`;

        // ### Header + Progress Bar ###
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
              <h5 className="acc-h-text">{it.title}</h5>

              {/* ### Right arrow on the header ### */}
              <span className="acc-h-text">
                {renderRight ? (
                  renderRight(it, isOpen)
                ) : (
                  <h5 aria-hidden="true">
                    {isOpen ? "▲" : "▼"}
                  </h5>
                )}
              </span>
            </button>
            
            {/* ### Content ### */}
            <div
              id={contentId}
              role="region"
              aria-labelledby={headerId}
              hidden={!isOpen}
            >
              <div className="acc-content">{it.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
