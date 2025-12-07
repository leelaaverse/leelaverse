import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

const ModelSelector = ({ models, selectedModelId, onSelect, disabled, placeholder = "Select a model" }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
	const triggerRef = useRef(null);
	const dropdownRef = useRef(null);

	// Calculate position when opening
	useEffect(() => {
		if (isOpen && triggerRef.current) {
			const updatePosition = () => {
				const rect = triggerRef.current.getBoundingClientRect();
				setPosition({
					top: rect.bottom + 8,
					left: rect.left,
					width: rect.width
				});
			};
			updatePosition();
			window.addEventListener('scroll', updatePosition, true);
			window.addEventListener('resize', updatePosition);

			return () => {
				window.removeEventListener('scroll', updatePosition, true);
				window.removeEventListener('resize', updatePosition);
			};
		}
	}, [isOpen]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				triggerRef.current && !triggerRef.current.contains(event.target) &&
				dropdownRef.current && !dropdownRef.current.contains(event.target)
			) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
			return () => document.removeEventListener('mousedown', handleClickOutside);
		}
	}, [isOpen]);

	const handleToggle = () => {
		if (!disabled) setIsOpen(!isOpen);
	};

	const handleSelect = (model) => {
		onSelect(model.id);
		setIsOpen(false);
	};

	const selectedModel = models.find(m => m.id === selectedModelId);

	// Helper to get icon based on model name/id
	const getModelIcon = (model) => {
		const name = model.name.toLowerCase();
		const id = model.id.toLowerCase();

		if (name.includes('flux') || id.includes('flux')) return '⚡';
		if (name.includes('nano') || id.includes('nano')) return '🔷';
		if (name.includes('seedream') || id.includes('seedream')) return '📊';
		if (name.includes('video') || id.includes('video')) return '🎬';
		if (name.includes('face') || id.includes('face')) return '😊';
		if (name.includes('character') || id.includes('character')) return '👨‍🚀';

		return '✨'; // Default
	};

	const isPremium = (model) => {
		return model.name.toLowerCase().includes('pro') ||
		       model.name.toLowerCase().includes('premium') ||
		       model.id.includes('pro');
	};

	// Dropdown component that will be portaled
	const DropdownMenu = () => (
		<div
			ref={dropdownRef}
			style={{
				position: 'fixed',
				top: `${position.top}px`,
				left: `${position.left}px`,
				width: `${position.width}px`,
				zIndex: 999999,
			}}
		>
			<div className="bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
				{/* Header */}
				<div className="px-4 py-3 border-b border-white/5">
					<span className="text-xs uppercase tracking-wide text-white/50 font-semibold">
						Select Model
					</span>
				</div>

				{/* Models List */}
				<div className="max-h-80 overflow-y-auto p-2" style={{ overflowY: 'auto' }}>
					{models.map((model) => (
						<button
							key={model.id}
							type="button"
							onClick={() => handleSelect(model)}
							className={`
								w-full flex items-center gap-3 p-3 rounded-lg
								hover:bg-white/5 transition-all duration-150
								${selectedModelId === model.id ? 'bg-purple-500/15' : ''}
							`}
						>
							{/* Icon */}
							<div className="flex items-center justify-center w-8 h-8 bg-white/5 rounded-lg text-lg flex-shrink-0">
								{getModelIcon(model)}
							</div>

							{/* Content */}
							<div className="flex-1 text-left min-w-0">
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium text-white/90 truncate">
										{model.name}
									</span>
									{isPremium(model) && (
										<span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-green-500/20 text-green-400 rounded">
											Premium
										</span>
									)}
								</div>
								<p className="text-xs text-white/50 truncate mt-0.5">
									{model.description}
								</p>
							</div>

							{/* Check Icon */}
							{selectedModelId === model.id && (
								<i className="fa-solid fa-check text-xs text-purple-500 flex-shrink-0"></i>
							)}
						</button>
					))}
				</div>
			</div>
		</div>
	);

	return (
		<>
			<div className="w-full">
				{/* Trigger Button */}
				<button
					ref={triggerRef}
					type="button"
					onClick={handleToggle}
					disabled={disabled}
					className={`
						w-full flex items-center justify-between gap-3
						px-4 py-3 rounded-xl
						bg-white/5 border border-white/10
						hover:bg-white/10 hover:border-purple-500/40
						transition-all duration-200
						${isOpen ? 'border-purple-500 bg-[#141414]' : ''}
						${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
					`}
				>
					<div className="flex items-center gap-3">
						{selectedModel ? (
							<>
								<span className="text-lg">{getModelIcon(selectedModel)}</span>
								<span className="text-sm font-medium text-white">{selectedModel.name}</span>
							</>
						) : (
							<span className="text-sm text-white/50">{placeholder}</span>
						)}
					</div>
					<i className={`fa-solid fa-chevron-down text-xs text-white/40 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
				</button>
			</div>

			{/* Portal the dropdown to body */}
			{isOpen && ReactDOM.createPortal(<DropdownMenu />, document.body)}

			<style>{`
				@keyframes fadeIn {
					from {
						opacity: 0;
						transform: translateY(-8px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
				.animate-fadeIn {
					animation: fadeIn 0.2s ease-out;
				}
			`}</style>
		</>
	);
};

export default ModelSelector;
