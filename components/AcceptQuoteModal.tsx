import React, { useState } from 'react';
import { CloseIcon } from './icons/Icons';

interface AcceptQuoteModalProps {
    quoteId: string;
    onClose: () => void;
    onConfirm: (signerName: string) => void;
}

const AcceptQuoteModal: React.FC<AcceptQuoteModalProps> = ({ quoteId, onClose, onConfirm }) => {
    const [signerName, setSignerName] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);

    const canConfirm = signerName.trim().length > 2 && agreed;

    const handleConfirm = () => {
        if (!canConfirm) return;
        setIsConfirming(true);
        // Simulate a slight delay for better UX
        setTimeout(() => {
            onConfirm(signerName);
        }, 500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 transform transition-all dark:bg-gray-800">
                <div className="p-6 border-b flex justify-between items-center dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Accept Quote {quoteId}</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Close">
                        <CloseIcon />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label htmlFor="signerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="signerName"
                            value={signerName}
                            onChange={(e) => setSignerName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                            placeholder="Please type your full name"
                        />
                    </div>
                    <div>
                        <label htmlFor="signature" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                           Digital Signature
                        </label>
                         <div className="mt-1 p-3 bg-gray-50 border rounded-md dark:bg-gray-700/50 dark:border-gray-600">
                            <span className="font-serif text-2xl text-gray-800 dark:text-gray-200">{signerName || "..."}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Typing your name above constitutes a legally binding digital signature.</p>
                    </div>

                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="agree"
                                name="agree"
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="focus:ring-brand-accent h-4 w-4 text-brand-primary border-gray-300 rounded"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="agree" className="font-medium text-gray-700 dark:text-gray-300">
                                I agree to the terms and conditions of this quotation.
                            </label>
                            <p className="text-gray-500 dark:text-gray-400">By checking this box, you confirm your acceptance of the services and costs outlined.</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end items-center p-6 bg-gray-50 rounded-b-lg space-x-3 dark:bg-gray-900/50 dark:border-t dark:border-gray-700">
                    <button onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 font-semibold text-sm dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirm} 
                        disabled={!canConfirm || isConfirming} 
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-md text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isConfirming ? 'Confirming...' : 'Confirm Acceptance'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AcceptQuoteModal;