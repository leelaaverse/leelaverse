import React, { useState } from 'react';
import './GenerateModal.css';

const GenerateModal = ({ isOpen, onClose }) => {
    const [modalStep, setModalStep] = useState('generate'); // 'generate', 'upload', 'ai', 'next'
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [aiTab, setAiTab] = useState('image');
    const [uploadType, setUploadType] = useState('draft');
    const [formData, setFormData] = useState({
        prompt: '',
        caption: '',
        model: 'auto',
        aspectRatio: '1x1'
    });

    const handleClose = () => {
        resetModal();
        onClose();
    };

    const resetModal = () => {
        setModalStep('generate');
        setSelectedFile(null);
        setImagePreview(null);
        setAiTab('image');
        setUploadType('draft');
        setFormData({
            prompt: '',
            caption: '',
            model: 'auto',
            aspectRatio: '1x1'
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBrowseFiles = () => {
        setModalStep('upload');
    };

    const handleGenerateAI = () => {
        setModalStep('ai');
    };

    const handleBackToGenerate = () => {
        setModalStep('generate');
    };

    const handleNext = () => {
        if (imagePreview) {
            setModalStep('next');
        }
    };

    const handleBackToCrop = () => {
        setModalStep('upload');
    };

    const handleBackToAI = () => {
        setModalStep('ai');
    };

    const handleUploadTypeToggle = (type) => {
        setUploadType(type);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRunAI = () => {
        if (!formData.prompt.trim()) {
            alert('Please enter a prompt');
            return;
        }
        console.log('Generating AI with:', formData);
        alert('AI generation will be implemented with backend API');
    };

    const handleShare = () => {
        console.log('Sharing post:', formData);
        alert('Post sharing will be implemented with backend API');
        handleClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Generate Modal - First Modal */}
            {modalStep === 'generate' && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" onClick={handleClose}>
                    <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content bg-dark text-light rounded-4 p-3">
                            <div className="modal-header justify-content-center border-0">
                                <h4 className="modal-title font-20 font-weight-700">Choose An Option</h4>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white position-absolute end-0 me-3"
                                    onClick={handleClose}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="rounded-20 bghightlight border-grey p-4 text-center d-flex flex-column justify-content-center align-items-center">
                                            <h5 className="font-16 font-weight-700 mb-3">Upload Post</h5>
                                            <div className="mb-3">
                                                <img src="/assets/upload-2.png" alt="" />
                                            </div>
                                            <button
                                                className="btn btn-primary w-75 font-14 rounded-pill"
                                                onClick={handleBrowseFiles}
                                            >
                                                Browse Files
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="rounded-20 bghightlight border-grey p-4 text-center d-flex flex-column justify-content-center align-items-center">
                                            <h5 className="font-16 font-weight-700 mb-3">Create Ai</h5>
                                            <div className="mb-3">
                                                <img src="/assets/ai-idea.png" alt="" />
                                            </div>
                                            <button
                                                className="btn btn-success w-75 font-14 rounded-pill"
                                                onClick={handleGenerateAI}
                                            >
                                                Generate AI
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Upload Modal - Second Modal */}
            {modalStep === 'upload' && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" onClick={handleBackToGenerate}>
                    <div className="modal-dialog modal-dialog-1 modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content bg-dark text-light rounded-4">
                            <div className="modal-header bghightlight justify-content-between align-items-center border-0">
                                <button className="btn_none" onClick={handleBackToGenerate}>
                                    <i className="fa-solid fa-arrow-left text-light"></i>
                                </button>
                                <h5 className="m-0 p-0 font-16 font-weight-700">Crop</h5>
                                <button className="btn_none" onClick={handleNext}>
                                    <h5 className="text-primary m-0 p-0 font-14">Next</h5>
                                </button>
                            </div>
                            <div className="modal-body position-relative p-0">
                                <input
                                    type="file"
                                    id="fileInput"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                                {imagePreview ? (
                                    <div className="text-center position-relative">
                                        <img src={imagePreview} alt="" className="img-fluid" />
                                        <div className="crop-btns d-flex justify-content-between align-items-center position-relative">
                                            <div className="dropdown">
                                                <button
                                                    className="btn_none crop-btns-2"
                                                    type="button"
                                                    data-bs-toggle="dropdown"
                                                >
                                                    <img src="/assets/gg_ratio.png" alt="" />
                                                </button>
                                                <ul className="dropdown-menu dropdown-menu-dark">
                                                    <li>
                                                        <a className="dropdown-item ratio-item" href="#" data-ratio="1:1">
                                                            1:1 (Square)
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a className="dropdown-item ratio-item" href="#" data-ratio="16:9">
                                                            16:9 (Widescreen)
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a className="dropdown-item ratio-item" href="#" data-ratio="4:5">
                                                            4:5 (Portrait)
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a className="dropdown-item ratio-item" href="#" data-ratio="9:16">
                                                            9:16 (Story)
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                            <button className="btn_none crop-btns-1">
                                                <img src="/assets/box-multiple.png" alt="" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center p-5">
                                        <img src="/assets/demo-image.png" alt="" className="img-fluid" />
                                        <div className="mt-3">
                                            <button
                                                className="btn btn-primary rounded-pill px-4"
                                                onClick={() => document.getElementById('fileInput').click()}
                                            >
                                                Select Image
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Modal - Third Modal */}
            {modalStep === 'ai' && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" onClick={handleBackToGenerate}>
                    <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content bg-dark text-light rounded-4">
                            <div className="modal-header bghightlight justify-content-center align-items-center border-0">
                                <button className="btn_none position-absolute start-0 ms-3" onClick={handleBackToGenerate}>
                                    <i className="fa-solid fa-arrow-left text-light"></i>
                                </button>
                                <ul className="nav nav-pills rounded-pill border-grey px-3 py-1" role="tablist">
                                    <li className="nav-item" role="presentation">
                                        <button
                                            className={`nav-link nav-linkImage font-12 ${aiTab === 'image' ? 'active' : ''}`}
                                            onClick={() => setAiTab('image')}
                                        >
                                            image
                                        </button>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <button
                                            className={`nav-link font-12 nav-linkImage ${aiTab === 'video' ? 'active' : ''}`}
                                            onClick={() => setAiTab('video')}
                                        >
                                            video
                                        </button>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <button
                                            className={`nav-link font-12 nav-linkImage ${aiTab === 'audio' ? 'active' : ''}`}
                                            onClick={() => setAiTab('audio')}
                                        >
                                            audio
                                        </button>
                                    </li>
                                </ul>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white position-absolute end-0 me-3"
                                    onClick={handleClose}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="tab-content">
                                    {aiTab === 'image' && (
                                        <div className="tab-pane fade show active">
                                            <div className="mb-1">
                                                <div className="row">
                                                    <div className="col-md-12">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <label className="form-label font-12 font-weight-600 mb-2">PROMPT</label>
                                                            <div className="d-flex gap-2 align-items-center">
                                                                <img src="/assets/ri_dvd-ai-line.png" alt="" />
                                                                <p className="mb-0 font-12 fadefont">Spend 150 Credit Coins</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row mt-2">
                                                    <div className="col-md-12 position-relative">
                                                        <textarea
                                                            className="form-control prompttextarea fadefont font-12"
                                                            rows="4"
                                                            name="prompt"
                                                            value={formData.prompt}
                                                            onChange={handleInputChange}
                                                            placeholder="Describe what you want to generate..."
                                                        ></textarea>
                                                        <div className="prompt-btns-1">
                                                            <button className="btn_none">
                                                                <img src="/assets/mage_image-upload.png" alt="" />
                                                            </button>
                                                        </div>
                                                        <div className="prompt-btns-2">
                                                            <button className="btn_none">
                                                                <i className="fa-solid fa-xmark"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row mt-3">
                                                    <div className="col-md-4">
                                                        <div className="model-section">
                                                            <label className="model-label mb-2">MODEL</label>
                                                            <div className="model-select-wrapper">
                                                                <select
                                                                    className="model-dropdown"
                                                                    name="model"
                                                                    value={formData.model}
                                                                    onChange={handleInputChange}
                                                                >
                                                                    <option value="auto">Auto</option>
                                                                    <option value="gpt-4">GPT-4</option>
                                                                    <option value="gpt-5">GPT-5</option>
                                                                    <option value="gpt-mini">GPT-5 Mini</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="aspect-section">
                                                            <label className="aspect-label mb-2">ASPECT RATIO</label>
                                                            <div className="aspect-wrapper">
                                                                <select
                                                                    className="aspect-select"
                                                                    name="aspectRatio"
                                                                    value={formData.aspectRatio}
                                                                    onChange={handleInputChange}
                                                                >
                                                                    <option value="1x1">1:1</option>
                                                                    <option value="16x9">16:9</option>
                                                                    <option value="4x3">4:3</option>
                                                                    <option value="9x16">9:16</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-5">
                                                        <label className="model-label mb-2">UPLOAD TYPE</label>
                                                        <div className="upload-type" role="tablist">
                                                            <button
                                                                type="button"
                                                                className={`upload-btn ${uploadType === 'draft' ? 'upload-btn--active' : 'upload-btn--inactive'}`}
                                                                onClick={() => handleUploadTypeToggle('draft')}
                                                            >
                                                                Upload to Draft
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className={`upload-btn ${uploadType === 'profile' ? 'upload-btn--active' : 'upload-btn--inactive'}`}
                                                                onClick={() => handleUploadTypeToggle('profile')}
                                                            >
                                                                Upload to Profile
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row mt-4">
                                                    <div className="col-md-12 text-center">
                                                        <button
                                                            className="btn btn-primary rounded-pill px-5 py-2 font-14"
                                                            onClick={handleRunAI}
                                                        >
                                                            Generate <img src="/assets/si_ai-fill.png" alt="" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {aiTab === 'video' && (
                                        <div className="tab-pane fade show active">
                                            <p className="text-center text-muted py-5">Video generation coming soon...</p>
                                        </div>
                                    )}
                                    {aiTab === 'audio' && (
                                        <div className="tab-pane fade show active">
                                            <p className="text-center text-muted py-5">Audio generation coming soon...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Next Modal - Fourth Modal */}
            {modalStep === 'next' && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" onClick={handleBackToCrop}>
                    <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content bg-dark text-light rounded-4">
                            <div className="modal-header bghightlight justify-content-between align-items-center border-0">
                                <button className="btn_none" onClick={handleBackToCrop}>
                                    <i className="fa-solid fa-arrow-left text-light"></i>
                                </button>
                                <h5 className="m-0 p-0 font-16 font-weight-700">Upload Post</h5>
                                <button className="btn_none" onClick={handleShare}>
                                    <h5 className="text-primary m-0 p-0 font-14">Share</h5>
                                </button>
                            </div>
                            <div className="modal-body p-0">
                                <div className="row p-0 m-0">
                                    <div className="col-md-6 m-0 p-0">
                                        <div className="text-center bg-black" style={{ minHeight: '500px' }}>
                                            {imagePreview && (
                                                <img
                                                    src={imagePreview}
                                                    alt=""
                                                    className="img-fluid"
                                                    style={{ maxHeight: '500px', objectFit: 'contain' }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-6 m-0 p-0">
                                        <div className="px-4 py-3">
                                            <div className="d-flex align-items-center gap-2 mb-3">
                                                <img src="/assets/ellipse4.png" alt="" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                                                <p className="mb-0 font-14 font-weight-600">junaidali0077</p>
                                            </div>
                                            <div className="position-relative mb-3">
                                                <textarea
                                                    className="posttextarea fadefont font-13"
                                                    rows="4"
                                                    name="caption"
                                                    value={formData.caption}
                                                    onChange={handleInputChange}
                                                    placeholder="Share something about the picture..."
                                                ></textarea>
                                                <div className="d-flex justify-content-between align-items-center mt-2">
                                                    <button className="btn_none">
                                                        <img src="/assets/emoji-16-regular.png" alt="" />
                                                    </button>
                                                    <p className="mb-0 font-12 fadefont">0/2000</p>
                                                </div>
                                            </div>
                                            <div className="border-bottom_1 pb-2 mb-2">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <h6 className="mb-0 font-14 font-weight-600">Add Location</h6>
                                                    <img src="/assets/mi_location.png" alt="" />
                                                </div>
                                            </div>
                                            <div className="border-bottom_1 pb-2 mb-2">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <h6 className="mb-0 font-14 font-weight-600">Add Collaborators</h6>
                                                    <img src="/assets/hugeicons_ai-user.png" alt="" />
                                                </div>
                                            </div>
                                            <div className="pb-2 mb-2">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <h6 className="mb-0 font-14 font-weight-600">Advance setting</h6>
                                                    <img src="/assets/icon-park-outline_down.png" alt="" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GenerateModal;
