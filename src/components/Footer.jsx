import React from 'react';
import packageJson from '../../package.json';

export default function Footer() {
  const linkStyle = {
    transition: 'color 0.2s',
  };

  const handleLinkHover = (e, isEntering) => {
    e.target.style.color = isEntering ? '#ffc107' : 'white';
  };

  return (
    <footer
      className="text-white"
      style={{ backgroundColor: 'var(--header-bg)', padding: '0.75rem 0' }}
    >
      <div className="container mx-auto px-4">
        <p className="content mb-0 text-center">
          <a
            href="https://github.com/dialex/fnf-companion"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white text-decoration-none"
            style={linkStyle}
            onMouseEnter={(e) => handleLinkHover(e, true)}
            onMouseLeave={(e) => handleLinkHover(e, false)}
          >
            v{packageJson.version}
          </a>
          {' • '}
          <a
            href="https://diogonunes.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white text-decoration-none"
            style={linkStyle}
            onMouseEnter={(e) => handleLinkHover(e, true)}
            onMouseLeave={(e) => handleLinkHover(e, false)}
          >
            Diogo Nunes
          </a>
        </p>
      </div>
    </footer>
  );
}
