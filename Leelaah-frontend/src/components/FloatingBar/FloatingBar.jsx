import React from 'react';
import './FloatingBar.css';

const FloatingBar = () => {
    return (
        <section className="floating-bar">
            <div className="row justify-content-center">
                <div className="col-md-5">
                    <div className="rounded-pill f-conatiner d-flex flex-wrap justify-content-between px-5 py-1 align-items-center">
                        <div>
                            <button>
                                <img src="/assets/home-rounded.svg" alt="" />
                                <p className="f-bar-label">Browse</p>
                            </button>
                        </div>
                        <div>
                            <button>
                                <img src="/assets/search.svg" alt="" />
                                <p className="f-bar-label">Explore</p>
                            </button>
                        </div>
                        <div>
                            <button className="px-4 py-3 generateBtn rounded-pill bg-dark">
                                <div className="">
                                    <img src="/assets/add-outline.svg" alt="" />
                                    <p className="f-bar-label">Generate</p>
                                </div>
                            </button>
                        </div>
                        <div>
                            <button>
                                <img src="/assets/globe.svg" alt="" />
                                <p className="f-bar-label">Community</p>
                            </button>
                        </div>
                        <div>
                            <button>
                                <img src="/assets/play-list.svg" alt="" />
                                <p className="f-bar-label">Reels</p>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FloatingBar;
