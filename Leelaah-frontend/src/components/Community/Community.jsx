import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Navbar from '../Navbar/Navbar';
import './Community.css';

const Community = ({ onBack, onShowAuthModal }) => {
    const [showLeaderModal, setShowLeaderModal] = useState(false);
    const [showCompetitionModal, setShowCompetitionModal] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [showOffcanvas, setShowOffcanvas] = useState(false);

    const { isLoggedIn } = useSelector((state) => state.auth);

    return (
        <div className="community-page">
            <Navbar
                isLoggedIn={isLoggedIn}
                showBackButton={!!onBack}
                onBack={onBack}
                onLogin={() => onShowAuthModal && onShowAuthModal('login')}
                onSignup={() => onShowAuthModal && onShowAuthModal('signup')}
            />


            <main>
                <div className="container-fluid dashboard-wrapper">
                    <div className="row g-4">
                        {/* Leadership */}
                        <div className="col-lg-4">
                            <div className="panel">
                                <div className="panel-header leadership-header">Leadership</div>

                                <div className="main-lead">
                                    <div className="search-box mb-3">
                                        <input type="text" className="form-control" placeholder="Search User..." />
                                    </div>

                                    <div className="d-flex gap-2 mb-3">
                                        <div className="dropdown">
                                            <button className="filter-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                Audio
                                            </button>
                                            <ul className="dropdown-menu dropdown-dark">
                                                <li><a className="dropdown-item" href="#">Audio</a></li>
                                                <li><a className="dropdown-item" href="#">Video</a></li>
                                                <li><a className="dropdown-item" href="#">Image</a></li>
                                            </ul>
                                        </div>

                                        <div className="dropdown">
                                            <button className="filter-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                Today
                                            </button>
                                            <ul className="dropdown-menu dropdown-dark">
                                                <li><a className="dropdown-item" href="#">Today</a></li>
                                                <li><a className="dropdown-item" href="#">This Week</a></li>
                                                <li><a className="dropdown-item" href="#">This Month</a></li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Leader Card */}
                                    <div role="button" onClick={() => setShowLeaderModal(true)}>
                                        <div className="leader-card">
                                            <div className="leader-info">
                                                <img src="https://i.pravatar.cc/100?img=1" className="leader-img" alt="leader" />
                                                <div>
                                                    <div className="leader-name">Arjun Verma</div>
                                                    <div className="leader-tag">AI Art <i className="fa-solid fa-angle-right"></i></div>
                                                    <div className="members"><i className="fa-solid fa-users"></i> 2.5k members</div>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-column flex-wrap justify-content-center align-items-center">
                                                <p className="m-0 text-light">#1</p>
                                                <div className="score-badge">12,677</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div role="button" onClick={() => setShowLeaderModal(true)}>
                                        <div className="leader-card">
                                            <div className="leader-info">
                                                <img src="https://i.pravatar.cc/100?img=2" className="leader-img" alt="leader" />
                                                <div>
                                                    <div className="leader-name">Maya Kapoor</div>
                                                    <div className="leader-tag">Storytelling <i className="fa-solid fa-angle-right"></i></div>
                                                    <div className="members"><i className="fa-solid fa-users"></i> 1.5k members</div>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-column flex-wrap justify-content-center align-items-center">
                                                <p className="m-0 text-light">#2</p>
                                                <div className="score-badge">10,707</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div role="button" onClick={() => setShowLeaderModal(true)}>
                                        <div className="leader-card">
                                            <div className="leader-info">
                                                <img src="https://i.pravatar.cc/100?img=3" className="leader-img" alt="leader" />
                                                <div>
                                                    <div className="leader-name">Raman Sharma</div>
                                                    <div className="leader-tag">AI Art <i className="fa-solid fa-angle-right"></i></div>
                                                    <div className="members"><i className="fa-solid fa-users"></i> 1k members</div>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-column flex-wrap justify-content-center align-items-center">
                                                <p className="m-0 text-light">#3</p>
                                                <div className="score-badge">10,707</div>
                                            </div>
                                        </div>
                                    </div>

                                    <hr style={{ color: '#fff' }} />

                                    <div role="button">
                                        <div className="my-card">
                                            <div className="leader-info">
                                                <img src="https://i.pravatar.cc/100?img=4" className="leader-img" alt="my profile" />
                                                <div>
                                                    <div className="leader-name">My Profile</div>
                                                    <div className="leader-tag">AI Art <i className="fa-solid fa-angle-right"></i></div>
                                                    <div className="members"><i className="fa-solid fa-users"></i> 1k members</div>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-column flex-wrap justify-content-center align-items-center">
                                                <p className="m-0 text-light">#100</p>
                                                <div className="score-badge">10,707</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div role="button">
                                        <div className="leader-card">
                                            <div className="leader-info">
                                                <img src="https://i.pravatar.cc/100?img=5" className="leader-img" alt="leader" />
                                                <div>
                                                    <div className="leader-name">Raman Sharma</div>
                                                    <div className="leader-tag">AI Art <i className="fa-solid fa-angle-right"></i></div>
                                                    <div className="members"><i className="fa-solid fa-users"></i> 1k members</div>
                                                </div>
                                            </div>
                                            <div className="d-flex flex-column flex-wrap justify-content-center align-items-center">
                                                <p className="m-0 text-light">#221</p>
                                                <div className="score-badge">10,707</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Competitions */}
                        <div className="col-lg-4">
                            <div className="panel">
                                <div className="panel-header competition-header">Competitions</div>

                                <div className="main-lead">
                                    <div className="search-box mb-3">
                                        <input type="text" className="form-control" placeholder="Search User..." />
                                    </div>

                                    <div className="d-flex gap-2 mb-3">
                                        <div className="dropdown">
                                            <button className="filter-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                Upcoming
                                            </button>
                                            <ul className="dropdown-menu dropdown-dark">
                                                <li><a className="dropdown-item" href="#">Live</a></li>
                                                <li><a className="dropdown-item" href="#">Upcoming</a></li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div role="button" onClick={() => setShowCompetitionModal(true)}>
                                        <div className="competition-card" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b")' }}>
                                            <div className="competition-overlay"></div>
                                            <div className="competition-content">
                                                <div className="competition-title">Cyberpunk Legends</div>
                                                <div className="timer text-light">15H:20m:2s</div>
                                                <div className="d-flex flex-wrap align-items-center justify-content-between">
                                                    <div className="members text-light"><i className="fa-solid fa-users"></i> 1.5k members</div>
                                                    <button className="participate-btn">Participate</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div role="button" onClick={() => setShowCompetitionModal(true)}>
                                        <div className="competition-card" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1446776811953-b23d57bd21aa")' }}>
                                            <div className="competition-overlay"></div>
                                            <div className="competition-content">
                                                <div className="competition-title">Celestial Voyages</div>
                                                <div className="timer text-light">15H:20m:2s</div>
                                                <div className="d-flex flex-wrap align-items-center justify-content-between">
                                                    <div className="members text-light"><i className="fa-solid fa-users"></i> 1.5k members</div>
                                                    <button className="participate-btn">Participate</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Templates */}
                        <div className="col-lg-4">
                            <div className="panel">
                                <div className="panel-header templates-header">Templates</div>

                                <div className="main-lead">
                                    <div className="search-box mb-3">
                                        <input type="text" className="form-control" placeholder="Search User..." />
                                    </div>
                                    <div className="d-flex gap-2 mb-3">
                                        <div className="dropdown">
                                            <button className="filter-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                Trending
                                            </button>
                                            <ul className="dropdown-menu dropdown-dark">
                                                <li><a className="dropdown-item" href="#">Most Rated</a></li>
                                                <li><a className="dropdown-item" href="#">Most Used</a></li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="row g-3">
                                        <div className="col-6">
                                            <div role="button" onClick={() => setShowTemplateModal(true)}>
                                                <div className="template-card" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1534447677768-be436bb09401")' }}>
                                                    <div className="competition-content">
                                                        <div><span className="user-badge">1K User</span></div>
                                                        <div className="template-body mt-3">
                                                            <div className="mb-2 text-light">Cinematic Close-up</div>
                                                            <button className="use-btn text-light">Use</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-6">
                                            <div role="button" onClick={() => setShowTemplateModal(true)}>
                                                <div className="template-card" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1534447677768-be436bb09401")' }}>
                                                    <div className="competition-content">
                                                        <div><span className="user-badge">1K User</span></div>
                                                        <div className="template-body mt-3">
                                                            <div className="mb-2 text-light">Cinematic Close-up</div>
                                                            <button className="use-btn text-light">Use</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Offcanvas */}
            {showOffcanvas && (
                <>
                    <div className="offcanvas-backdrop fade show" onClick={() => setShowOffcanvas(false)}></div>
                    <div className="offcanvas offcanvas-end show" tabIndex="-1" style={{ visibility: 'visible' }}>
                        <div className="offcanvas-header">
                            <div className="d-flex flex-wrap gap-2 align-items-center">
                                <div><img src="/assets/profile.png" alt="" /></div>
                                <div>
                                    <h4 className="m-0 font-15 text-light">Junadi ALi</h4>
                                    <p className="m-0 font-13 font-light-2">@junaidali0077</p>
                                </div>
                            </div>
                            <button type="button" className="btn-close btn-close-white" onClick={() => setShowOffcanvas(false)}></button>
                        </div>
                        <div className="offcanvas-body">
                            <div className="row">
                                <div className="col-4">
                                    <div className="text-center">
                                        <h4 className="m-0 font-15 text-light font-weight-700">Posts</h4>
                                        <p className="m-0 font-13 font-light-2">40</p>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="text-center">
                                        <h4 className="m-0 font-15 text-light font-weight-700">Followers</h4>
                                        <p className="m-0 font-13 font-light-2">2.5k</p>
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="text-center">
                                        <h4 className="m-0 font-15 text-light font-weight-700">Following</h4>
                                        <p className="m-0 font-13 font-light-2">15</p>
                                    </div>
                                </div>
                            </div>
                            <div className="creditscore row mt-3">
                                <a href="#">
                                    <div className="d-flex flex-wrap justify-content-between align-items-center">
                                        <div className="d-flex flex-wrap gap-2 align-items-center">
                                            <div><img src="/assets/data-usage.png" alt="" /></div>
                                            <h4 className="font-14 font-weight-700 m-0 text-light mt-1">Ai Credit Usage</h4>
                                        </div>
                                        <div><img className="mt-1" src="/assets/arrow-right.png " alt="" /></div>
                                    </div>
                                </a>
                            </div>
                            <div className="mt-1">
                                <div className="progress-container">
                                    <div className="progress-text w-100 d-flex justify-content-between mb-1">
                                        <span className="font-13 font-weight-500 text-light">Spent 50</span>
                                        <span className="font-13 font-weight-500 text-light">Limit 100</span>
                                    </div>
                                </div>
                                <div className="progress-bar mt-1">
                                    <div className="progress-fill"></div>
                                </div>
                            </div>
                            <div className="sidenav-items mt-3">
                                <a href="#"><div className="py-2 border-bottom_1 d-flex gap-2 align-items-center"><img src="/assets/uil_setting.png" alt="" /><h4 className="font-15 font-weight-400 m-0 mt-1">Setting</h4></div></a>
                                <a href="#"><div className="py-2 border-bottom_1 d-flex gap-2 align-items-center"><img src="/assets/line-md_discord.png" alt="" /><h4 className="font-15 font-weight-400 m-0 mt-1">Discord</h4></div></a>
                                <div className="d-flex flex-wrap justify-content-between border-bottom_1 align-items-center">
                                    <div className="py-2 d-flex gap-2 align-items-center"><img src="/assets/fluent_dark-theme-20-filled.png" alt="" /><h4 className="font-15 font-weight-400 m-0 mt-1">Theme</h4></div>
                                    <div className="selectheme">
                                        <select className="form-select bg-dark text-white border-0">
                                            <option value="Light">Light</option>
                                            <option value="Dark">Dark</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="d-flex flex-wrap justify-content-between border-bottom_1 align-items-center">
                                    <div className="py-2 d-flex gap-2 align-items-center"><img src="/assets/clarity_language-line.png" alt="" /><h4 className="font-15 font-weight-400 m-0 mt-1">Language</h4></div>
                                    <div className="selectlang">
                                        <select className="form-select bg-dark text-white border-0">
                                            <option value="English">English</option>
                                            <option value="Hindi">Hindi</option>
                                        </select>
                                    </div>
                                </div>
                                <a href="#"><div className="py-2 border-bottom_1 d-flex gap-2 align-items-center"><img src="/assets/ix_support.png" alt="" /><h4 className="font-15 font-weight-400 m-0 mt-1">Help &amp; Support</h4></div></a>

                                <div className="logoutbtn text-center mt-3">
                                    <button className="btn-danger btn"><i className="fa-solid fa-right-from-bracket"></i> Logout</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Leader Profile Modal */}
            {showLeaderModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content leader-modal">
                            <button type="button" className="btn-close btn-close-white modal-close" onClick={() => setShowLeaderModal(false)}></button>
                            <div className="leader-header d-flex align-items-center gap-3">
                                <img src="https://i.pravatar.cc/150?img=1" className="leader-avatar" alt="avatar" />
                                <div>
                                    <h4 className="m-0 text-white"><i className="fa-solid fa-crown text-warning me-1"></i> Arjun Verma</h4>
                                    <p className="leader-category m-0">AI Art <i className="fa-solid fa-angle-right"></i></p>
                                    <p className="members mt-1"><i className="fa-solid fa-users"></i> 2.5k members</p>
                                </div>
                            </div>
                            <div className="modal-body pt-3">
                                <h6 className="section-title">Performance Stats</h6>
                                <div className="row g-3">
                                    <div className="col-6 col-md-3"><div className="stat-card"><i className="fa-solid fa-trophy"></i><p>Total Competitions</p><h5>87</h5></div></div>
                                    <div className="col-6 col-md-3"><div className="stat-card"><i className="fa-solid fa-medal"></i><p>Competitions Won</p><h5>22</h5></div></div>
                                    <div className="col-6 col-md-3"><div className="stat-card"><i className="fa-solid fa-chart-column"></i><p>Avg. Rank</p><h5>Top 2.8</h5></div></div>
                                    <div className="col-6 col-md-3"><div className="stat-card"><i className="fa-solid fa-fire"></i><p>Current Streak</p><h5>5 Days</h5></div></div>
                                </div>
                                <h6 className="section-title mt-4">Engagement Stats</h6>
                                <div className="engagement-grid">
                                    <div className="eng-card">❤️ Likes Received <span>58.3k</span></div>
                                    <div className="eng-card">👍 Reactions <span>97.8k</span></div>
                                    <div className="eng-card">💬 Comments <span>13.6k</span></div>
                                </div>
                                <h6 className="section-title mt-4">Achievements</h6>
                                <div className="row g-3">
                                    <div className="col-md-6"><div className="achievement-card purple">⭐ Top Creator</div></div>
                                    <div className="col-md-6"><div className="achievement-card green">🏆 Consistent Performer</div></div>
                                </div>
                            </div>
                            <div className="modal-footer border-0 d-flex justify-content-between">
                                <button className="btn btn-outline-light rounded-pill px-4">View Full Profile</button>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-dark rounded-pill px-4">Compare</button>
                                    <button className="btn btn-success rounded-pill px-4"><i className="fa-solid fa-user-plus"></i> Follow</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Competition Modal */}
            {showCompetitionModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-md">
                        <div className="modal-content competition-modal">
                            <button type="button" className="btn-close btn-close-white modal-close" onClick={() => setShowCompetitionModal(false)}></button>
                            <div className="modal-body p-4">
                                <p className="small text-light mb-1">Participate in</p>
                                <h4 className="competition-title">Cyberpink Legends</h4>
                                <div className="banner-img mt-3"></div>
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <div>
                                        <span className="badge trending-badge">🔥 Trending</span>
                                        <p className="participants mt-2 mb-0"><i className="fa-solid fa-users"></i> 2.5k Participants</p>
                                    </div>
                                    <div className="text-end">
                                        <small className="text-light">Time left</small>
                                        <h5 className="time-left">15H:20m:2s</h5>
                                    </div>
                                </div>
                                <div className="highlight-box mt-3">Stand out in a live competition with over <strong>2,500 creators!</strong></div>
                                <div className="mt-4 d-flex flex-wrap justify-content-between align-items-center">
                                    <div>
                                        <h6 className="section-title">What you'll Gain</h6>
                                        <div className="gain-list">
                                            <p>🏆 Win XP, Badges &amp; Rewards</p>
                                            <p>🔓 Unlock Achievements Badge</p>
                                            <p>📈 Climb the LeaderBoard</p>
                                        </div>
                                    </div>
                                    <div className="participants-avatars mt-2 d-flex flex-column align-items-center justify-content-center">
                                        <div>
                                            <img src="https://i.pravatar.cc/40?img=1" alt="avatar" />
                                            <img src="https://i.pravatar.cc/40?img=2" alt="avatar" />
                                            <img src="https://i.pravatar.cc/40?img=3" alt="avatar" />
                                            <img src="https://i.pravatar.cc/40?img=4" alt="avatar" />
                                        </div>
                                        <span className="more-text">+12 More Participating</span>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <h6 className="section-title">Competition Detail</h6>
                                    <span className="badge submission-badge">Image Submission</span>
                                    <ul className="detail-list mt-2">
                                        <li>Submit your best cyberpunk-themed artwork</li>
                                        <li>Follow specified guidelines &amp; rules</li>
                                        <li>Must submit before timer ends</li>
                                    </ul>
                                </div>
                                <div className="d-flex justify-content-between mt-4">
                                    <button className="btn btn-rules">View Rules</button>
                                    <button className="btn btn-confirm">Confirm Participation</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Template Preview Modal */}
            {showTemplateModal && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-md">
                        <div className="modal-content tpl-modal">
                            <button type="button" className="btn-close btn-close-white tpl-close" onClick={() => setShowTemplateModal(false)}></button>
                            <div className="modal-body p-4">
                                <div className="tpl-header text-center mb-3">
                                    <h6 className="tpl-title">Cinematic Close-Up</h6>
                                    <span className="tpl-chip">Cinematic</span>
                                </div>
                                <div className="tpl-preview-img"></div>
                                <div className="tpl-section mt-4">
                                    <h6 className="tpl-section-title">Prompt Preview</h6>
                                    <textarea className="tpl-prompt-input form-control" rows="4" defaultValue="Ultra-cinematic close-up portrait of [subject], dramatic lighting, shallow depth of field, high contrast, bokeh, cinematic sharp focus, sci-fi"></textarea>
                                </div>
                                <div className="tpl-section mt-3">
                                    <h6 className="tpl-section-title">Upload Your Image</h6>
                                    <div className="tpl-upload">
                                        <img src="https://i.pravatar.cc/60?img=14" alt="upload" />
                                        <div>
                                            <p className="mb-1">Upload image to apply this template</p>
                                            <small>JPG, PNG or WEBP, up to 20MB</small>
                                        </div>
                                        <button className="tpl-replace">Replace</button>
                                    </div>
                                </div>
                                <div className="tpl-stats mt-3">
                                    <span>👁 1K Uses</span>
                                    <span>⭐ 4.9+</span>
                                </div>
                                <div className="tpl-actions mt-4">
                                    <button className="tpl-btn-outline">Edit Prompt</button>
                                    <button className="tpl-btn-primary">Use Template</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Community;
