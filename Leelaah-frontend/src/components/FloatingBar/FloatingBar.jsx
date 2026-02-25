import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import GenerateModal from '../GenerateModal/GenerateModal';
import './FloatingBar.css';

const FloatingBar = ({ onOpenAuth, onNavigate }) => {
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const { isLoggedIn } = useSelector((state) => state.auth);

    const handleGenerateClick = () => {
        // Check if user is logged in
        if (!isLoggedIn) {
            // Open auth modal for login/signup
            if (onOpenAuth) {
                onOpenAuth('signup'); // Open signup modal by default
            }
            return;
        }
        // If logged in, open generate modal
        setIsGenerateModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsGenerateModalOpen(false);
    };

    return (
        <>
            <section className="floating-bar">
                <div className="row justify-content-center m-0">
                    <div className="col-md-5 col-12 floating-bar-col">
                        <div className="f-conatiner d-flex flex-nowrap justify-content-between align-items-center">
                            <div className="f-bar-item">
                                <button>
                                    <img src="/assets/home-rounded.svg" alt="Browse" />
                                    <p className="f-bar-label">Browse</p>
                                </button>
                            </div>
                            <div className="f-bar-item">
                                <button>
                                    <img src="/assets/search.svg" alt="Explore" />
                                    <p className="f-bar-label">Explore</p>
                                </button>
                            </div>
                            <div className="f-bar-item f-bar-item-center">
                                <button
                                    className="generateBtn"
                                    onClick={handleGenerateClick}
                                >
                                    <div>
                                        <img src="/assets/add-outline.svg" alt="Generate" />
                                        <p className="f-bar-label">Generate</p>
                                    </div>
                                </button>
                            </div>
                            <div className="f-bar-item">
                                <button onClick={() => onNavigate && onNavigate('community')}>
                                    <img src="/assets/globe.svg" alt="Community" />
                                    <p className="f-bar-label">Community</p>
                                </button>
                            </div>
                            <div className="f-bar-item">
                                <button onClick={() => onNavigate && onNavigate('bloops')}>
                                    <img src="/assets/play-list.svg" alt="Bloops" />
                                    <p className="f-bar-label">Bloops</p>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <GenerateModal
                isOpen={isGenerateModalOpen}
                onClose={handleCloseModal}
                onOpenAuth={onOpenAuth}
            />
        </>
    );
};

export default FloatingBar;
