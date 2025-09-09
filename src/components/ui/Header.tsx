import { useState, useEffect } from 'react';

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title = "ASD" }) => {
  const [shouldFade, setShouldFade] = useState(false);

  useEffect(() => {
    // Start fade-out after 3 seconds
    const fadeTimeout = setTimeout(() => {
      setShouldFade(true);
    }, 3000);

    return () => clearTimeout(fadeTimeout);
  }, []);

  return (
    <div className={`header-container ${shouldFade ? 'fade-out' : ''}`}>
      <h1 className="header-title">{title}</h1>
      <p className="header-instructions">
        Type to search • Tab/Arrow to navigate • Enter to open • Esc to clear
      </p>
    </div>
  );
};