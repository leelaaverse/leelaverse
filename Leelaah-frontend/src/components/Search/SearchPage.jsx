import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchExploreData,
  fetchExplorePosts,
  fetchSuggestions,
  fetchSearchResults,
  clearSuggestions,
  clearSearchResults,
  setSearchQuery,
} from '../../store/slices/searchSlice';
import PostCard from '../PostCard/PostCard';
import { IoArrowBack, IoSearchOutline, IoCloseCircle, IoPlayCircle } from 'react-icons/io5';
import { FaFire, FaHashtag, FaUser, FaImage, FaVideo } from 'react-icons/fa';
import { HiOutlineTrendingUp, HiOutlineSparkles } from 'react-icons/hi';
import './SearchPage.css';

const DEBOUNCE_MS = 350;

const SearchPage = ({ onBack, onNavigate, onUserClick, onPostClick }) => {
  const dispatch = useDispatch();
  const {
    exploreData,
    exploreLoading,
    exploreLoaded,
    explorePosts,
    explorePostsPage,
    explorePostsHasMore,
    explorePostsLoading,
    suggestions,
    suggestionsLoading,
    searchResults,
    searchLoading,
    searchQuery,
  } = useSelector((state) => state.search);
  const { theme } = useSelector((state) => state.theme);

  const [inputValue, setInputValue] = useState(searchQuery || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [isSearchMode, setIsSearchMode] = useState(!!searchQuery);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const debounceRef = useRef(null);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const sentinelRef = useRef(null);

  // Determine dark mode
  useEffect(() => {
    if (theme === 'Dark') setIsDarkMode(true);
    else if (theme === 'Light') setIsDarkMode(false);
    else setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }, [theme]);

  // Fetch explore data only if not cached
  useEffect(() => {
    if (!exploreLoaded) {
      dispatch(fetchExploreData());
    }
    if (explorePosts.length === 0) {
      dispatch(fetchExplorePosts({ page: 1, limit: 18 }));
    }
  }, [dispatch, exploreLoaded, explorePosts.length]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current || isSearchMode) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && explorePostsHasMore && !explorePostsLoading) {
          dispatch(fetchExplorePosts({ page: explorePostsPage + 1, limit: 18 }));
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [dispatch, explorePostsHasMore, explorePostsLoading, explorePostsPage, isSearchMode]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target) &&
        !searchInputRef.current?.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search suggestions
  const handleInputChange = useCallback(
    (e) => {
      const val = e.target.value;
      setInputValue(val);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (val.trim().length === 0) {
        dispatch(clearSuggestions());
        setShowSuggestions(false);
        return;
      }

      debounceRef.current = setTimeout(() => {
        dispatch(fetchSuggestions(val.trim()));
        setShowSuggestions(true);
      }, DEBOUNCE_MS);
    },
    [dispatch]
  );

  // Submit full search
  const handleSearchSubmit = useCallback(
    (query) => {
      const q = (query || inputValue).trim();
      if (!q) return;
      dispatch(setSearchQuery(q));
      dispatch(clearSuggestions());
      dispatch(fetchSearchResults({ query: q }));
      setShowSuggestions(false);
      setIsSearchMode(true);
    },
    [dispatch, inputValue]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSearchSubmit();
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    },
    [handleSearchSubmit]
  );

  // Clear search and return to explore
  const handleClearSearch = useCallback(() => {
    setInputValue('');
    dispatch(clearSuggestions());
    dispatch(clearSearchResults());
    setShowSuggestions(false);
    setIsSearchMode(false);
    searchInputRef.current?.focus();
  }, [dispatch]);

  // Filter explore posts by tab
  const filteredExplorePosts = useMemo(() => {
    if (activeTab === 'all') return explorePosts;
    if (activeTab === 'videos')
      return explorePosts.filter(
        (p) =>
          p.type === 'video' ||
          p.category === 'video-post' ||
          p.mediaType?.startsWith('video/') ||
          p.mediaUrl?.match(/\.(mp4|webm|mov)$/i)
      );
    if (activeTab === 'posts')
      return explorePosts.filter(
        (p) =>
          p.type !== 'video' &&
          p.category !== 'video-post' &&
          !p.mediaType?.startsWith('video/') &&
          !p.mediaUrl?.match(/\.(mp4|webm|mov)$/i)
      );
    return explorePosts;
  }, [explorePosts, activeTab]);

  // Filter search results by tab
  const filteredSearchResults = useMemo(() => {
    if (activeTab === 'all') return searchResults;
    if (activeTab === 'users') return searchResults.filter((r) => r._searchType === 'user');
    if (activeTab === 'posts') return searchResults.filter((r) => r._searchType === 'post' && r.type !== 'video');
    if (activeTab === 'videos') return searchResults.filter((r) => r._searchType === 'post' && r.type === 'video');
    return searchResults;
  }, [searchResults, activeTab]);

  const tabs = isSearchMode
    ? [
        { key: 'all', label: 'All', icon: <HiOutlineSparkles /> },
        { key: 'posts', label: 'Posts', icon: <FaImage /> },
        { key: 'videos', label: 'Videos', icon: <FaVideo /> },
        { key: 'users', label: 'Users', icon: <FaUser /> },
      ]
    : [
        { key: 'all', label: 'All', icon: <HiOutlineSparkles /> },
        { key: 'posts', label: 'Posts', icon: <FaImage /> },
        { key: 'videos', label: 'Videos', icon: <FaVideo /> },
      ];

  // ───── Render helpers ─────

  const renderSkeleton = (count = 12) => (
    <div className="search-explore-grid px-1 sm:px-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="search-skeleton rounded-xl aspect-square"
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  );

  const renderTrendingCreators = () => {
    if (!exploreData?.trendingCreators?.length) return null;
    return (
      <div className="mb-5 px-1 sm:px-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          <FaFire className="text-orange-400" /> Trending Creators
        </h3>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {exploreData.trendingCreators.map((creator) => (
            <button
              key={creator.id}
              onClick={() => onUserClick?.(creator.id)}
              className="flex flex-col items-center gap-1.5 min-w-[72px] group"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-indigo-500/50 transition-all duration-300 bg-gradient-to-br from-amber-400 via-pink-500 to-indigo-600 p-[2px]">
                <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-black">
                  {creator.avatar ? (
                    <img src={creator.avatar} alt={creator.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-500 dark:text-gray-400">
                      {creator.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400 truncate max-w-[72px] group-hover:text-indigo-500 transition-colors">
                {creator.username}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderPopularHashtags = () => {
    if (!exploreData?.popularHashtags?.length) return null;
    const tagColors = [
      { bg: 'from-violet-500/10 to-indigo-500/10', dot: 'bg-violet-400', hover: 'hover:from-violet-500/20 hover:to-indigo-500/20' },
      { bg: 'from-rose-500/10 to-pink-500/10', dot: 'bg-rose-400', hover: 'hover:from-rose-500/20 hover:to-pink-500/20' },
      { bg: 'from-emerald-500/10 to-teal-500/10', dot: 'bg-emerald-400', hover: 'hover:from-emerald-500/20 hover:to-teal-500/20' },
      { bg: 'from-amber-500/10 to-orange-500/10', dot: 'bg-amber-400', hover: 'hover:from-amber-500/20 hover:to-orange-500/20' },
    ];
    return (
      <div className="mb-5 px-1 sm:px-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          <HiOutlineTrendingUp className="text-emerald-400" /> Popular Tags
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {exploreData.popularHashtags.map((tag, i) => {
            const color = tagColors[i % tagColors.length];
            return (
              <button
                key={i}
                onClick={() => handleSearchSubmit(tag.name.replace('#', ''))}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold
                           bg-gradient-to-r ${color.bg} ${color.hover}
                           text-gray-800 dark:text-gray-200
                           transition-all duration-300 hover:scale-[1.03] active:scale-95`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${color.dot} flex-shrink-0`} />
                {tag.name.replace('#', '')}
                {tag.count && (
                  <span className="text-[10px] opacity-50 ml-0.5 font-normal">
                    {tag.count > 1000 ? `${(tag.count / 1000).toFixed(1)}k` : tag.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderUserResults = () => {
    const users = filteredSearchResults.filter((r) => r._searchType === 'user');
    if (users.length === 0) return null;
    return (
      <div className="mb-6 px-1 sm:px-2">
        <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <FaUser className="text-indigo-400" /> Users
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => onUserClick?.(user.id)}
              className="flex items-center gap-3 p-3 rounded-2xl
                         bg-white dark:bg-white/[0.03]
                         border border-gray-100 dark:border-white/5
                         hover:border-indigo-200 dark:hover:border-indigo-500/20
                         hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5
                         transition-all duration-200 text-left group"
            >
              <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-br from-amber-400 to-pink-500 flex-shrink-0 flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-sm">{user.username?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {user.username}
                </p>
                {user.bio && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 truncate mt-0.5">
                    {user.bio}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderPostResults = () => {
    const posts = filteredSearchResults.filter((r) => r._searchType === 'post');
    if (posts.length === 0 && activeTab !== 'users') return null;
    if (posts.length === 0) return null;
    return (
      <div className="px-1 sm:px-2">
        <h3 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <FaImage className="text-pink-400" /> Content
        </h3>
        <div className="search-explore-grid">
          {posts.map((post, i) => (
            <div key={post.id} className="search-grid-item" style={{ '--delay': `${i * 60}ms` }}>
              <PostCard
                post={post}
                aspectRatio="square"
                onPostClick={onPostClick}
                onUserClick={onUserClick}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ───── Main render ─────

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-black' : 'bg-[#f5f5f5]'}`}>
      {/* ── Header ── */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-300
          ${isDarkMode
            ? 'bg-black/80 border-white/5'
            : 'bg-white/80 border-gray-200/60'
          }`}
      >
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6">
          {/* Top row: back + search bar */}
          <div className="flex items-center gap-3 py-3">
            <button
              onClick={onBack}
              className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200
                ${isDarkMode
                  ? 'hover:bg-white/5 text-white'
                  : 'hover:bg-black/5 text-gray-800'
                } active:scale-90`}
            >
              <IoArrowBack size={20} />
            </button>

            {/* Search input */}
            <div className="relative flex-1 max-w-[600px] mx-auto">
              <div
                className={`search-input-glow flex items-center gap-3 rounded-2xl px-5 py-3 transition-all duration-300
                  ${isDarkMode
                    ? 'bg-white/[0.06] focus-within:bg-white/[0.09]'
                    : 'bg-gray-100/80 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-black/5'
                  }`}
              >
                <IoSearchOutline
                  className={`flex-shrink-0 transition-colors ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}
                  size={18}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => inputValue.trim() && suggestions && setShowSuggestions(true)}
                  placeholder="Search creators, posts, art..."
                  className={`flex-1 bg-transparent outline-none text-sm font-medium placeholder:font-normal
                    ${isDarkMode
                      ? 'text-white placeholder:text-gray-600'
                      : 'text-gray-900 placeholder:text-gray-400'
                    }`}
                />
                {inputValue && (
                  <button
                    onClick={handleClearSearch}
                    className={`flex-shrink-0 transition-colors ${
                      isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <IoCloseCircle size={18} />
                  </button>
                )}
              </div>

              {/* Suggestions dropdown */}
              {showSuggestions && suggestions && (
                <div
                  ref={suggestionsRef}
                  className={`search-suggestions-dropdown absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50
                    ${isDarkMode
                      ? 'bg-[#111]/95 backdrop-blur-2xl border border-white/[0.08] shadow-2xl shadow-black/50'
                      : 'bg-white/95 backdrop-blur-2xl border border-gray-200/60 shadow-2xl shadow-gray-300/30'
                    }`}
                >
                  <div className="max-h-[60vh] overflow-y-auto py-2">
                    {/* Users */}
                    {suggestions.users?.length > 0 && (
                      <div className="px-3 py-1.5">
                        <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 px-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Creators</p>
                        {suggestions.users.map((user) => (
                          <button
                            key={user.id}
                            onClick={() => {
                              onUserClick?.(user.id);
                              setShowSuggestions(false);
                            }}
                            className={`flex items-center gap-3 w-full px-2 py-2 rounded-xl transition-colors
                              ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                          >
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-white text-xs font-bold">
                                  {user.username?.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="text-left min-w-0">
                              <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {user.username}
                              </p>
                              {(user.firstName || user.lastName) && (
                                <p className={`text-xs truncate ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                  {`${user.firstName || ''} ${user.lastName || ''}`.trim()}
                                </p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Posts */}
                    {suggestions.posts?.length > 0 && (
                      <div className="px-3 py-1.5">
                        <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 px-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Posts</p>
                        {suggestions.posts.map((post) => (
                          <button
                            key={post.id}
                            onClick={() => {
                              onPostClick?.(post.id);
                              setShowSuggestions(false);
                            }}
                            className={`flex items-center gap-3 w-full px-2 py-2 rounded-xl transition-colors
                              ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                          >
                            <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0">
                              {post.thumbnailUrl ? (
                                <img src={post.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  {post.type === 'video' ? (
                                    <IoPlayCircle className="text-gray-400" />
                                  ) : (
                                    <FaImage className="text-gray-400 text-xs" />
                                  )}
                                </div>
                              )}
                            </div>
                            <p className={`text-sm truncate text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {post.caption || post.title || 'Untitled'}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* AI Content */}
                    {suggestions.ai_content?.length > 0 && (
                      <div className="px-3 py-1.5">
                        <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 px-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>AI Creations</p>
                        {suggestions.ai_content.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              handleSearchSubmit(item.prompt);
                              setShowSuggestions(false);
                            }}
                            className={`flex items-center gap-3 w-full px-2 py-2 rounded-xl transition-colors
                              ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                          >
                            <div className="w-9 h-9 rounded-lg overflow-hidden bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center flex-shrink-0">
                              {item.thumbnailUrl || item.resultUrl ? (
                                <img src={item.thumbnailUrl || item.resultUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <HiOutlineSparkles className="text-indigo-400" />
                              )}
                            </div>
                            <p className={`text-sm truncate text-left ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {item.prompt}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Search action */}
                    {inputValue.trim() && (
                      <div className={`border-t mx-3 mt-1 pt-1 ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
                        <button
                          onClick={() => handleSearchSubmit()}
                          className={`flex items-center gap-3 w-full px-2 py-2.5 rounded-xl transition-colors
                            ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}
                        >
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                            <IoSearchOutline className="text-white" size={16} />
                          </div>
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Search "<span className="text-indigo-500">{inputValue.trim()}</span>"
                          </p>
                        </button>
                      </div>
                    )}

                    {/* Empty state */}
                    {suggestionsLoading && (
                      <div className="flex justify-center py-6">
                        <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 pb-2 overflow-x-auto no-scrollbar -mx-1 px-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200
                  ${activeTab === tab.key
                    ? `${isDarkMode
                        ? 'bg-white/10 text-white'
                        : 'bg-gray-900 text-white'
                      } search-tab-active`
                    : `${isDarkMode
                        ? 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`
                  }`}
              >
                <span className="text-[11px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Content area ── */}
      <main className="max-w-[1400px] mx-auto pt-4 pb-28 search-page-scroll">
        {/* Search results mode */}
        {isSearchMode ? (
          <div className="search-view-enter">
            {searchLoading ? (
              renderSkeleton(12)
            ) : filteredSearchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                  <IoSearchOutline size={32} className={isDarkMode ? 'text-gray-600' : 'text-gray-300'} />
                </div>
                <p className={`text-lg font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  No results found
                </p>
                <p className={`text-sm text-center max-w-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  We couldn't find anything for "<span className="text-indigo-500">{searchQuery}</span>". Try a different keyword.
                </p>
              </div>
            ) : (
              <>
                {(activeTab === 'all' || activeTab === 'users') && renderUserResults()}
                {(activeTab === 'all' || activeTab === 'posts' || activeTab === 'videos') && renderPostResults()}
              </>
            )}
          </div>
        ) : (
          /* Explore mode */
          <div className="search-view-enter">
            {renderTrendingCreators()}
            {renderPopularHashtags()}

            {/* Explore grid */}
            {exploreLoading && explorePosts.length === 0 ? (
              renderSkeleton(18)
            ) : (
              <div className="px-1 sm:px-2">
                <div className="search-explore-grid">
                  {filteredExplorePosts.map((post, i) => (
                    <div
                      key={post.id}
                      className="search-grid-item"
                      style={{ '--delay': `${Math.min(i, 11) * 50}ms` }}
                    >
                      <PostCard
                        post={post}
                        aspectRatio="square"
                        onPostClick={onPostClick}
                        onUserClick={onUserClick}
                      />
                    </div>
                  ))}
                </div>

                {/* Infinite scroll loading */}
                {explorePostsLoading && (
                  <div className="flex justify-center py-8">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                      <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Loading more...</span>
                    </div>
                  </div>
                )}

                {!explorePostsHasMore && explorePosts.length > 0 && (
                  <div className="flex justify-center py-8">
                    <p className={`text-xs font-medium flex items-center gap-1.5 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                      You've seen it all <HiOutlineSparkles className="text-indigo-400" />
                    </p>
                  </div>
                )}

                {/* Sentinel for infinite scroll */}
                <div ref={sentinelRef} className="h-1" />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
