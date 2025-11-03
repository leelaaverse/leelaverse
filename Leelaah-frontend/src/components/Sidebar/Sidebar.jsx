import React from 'react';
import './Sidebar.css';

const Sidebar = () => {
    return (
        <div
            className="offcanvas offcanvas-end"
            tabIndex="-1"
            id="offcanvasRight"
            aria-labelledby="offcanvasRightLabel"
        >
            <div className="offcanvas-header">
                <div className="d-flex flex-wrap gap-2 align-items-center">
                    <div>
                        <img src="/assets/profile.png" alt="" />
                    </div>
                    <div>
                        <h4 className="m-0 font-15 text-light">Junadi ALi</h4>
                        <p className="m-0 font-13 font-light-2">@junaidali0077</p>
                    </div>
                </div>
                <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="offcanvas"
                    aria-label="Close"
                ></button>
            </div>
            <div className="offcanvas-body">
                {/* Stats Row */}
                <div className="row">
                    <div className="col-md-4">
                        <div className="text-center">
                            <h4 className="m-0 font-15 text-light font-weight-700">Posts</h4>
                            <p className="m-0 font-13 font-light-2">40</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="text-center">
                            <h4 className="m-0 font-15 text-light font-weight-700">
                                Followers
                            </h4>
                            <p className="m-0 font-13 font-light-2">2.5k</p>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="text-center">
                            <h4 className="m-0 font-15 text-light font-weight-700">
                                Following
                            </h4>
                            <p className="m-0 font-13 font-light-2">15</p>
                        </div>
                    </div>
                </div>

                {/* Credit Score */}
                <div className="creditscore row mt-3">
                    <a href="">
                        <div className="d-flex flex-wrap justify-content-between align-items-center">
                            <div className="d-flex flex-wrap gap-2 align-items-center">
                                <div>
                                    <img src="/assets/data-usage.png" alt="" />
                                </div>
                                <h4 className="font-14 font-weight-700 m-0 text-light mt-1">
                                    Ai Credit Usage
                                </h4>
                            </div>
                            <div>
                                <img className="mt-1" src="/assets/arrow-right.png " alt="" />
                            </div>
                        </div>
                    </a>
                </div>

                {/* Progress Bar */}
                <div className="mt-1">
                    <div className="progress-container">
                        <div className="progress-text">
                            <span className="font-13 font-weight-500 text-light">
                                Spent 50
                            </span>
                            <span className="font-13 font-weight-500 text-light">
                                Limit 100
                            </span>
                        </div>
                    </div>
                    <div className="progress-bar mt-1">
                        <div className="progress-fill"></div>
                    </div>
                </div>

                {/* Navigation Items */}
                <div className="sidenav-items mt-3">
                    <a href="#">
                        <div className="py-2 border-bottom_1 d-flex gap-2 align-items-center">
                            <img src="/assets/lucide_user.png" alt="" />
                            <h4 className="font-15 font-weight-400 m-0 mt-1">View Profile</h4>
                        </div>
                    </a>
                    <a href="#">
                        <div className="py-2 border-bottom_1 d-flex gap-2 align-items-center">
                            <img src="/assets/mdi_account-cog-outline.png" alt="" />
                            <h4 className="font-15 font-weight-400 m-0 mt-1">Account</h4>
                        </div>
                    </a>
                    <a href="#">
                        <div className="py-2 border-bottom_1 d-flex gap-2 align-items-center">
                            <img src="/assets/uil_setting.png" alt="" />
                            <h4 className="font-15 font-weight-400 m-0 mt-1">Setting</h4>
                        </div>
                    </a>
                    <a href="#">
                        <div className="py-2 border-bottom_1 d-flex gap-2 align-items-center">
                            <img src="/assets/line-md_discord.png" alt="" />
                            <h4 className="font-15 font-weight-400 m-0 mt-1">Discord</h4>
                        </div>
                    </a>

                    {/* Theme Selector */}
                    <div className="d-flex flex-wrap justify-content-between border-bottom_1 align-items-center">
                        <div className="py-2 d-flex gap-2 align-items-center">
                            <img src="/assets/fluent_dark-theme-20-filled.png" alt="" />
                            <h4 className="font-15 font-weight-400 m-0 mt-1">Theme</h4>
                        </div>
                        <div className="selectheme">
                            <select name="" id="">
                                <option value="Light">Light</option>
                                <option value="Dark">Dark</option>
                            </select>
                        </div>
                    </div>

                    {/* Language Selector */}
                    <div className="d-flex flex-wrap justify-content-between border-bottom_1 align-items-center">
                        <div className="py-2 d-flex gap-2 align-items-center">
                            <img src="/assets/clarity_language-line.png" alt="" />
                            <h4 className="font-15 font-weight-400 m-0 mt-1">Language</h4>
                        </div>
                        <div className="selectlang">
                            <select name="" id="">
                                <option value="English">English</option>
                                <option value="Hindi">Hindi</option>
                            </select>
                        </div>
                    </div>

                    <a href="#">
                        <div className="py-2 border-bottom_1 d-flex gap-2 align-items-center">
                            <img src="/assets/ix_support.png" alt="" />
                            <h4 className="font-15 font-weight-400 m-0 mt-1">
                                Help & Support
                            </h4>
                        </div>
                    </a>

                    {/* Logout Button */}
                    <div className="logoutbtn text-center mt-3">
                        <button className="btn-danger btn">
                            <i className="fa-solid fa-right-from-bracket"></i>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
