'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { C } from '../lib/content';

const NAV_ITEMS = [
  { href: '/linear-algebra', label: 'Linear Algebra' },
  { href: '/calculus-optimization', label: 'Calculus & Optimization' },
  { href: '/probability-statistics', label: 'Probability & Statistics' },
  { href: '/ml', label: 'Machine Learning' }
];

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef(null);

  // Filter algorithms for search
  const filteredAlgos = React.useMemo(() => {
    if (!query.trim()) return C;
    const q = query.toLowerCase();
    return C.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.tag.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        c.task.toLowerCase().includes(q)
    );
  }, [query]);

  // Keyboard shortcut: Cmd+K or / to open search
  useEffect(() => {
    const handleKeyDown = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      } else if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [searchOpen]);

  // Handle arrow key navigation in search modal
  const handleSearchKeyNavigation = e => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredAlgos.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredAlgos[selectedIndex]) {
      e.preventDefault();
      router.push(`/ml/${filteredAlgos[selectedIndex].slug}`);
      setSearchOpen(false);
    }
  };

  return (
    <>
      <header className="global-nav-bar">
        <div className="global-nav-inner">
          {/* 1. Left: Brand Logo (Centered, Prominent) */}
          <Link href="/" className="nav-brand-link" aria-label="Atlas Home" title="Atlas Home">
            <img src="/logo-light.png" alt="Atlas" className="nav-brand-logo light-only" width="53" height="34" />
            <img src="/logo-dark.png" alt="Atlas" className="nav-brand-logo dark-only" width="53" height="34" />
          </Link>

          {/* 2. Middle: Navigation Tabs */}
          <nav className="nav-categories" aria-label="Subject Areas">
            {NAV_ITEMS.map(item => {
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-category-link ${isActive ? 'active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                  {isActive && <span className="nav-active-indicator" />}
                </Link>
              );
            })}
          </nav>

          {/* 3. Right: Utility Controls (Theme Toggle, Search, GitHub) with Circular Outlines */}
          <div className="nav-actions">
            <ThemeToggle />

            {/* Quick Search Button */}
            <button
              className="nav-action-circle search-trigger"
              onClick={() => setSearchOpen(true)}
              aria-label="Search algorithms (Press ⌘K or /)"
              title="Search (⌘K)"
            >
              <svg viewBox="0 0 24 24" width="13.5" height="13.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.5" y2="16.5" />
              </svg>
            </button>

            {/* GitHub Repository Link */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-action-circle github-link"
              aria-label="GitHub Repository"
              title="GitHub"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Global Quick Search Dialog */}
      {searchOpen && (
        <div className="search-modal-backdrop" onClick={() => setSearchOpen(false)}>
          <div className="search-modal-card" onClick={e => e.stopPropagation()}>
            <div className="search-modal-input-row">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="search-input-icon">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search algorithms, concepts, math..."
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleSearchKeyNavigation}
                className="search-input"
              />
              <span className="search-esc-hint" onClick={() => setSearchOpen(false)}>ESC</span>
            </div>

            <div className="search-results-list">
              {filteredAlgos.length === 0 ? (
                <div className="search-no-results">No algorithms found for &ldquo;{query}&rdquo;</div>
              ) : (
                filteredAlgos.map((item, idx) => (
                  <Link
                    key={item.slug}
                    href={`/ml/${item.slug}`}
                    className={`search-result-row ${idx === selectedIndex ? 'selected' : ''}`}
                    onClick={() => setSearchOpen(false)}
                  >
                    <div className="search-result-meta">
                      <span className="search-result-name">{item.name}</span>
                      <span className="search-result-tag">{item.tag}</span>
                    </div>
                    <span className="search-result-badge">{item.type}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
