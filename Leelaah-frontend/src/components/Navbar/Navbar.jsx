import React from 'react';
import './Navbar.css';

const Navbar = ({ activeTab, setActiveTab }) => {
    return (
        <nav className="navbar navbar-expand-lg sticky-top py-2 bg-mainColor Header">
            <div className="container-fluid flex-wrap px-4">
                {/* Logo */}
                <a
                    className="navbar-brand d-flex align-items-center order-1 order-lg-1"
                    href="#"
                >
                    <img
                        src="/assets/logo-web.png"
                        alt="LELAA Logo"
                        className="img-fluid"
                        style={{ maxHeight: '100px' }}
                    />
                </a>

                {/* Navigation */}
                <div className="justify-content-center order-3 order-lg-2" id="navbarMain">
                    <ul
                        className="nav nav-pills flex-row bg-dark-2 py-2 px-5 gap-3 rounded-pill flex-wrap justify-content-center mb-2 mb-lg-0"
                        id="pills-tab"
                        role="tablist"
                    >
                        <li className="nav-item" role="presentation">
                            <button
                                className={`nav-link ${activeTab === 'featured' ? 'active' : ''}`}
                                onClick={() => setActiveTab('featured')}
                                type="button"
                                role="tab"
                            >
                                Featured
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button
                                className={`nav-link ${activeTab === 'trending' ? 'active' : ''}`}
                                onClick={() => setActiveTab('trending')}
                                type="button"
                                role="tab"
                            >
                                Trending
                            </button>
                        </li>
                        <li className="nav-item" role="presentation">
                            <button
                                className={`nav-link ${activeTab === 'following' ? 'active' : ''}`}
                                onClick={() => setActiveTab('following')}
                                type="button"
                                role="tab"
                            >
                                Following
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Right Icons */}
                <div className="d-flex align-items-center justify-content-end bg-dark-2 px-md-5 py-md-3 px-lg-5 py-lg-3 px-sm-5 py-sm-2 px-3 py-2 rounded-pill navigationRight ms-2 gap-lg-4 gap-md-4 gap-sm-3 gap-3 order-2 order-lg-3">
                    <button>
                        <i className="fa-solid fa-message"></i>
                    </button>
                    <button>
                        <i className="fa-solid fa-bell"></i>
                    </button>
                    <button
                        type="button"
                        data-bs-toggle="offcanvas"
                        data-bs-target="#offcanvasRight"
                        aria-controls="offcanvasRight"
                    >
                        <i className="fa-solid fa-border-all"></i>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
