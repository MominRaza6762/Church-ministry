import React, { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { searchApi } from "../api/searchApi.js";
import { friendlyDate } from "../utils/dateUtils.js";

const TYPE_CONFIG = {
  sacrament:     { label: "Sacrament",      color: "bg-burgundy/10 text-burgundy",   dot: "bg-burgundy" },
  pastoral:      { label: "Pastoral",        color: "bg-navy/10 text-navy",           dot: "bg-navy" },
  teaching:      { label: "Teaching",        color: "bg-forest/10 text-forest",       dot: "bg-forest" },
  prayer:        { label: "Prayer",          color: "bg-gold/20 text-gold/80",        dot: "bg-gold" },
  reflection:    { label: "Reflection",      color: "bg-parchment-dark text-texts",   dot: "bg-texts" },
  communication: { label: "Communication",   color: "bg-parchment-dark text-texts",   dot: "bg-texts/60" }
};

const highlight = (text, query) => {
  if (!text || !query) return text || "";
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-gold/30 text-textp rounded px-0.5 not-italic">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
};

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setError("");
    try {
      const data = await searchApi(q.trim());
      setResults(data.results || []);
      setSearched(true);
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    doSearch(query);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setSearched(false);
    setError("");
    inputRef.current?.focus();
  };

  const totalMatches = results.reduce((sum, r) => sum + r.matches.length, 0);

  return (
    <div className="min-h-screen bg-parchment">
      {/* Page header */}
      <div className="bg-burgundy px-4 py-5">
        <div className="mx-auto max-w-[640px]">
          <div className="text-gold/60 text-xs tracking-[0.25em] uppercase mb-1 text-center">✦ Search ✦</div>
          <div className="text-gold font-serif tracking-[0.15em] uppercase text-sm font-semibold text-center">
            Ministry Journal Search
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[640px] px-3 py-4 animate-fadeIn">

        {/* Search bar */}
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="relative">
            {/* Search icon */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-texts pointer-events-none">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleChange}
              placeholder="Search sacraments, visits, teachings, notes..."
              autoFocus
              className="w-full bg-ivory border border-parchment-dark rounded-2xl pl-11 pr-12 py-3.5 text-sm
                shadow-card focus:outline-none focus:border-gold focus:bg-white transition-all duration-200
                placeholder:text-texts/50"
            />

            {/* Clear / loading */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {loading ? (
                <svg className="w-4 h-4 animate-spin text-texts" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
              ) : query ? (
                <button type="button" onClick={clearSearch}
                  className="w-6 h-6 rounded-full bg-parchment-dark hover:bg-texts/20 flex items-center justify-center transition-colors">
                  <svg className="w-3 h-3 text-texts" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : null}
            </div>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-danger/10 border border-danger/30 rounded-xl px-4 py-3 text-danger text-sm mb-4">
            {error}
          </div>
        )}

        {/* Empty state — not searched yet */}
        {!searched && !loading && (
          <div className="text-center py-12 animate-fadeIn">
            <div className="text-5xl mb-4 animate-float">🔍</div>
            <p className="text-textp font-serif text-base">Search your journal</p>
            <p className="text-texts text-sm mt-2 max-w-xs mx-auto leading-relaxed">
              Search across sacraments, pastoral visits, teachings, prayer notes, reflections, and communications.
            </p>
            {/* Example chips */}
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {["Confession", "Home visit", "Sermon", "Baptism", "Meeting"].map(ex => (
                <button key={ex} onClick={() => { setQuery(ex); doSearch(ex); }}
                  className="px-3 py-1.5 bg-ivory border border-parchment-dark rounded-full text-xs text-texts hover:border-gold hover:text-textp transition-all">
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {searched && results.length === 0 && !loading && (
          <div className="text-center py-12 animate-fadeIn">
            <div className="text-5xl mb-4">✦</div>
            <p className="text-textp font-serif text-base">No results found</p>
            <p className="text-texts text-sm mt-1">
              No journal entries match "<span className="font-medium text-textp">{query}</span>"
            </p>
            <button onClick={clearSearch}
              className="mt-4 px-4 py-2 bg-parchment border border-parchment-dark rounded-xl text-sm hover:bg-parchment-dark transition-colors">
              Clear Search
            </button>
          </div>
        )}

        {/* Results */}
        {searched && results.length > 0 && (
          <div className="animate-fadeIn">
            {/* Result count */}
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs text-texts">
                <span className="font-semibold text-textp">{totalMatches}</span> match{totalMatches !== 1 ? "es" : ""} in{" "}
                <span className="font-semibold text-textp">{results.length}</span> day{results.length !== 1 ? "s" : ""}
              </span>
              <button onClick={clearSearch} className="text-xs text-texts hover:text-danger transition-colors">
                Clear
              </button>
            </div>

            {/* Result groups by date */}
            <div className="space-y-3">
              {results.map((group) => (
                <div key={group.date} className="bg-ivory rounded-2xl shadow-card border border-parchment-dark/30 overflow-hidden">
                  {/* Date header */}
                  <div className="bg-gradient-to-r from-parchment to-ivory px-4 py-2.5 border-b border-parchment-dark/30 flex items-center justify-between">
                    <div>
                      <span className="font-serif text-burgundy text-sm font-semibold">{friendlyDate(group.date)}</span>
                      <span className="text-texts text-xs ml-2">
                        {group.matches.length} match{group.matches.length !== 1 ? "es" : ""}
                      </span>
                    </div>
                    <Link to={`/print/${group.date}`}
                      className="text-xs text-texts hover:text-burgundy transition-colors flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </Link>
                  </div>

                  {/* Match list */}
                  <div className="divide-y divide-parchment-dark/20">
                    {group.matches.map((match, idx) => {
                      const cfg = TYPE_CONFIG[match.type] || TYPE_CONFIG.reflection;
                      return (
                        <div key={idx} className="px-4 py-3 hover:bg-parchment/40 transition-colors">
                          <div className="flex items-start gap-2.5">
                            {/* Type badge */}
                            <span className={`flex-shrink-0 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${cfg.color}`}>
                              {cfg.label}
                            </span>
                            <div className="flex-1 min-w-0">
                              {/* Main label */}
                              {match.label && (
                                <p className="text-sm font-medium text-textp leading-snug">
                                  {highlight(match.label, query)}
                                </p>
                              )}
                              {/* Detail */}
                              {match.detail && (
                                <p className="text-xs text-texts mt-0.5">
                                  {highlight(match.detail, query)}
                                </p>
                              )}
                              {/* Snippet */}
                              {match.snippet && (
                                <p className="text-xs text-texts/70 mt-1 italic line-clamp-2">
                                  {highlight(match.snippet, query)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;