import React from 'react';

const getScoreColor = (score: number) => {
    if (score > 66) return 'bg-green-100 text-green-800 border-green-300';
    if (score > 33) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
};

const AiLeadScoreBadge: React.FC<{ score?: number; rationale?: string }> = ({ score, rationale }) => {
    if (typeof score !== 'number') return null;
    return (
        <div className="relative group">
            <span className={`px-3 py-1 text-sm font-bold leading-5 rounded-full border ${getScoreColor(score)}`}>
                AI Lead Score: {score}
            </span>
            {rationale && (
                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 bg-gray-800 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-lg">
                    <h4 className="font-bold border-b border-gray-600 pb-1 mb-1">AI Rationale</h4>
                    <p>{rationale}</p>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
                </div>
            )}
        </div>
    );
};

export default AiLeadScoreBadge;
