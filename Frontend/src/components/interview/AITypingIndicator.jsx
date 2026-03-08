import React from 'react';

const AITypingIndicator = ({ isAIThinking }) => {
    if (!isAIThinking) return null;

    return (
        <>
            <style>
                {`
          @keyframes typing-bounce {
            0%, 60%, 100% {
              transform: translateY(0);
            }
            30% {
              transform: translateY(-4px);
            }
          }
          .typing-dot {
            animation: typing-bounce 0.8s infinite ease-in-out;
          }
        `}
            </style>
            <div className="flex justify-start mb-4 px-1">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center justify-center gap-[6px] w-fit h-[42px]">
                    <div
                        className="w-[7px] h-[7px] bg-blue-600 rounded-full typing-dot"
                        style={{ animationDelay: '0s' }}
                    ></div>
                    <div
                        className="w-[7px] h-[7px] bg-blue-600 rounded-full typing-dot"
                        style={{ animationDelay: '0.15s' }}
                    ></div>
                    <div
                        className="w-[7px] h-[7px] bg-blue-600 rounded-full typing-dot"
                        style={{ animationDelay: '0.3s' }}
                    ></div>
                </div>
            </div>
        </>
    );
};

export default AITypingIndicator;
