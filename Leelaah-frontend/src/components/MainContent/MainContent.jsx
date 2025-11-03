import React from 'react';
import './MainContent.css';

const MainContent = ({ activeTab }) => {
    const featuredImages = {
        large: ['/assets/Frame_1.png', '/assets/Frame_2.png'],
        small: [
            '/assets/1.png',
            '/assets/2.png',
            '/assets/3.png',
            '/assets/4.png',
        ],
    };

    const trendingImages = {
        large: ['/assets/Frame_2.png', '/assets/Frame_1.png'],
        small: [
            '/assets/2.png',
            '/assets/4.png',
            '/assets/3.png',
            '/assets/1.png',
        ],
    };

    const followingImages = {
        large: ['/assets/Frame_2.png', '/assets/Frame_2.png'],
        small: [
            '/assets/4.png',
            '/assets/1.png',
            '/assets/3.png',
            '/assets/2.png',
        ],
    };

    const getImages = () => {
        switch (activeTab) {
            case 'featured':
                return featuredImages;
            case 'trending':
                return trendingImages;
            case 'following':
                return followingImages;
            default:
                return featuredImages;
        }
    };

    const images = getImages();

    return (
        <main className="mainContent tab-content my-4" id="pills-tabContent">
            <div className="container-fluid">
                {/* Large Images Row */}
                <div className="row mainContentRow">
                    <div className="col-md-6">
                        <div>
                            <img src={images.large[0]} alt="" width="100%" />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div>
                            <img src={images.large[1]} alt="" width="100%" />
                        </div>
                    </div>
                </div>

                {/* Small Images Row 1 */}
                <div className="row mt-3 mainContentRow">
                    {images.small.map((img, index) => (
                        <div className="col-md-3" key={`row1-${index}`}>
                            <div>
                                <img src={img} alt="" width="100%" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Small Images Row 2 */}
                <div className="row mt-3 mainContentRow">
                    {images.small.map((img, index) => (
                        <div className="col-md-3" key={`row2-${index}`}>
                            <div>
                                <img src={img} alt="" width="100%" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
};

export default MainContent;
