import type { CSSProperties, ReactNode } from "react";

interface ModalOverlayProps {
  onClose: () => void;
  children: ReactNode;
  /** Overrides for the white content card (padding, borders, etc). */
  contentStyle?: CSSProperties;
}

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const contentBaseStyle: CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 24,
  minWidth: 350,
  maxWidth: "95vw",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
};

/** Shared fixed-position modal shell used by the maintenance/registration pages. */
function ModalOverlay({ onClose, children, contentStyle }: ModalOverlayProps) {
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div
        style={{ ...contentBaseStyle, ...contentStyle }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default ModalOverlay;
