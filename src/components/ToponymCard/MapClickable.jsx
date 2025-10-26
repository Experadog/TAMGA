'use client';

export default function MapClickable({ children }) {
  const handleMapClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <div onClick={handleMapClick}>
      {children}
    </div>
  );
}