import React from 'react';

export const ProgressBar = ({ steps }: { steps: { name: string; progress: number }[] }) => {
  return (
    <div className="w-2/3 max-w-2xl ml-3 space-y-4">
      {steps.map((step, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between text-sm font-medium text-gray-700">
            <span>{step.name}</span>
            <span>{step.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${step.progress}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};
