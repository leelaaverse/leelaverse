import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const PostProgressContext = createContext(null);

export const usePostProgress = () => {
    const ctx = useContext(PostProgressContext);
    if (!ctx) throw new Error('usePostProgress must be used inside PostProgressProvider');
    return ctx;
};

export const PostProgressProvider = ({ children }) => {
    const [isActive, setIsActive] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [stage, setStage] = useState('idle'); // idle | preparing | uploading | processing | saving | done | error | generating
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [taskType, setTaskType] = useState('post'); // 'post' | 'generate'
    const intervalRef = useRef(null);

    const stages = ['Preparing upload...', 'Uploading to cloud...', 'Processing media...', 'Saving post...'];

    const startPost = useCallback(async (postFn) => {
        setIsActive(true);
        setTaskType('post');
        setStage('preparing');
        setProgress(5);
        setMessage(stages[0]);
        setErrorMsg('');

        // Simulate stage progression
        let prog = 5;
        let stageIdx = 0;
        intervalRef.current = setInterval(() => {
            prog = Math.min(prog + 3 + Math.random() * 4, 92);
            stageIdx = prog < 25 ? 0 : prog < 55 ? 1 : prog < 80 ? 2 : 3;
            const stageNames = ['preparing', 'uploading', 'processing', 'saving'];
            setProgress(prog);
            setStage(stageNames[stageIdx]);
            setMessage(stages[stageIdx]);
        }, 1500);

        try {
            const result = await postFn();
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setProgress(100);
            setStage('done');
            setMessage(result?.message || 'Post published! 🎉');

            // Auto dismiss after 3s
            setTimeout(() => {
                setIsActive(false);
                setIsMinimized(false);
                setStage('idle');
                setProgress(0);
                setMessage('');
            }, 3500);

            return result;
        } catch (err) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setStage('error');
            setProgress(0);
            setErrorMsg(err?.message || 'Post failed');
            setMessage('Post failed');
            return null;
        }
    }, []);

    // Start generation tracking (video/image gen minimizable progress)
    const startGeneration = useCallback(({ mediaType = 'video' } = {}) => {
        setIsActive(true);
        setTaskType('generate');
        setStage('generating');
        setProgress(5);
        setMessage(`Generating ${mediaType}...`);
        setErrorMsg('');
    }, []);

    // Update generation progress (called from CreateModal during generation)
    const updateGenerationProgress = useCallback((prog, msg) => {
        setProgress(prog);
        if (msg) setMessage(msg);
    }, []);

    // Complete generation
    const completeGeneration = useCallback((success = true, msg = '') => {
        if (success) {
            setProgress(100);
            setStage('done');
            setMessage(msg || 'Generation complete! 🎉');
            setTimeout(() => {
                setIsActive(false);
                setIsMinimized(false);
                setStage('idle');
                setProgress(0);
                setMessage('');
                setTaskType('post');
            }, 3500);
        } else {
            setStage('error');
            setProgress(0);
            setErrorMsg(msg || 'Generation failed');
            setMessage('Generation failed');
        }
    }, []);

    const minimize = useCallback(() => {
        setIsMinimized(true);
    }, []);

    const restore = useCallback(() => {
        setIsMinimized(false);
    }, []);

    const dismiss = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsActive(false);
        setIsMinimized(false);
        setStage('idle');
        setProgress(0);
        setMessage('');
        setErrorMsg('');
        setTaskType('post');
    }, []);

    return (
        <PostProgressContext.Provider value={{
            isActive, isMinimized, stage, progress, message, errorMsg, taskType,
            startPost, minimize, restore, dismiss,
            startGeneration, updateGenerationProgress, completeGeneration
        }}>
            {children}
        </PostProgressContext.Provider>
    );
};

export default PostProgressContext;
