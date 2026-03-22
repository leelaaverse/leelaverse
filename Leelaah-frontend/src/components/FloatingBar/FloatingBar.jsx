import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import CreateModal from '../CreateModal/CreateModal';

const FloatingBar = ({ onOpenAuth, onNavigate }) => {
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const { isLoggedIn } = useSelector((state) => state.auth);

    const handleGenerateClick = () => {
        if (!isLoggedIn) {
            if (onOpenAuth) {
                onOpenAuth('signup');
            }
            return;
        }
        setIsGenerateModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsGenerateModalOpen(false);
    };

    return (
        <>
            <section className="fixed bottom-5 left-1/2 -translate-x-1/2 z-1030 pointer-events-none w-[calc(100%-2.5rem)] max-w-[500px]">
                <div className="pointer-events-auto flex items-center justify-evenly bg-linear-to-r from-[#949414]/85 to-[#1936c8]/85 backdrop-blur-xl rounded-full shadow-lg shadow-black/25 py-3.5 px-6 sm:py-4 sm:px-10 md:px-14">
                    {/* Browse */}
                    <button className="flex flex-col items-center gap-0.5 bg-transparent border-none outline-none cursor-pointer p-2.5 sm:p-3 rounded-xl transition-all duration-200 hover:bg-white/10 active:scale-95 group">
                        <img src="/assets/home-rounded.svg" alt="Browse" className="w-5.5 h-5.5 sm:w-6 sm:h-6 brightness-100 transition-transform duration-200 group-hover:scale-110" />
                    </button>

                    {/* Explore */}
                    <button
                        className="flex flex-col items-center gap-0.5 bg-transparent border-none outline-none cursor-pointer p-2.5 sm:p-3 rounded-xl transition-all duration-200 hover:bg-white/10 active:scale-95 group"
                        onClick={() => {
                            if (!isLoggedIn) {
                                if (onOpenAuth) onOpenAuth('login');
                                return;
                            }
                            onNavigate && onNavigate('search');
                        }}
                    >
                        <img src="/assets/search.svg" alt="Explore" className="w-5.5 h-5.5 sm:w-6 sm:h-6 brightness-100 transition-transform duration-200 group-hover:scale-110" />
                    </button>

                    {/* Generate (center) */}
                    <button
                        data-floating-plus="true"
                        className="flex items-center justify-center bg-white/10 backdrop-blur-sm border-none outline-none cursor-pointer p-3 sm:p-3.5 rounded-2xl overflow-hidden transition-all duration-200 hover:bg-white/20 hover:scale-105 active:scale-95 -my-1"
                        onClick={handleGenerateClick}
                    >
                        <img src="/assets/add-outline.svg" alt="Generate" className="w-6 h-6 sm:w-6.5 sm:h-6.5 brightness-100 transition-transform duration-200" />
                    </button>

                    {/* Community */}
                    <button
                        className="flex flex-col items-center gap-0.5 bg-transparent border-none outline-none cursor-pointer p-2.5 sm:p-3 rounded-xl transition-all duration-200 hover:bg-white/10 active:scale-95 group"
                        onClick={() => onNavigate && onNavigate('community')}
                    >
                        <img src="/assets/globe.svg" alt="Community" className="w-5.5 h-5.5 sm:w-6 sm:h-6 brightness-100 transition-transform duration-200 group-hover:scale-110" />
                    </button>

                    {/* Bloops */}
                    <button
                        className="flex flex-col items-center gap-0.5 bg-transparent border-none outline-none cursor-pointer p-2.5 sm:p-3 rounded-xl transition-all duration-200 hover:bg-white/10 active:scale-95 group"
                        onClick={() => onNavigate && onNavigate('bloops')}
                    >
                        <img src="/assets/play-list.svg" alt="Bloops" className="w-5.5 h-5.5 sm:w-6 sm:h-6 brightness-100 transition-transform duration-200 group-hover:scale-110" />
                    </button>
                </div>
            </section>

            <CreateModal
                isOpen={isGenerateModalOpen}
                onClose={handleCloseModal}
                onOpenAuth={onOpenAuth}
                onNavigate={onNavigate}
            />
        </>
    );
};

export default FloatingBar;
