'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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

// Helper to highlight matching text in search results
function highlightMatch(text, query) {
  if (!query || !query.trim()) return text;
  const q = query.trim().toLowerCase();
  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return text;

  return (
    <>
      {text.slice(0, idx)}
      <mark className="search-match-mark">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'Supervised' | 'Unsupervised'
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef(null);
  const selectedItemRef = useRef(null);

  // Counts for category badges
  const supervisedCount = useMemo(() => C.filter(c => c.type === 'Supervised').length, []);
  const unsupervisedCount = useMemo(() => C.filter(c => c.type === 'Unsupervised').length, []);

  // Filter algorithms for search
  const filteredAlgos = useMemo(() => {
    let list = C;
    if (categoryFilter !== 'all') {
      list = list.filter(c => c.type === categoryFilter);
    }
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.tag.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        c.task.toLowerCase().includes(q)
    );
  }, [query, categoryFilter]);

  // Keep selected index valid when filtered list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredAlgos.length, categoryFilter]);

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

  // Focus input and reset on open
  useEffect(() => {
    let timer;
    if (searchOpen) {
      timer = setTimeout(() => searchInputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      setCategoryFilter('all');
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [searchOpen]);

  // Auto-scroll selected item into view
  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [selectedIndex]);

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
          {/* 1. Left: Brand Logo */}
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

          {/* 3. Right: Utility Controls (Search, Theme Toggle, GitHub) */}
          <div className="nav-actions">
            {/* Quick Search Button */}
            <button
              className="nav-search-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Search algorithms (Press ⌘K or /)"
              title="Search (⌘K or /)"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-search-icon">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.5" y2="16.5" />
              </svg>
              <span className="nav-search-placeholder">Search algorithms...</span>
              <kbd className="nav-search-kbd">⌘K</kbd>
            </button>

            <ThemeToggle />

            {/* GitHub Repository Link */}
            <a
              href="https://github.com/Deepak-Kambala/Atlas"
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

      {/* Global Quick Search Dialog (Command Palette) */}
      {searchOpen && (
        <div className="search-modal-backdrop" onClick={() => setSearchOpen(false)}>
          <div className="search-modal-card" onClick={e => e.stopPropagation()}>
            {/* Search Input Row */}
            <div className="search-modal-input-row">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="search-input-icon">
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
                autoComplete="off"
                spellCheck="false"
              />

              {query && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => {
                    setQuery('');
                    setSelectedIndex(0);
                    searchInputRef.current?.focus();
                  }}
                  aria-label="Clear query"
                  title="Clear"
                >
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}

              <kbd className="search-esc-hint" onClick={() => setSearchOpen(false)} title="Press ESC to close">
                ESC
              </kbd>
            </div>

            {/* Quick Category Filter Pills */}
            <div className="search-category-filter-row">
              <button
                type="button"
                className={`search-filter-chip ${categoryFilter === 'all' ? 'active' : ''}`}
                onClick={() => {
                  setCategoryFilter('all');
                  setSelectedIndex(0);
                }}
              >
                All <span className="chip-count">{C.length}</span>
              </button>
              <button
                type="button"
                className={`search-filter-chip ${categoryFilter === 'Supervised' ? 'active' : ''}`}
                onClick={() => {
                  setCategoryFilter('Supervised');
                  setSelectedIndex(0);
                }}
              >
                Supervised <span className="chip-count">{supervisedCount}</span>
              </button>
              <button
                type="button"
                className={`search-filter-chip ${categoryFilter === 'Unsupervised' ? 'active' : ''}`}
                onClick={() => {
                  setCategoryFilter('Unsupervised');
                  setSelectedIndex(0);
                }}
              >
                Unsupervised <span className="chip-count">{unsupervisedCount}</span>
              </button>
            </div>

            {/* Results List */}
            <div className="search-results-list">
              {filteredAlgos.length === 0 ? (
                <div className="search-no-results">
                  <div className="search-no-results-icon">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="11" cy="11" r="7" />
                      <line x1="21" y1="21" x2="16.5" y2="16.5" />
                    </svg>
                  </div>
                  <div className="search-no-results-text">
                    No algorithms found matching &ldquo;{query}&rdquo;
                  </div>
                  <button
                    type="button"
                    className="search-reset-btn"
                    onClick={() => {
                      setQuery('');
                      setCategoryFilter('all');
                    }}
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                filteredAlgos.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  const isSupervised = item.type === 'Supervised';

                  return (
                    <Link
                      key={item.slug}
                      href={`/ml/${item.slug}`}
                      ref={isSelected ? selectedItemRef : null}
                      className={`search-result-row ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSearchOpen(false)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    >
                      <div className="search-result-left">
                        <div className={`search-result-dot ${isSupervised ? 'supervised' : 'unsupervised'}`} />
                        <div className="search-result-meta">
                          <div className="search-result-title-row">
                            <span className="search-result-name">{highlightMatch(item.name, query)}</span>
                            <span className="search-result-task-pill">{item.task}</span>
                          </div>
                          <span className="search-result-tag">{item.tag}</span>
                        </div>
                      </div>

                      <div className="search-result-right">
                        <span className={`search-result-badge ${isSupervised ? 'badge-supervised' : 'badge-unsupervised'}`}>
                          {item.type}
                        </span>
                        {isSelected && (
                          <span className="search-result-jump-hint" title="Press Enter to open">
                            ↵
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>

            {/* Footer with keyboard shortcuts */}
            <div className="search-modal-footer">
              <div className="search-footer-info">
                {filteredAlgos.length} {filteredAlgos.length === 1 ? 'algorithm' : 'algorithms'}
              </div>
              <div className="search-footer-shortcuts">
                <span className="shortcut-item">
                  <kbd className="search-kbd">↑</kbd>
                  <kbd className="search-kbd">↓</kbd> Navigate
                </span>
                <span className="shortcut-item">
                  <kbd className="search-kbd">↵</kbd> Open
                </span>
                <span className="shortcut-item">
                  <kbd className="search-kbd">ESC</kbd> Close
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
