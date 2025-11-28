import React, { useState } from 'react';
import { Users, Baby } from 'lucide-react';

interface ToothChartProps {
  selectedTeeth: number[];
  onToothToggle: (toothNumber: number) => void;
  toothConditions?: { [key: number]: string }; // Track tooth conditions for visual reference
}

const ToothChart: React.FC<ToothChartProps> = ({
  selectedTeeth,
  onToothToggle,
  toothConditions = {},
}) => {
  const [chartMode, setChartMode] = useState<'adult' | 'child'>('adult');

  // FDI Tooth Numbering System
  const adultTeeth = {
    upperRight: [18, 17, 16, 15, 14, 13, 12, 11],
    upperLeft: [21, 22, 23, 24, 25, 26, 27, 28],
    lowerLeft: [38, 37, 36, 35, 34, 33, 32, 31],
    lowerRight: [41, 42, 43, 44, 45, 46, 47, 48],
  };

  const childTeeth = {
    upperRight: [55, 54, 53, 52, 51],
    upperLeft: [61, 62, 63, 64, 65],
    lowerLeft: [75, 74, 73, 72, 71],
    lowerRight: [81, 82, 83, 84, 85],
  };

  const currentTeeth = chartMode === 'adult' ? adultTeeth : childTeeth;

  // Get tooth display name
  const getToothName = (number: number): string => {
    const position = number % 10;
    
    const positions = ['', 'Central', 'Lateral', 'Canine', '1st Premolar', '2nd Premolar', '1st Molar', '2nd Molar', '3rd Molar'];
    const childPositions = ['', '1st Incisor', '2nd Incisor', 'Canine', '1st Molar', '2nd Molar'];
    
    const isChild = number >= 50;
    const positionNames = isChild ? childPositions : positions;
    
    return `${number} - ${positionNames[position] || 'Tooth'}`;
  };

  // Tooth SVG component
  const Tooth: React.FC<{ number: number; isSelected: boolean; onClick: () => void }> = ({
    number,
    isSelected,
    onClick,
  }) => {
    const hasCondition = toothConditions[number];
    
    return (
      <g onClick={onClick} className="cursor-pointer group">
        <title>{getToothName(number)}</title>
        <path
          d="M 10 5 Q 15 0, 20 5 L 18 25 Q 15 28, 12 25 Z"
          fill={
            isSelected
              ? '#22c55e'
              : hasCondition
              ? '#f59e0b'
              : '#ffffff'
          }
          stroke={isSelected ? '#16a34a' : '#94a3b8'}
          strokeWidth="1.5"
          className="transition-all group-hover:fill-brand-100 group-hover:stroke-brand-500"
        />
        <text
          x="15"
          y="18"
          textAnchor="middle"
          className="text-[8px] font-bold pointer-events-none select-none"
          fill={isSelected ? '#ffffff' : '#374151'}
        >
          {number}
        </text>
        {isSelected && (
          <circle cx="15" cy="8" r="3" fill="#16a34a" className="animate-pulse" />
        )}
      </g>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="text-2xl">🦷</span>
          Tooth Chart (FDI System)
        </h3>
        
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setChartMode('adult')}
            className={`px-4 py-2 rounded-md font-semibold transition flex items-center gap-2 ${
              chartMode === 'adult'
                ? 'bg-brand-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Users size={16} />
            Adult (32)
          </button>
          <button
            onClick={() => setChartMode('child')}
            className={`px-4 py-2 rounded-md font-semibold transition flex items-center gap-2 ${
              chartMode === 'child'
                ? 'bg-brand-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Baby size={16} />
            Child (20)
          </button>
        </div>
      </div>

      {selectedTeeth.length > 0 && (
        <div className="mb-4 bg-green-50 border border-green-300 rounded-lg p-3">
          <p className="text-sm font-semibold text-green-800">
            Selected: {selectedTeeth.length} tooth/teeth
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedTeeth.map((tooth) => (
              <span
                key={tooth}
                className="px-2 py-1 bg-green-200 text-green-800 text-xs font-bold rounded"
              >
                {tooth}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <svg viewBox="0 0 800 600" className="w-full h-auto" style={{ maxHeight: '500px' }}>
          <text x="400" y="30" textAnchor="middle" className="text-sm font-bold fill-gray-700">
            UPPER JAW (Maxilla)
          </text>

          <g transform="translate(50, 60)">
            <text x="100" y="0" textAnchor="middle" className="text-xs fill-gray-500 font-semibold">
              Right
            </text>
            {currentTeeth.upperRight.map((tooth, index) => (
              <g key={tooth} transform={`translate(${index * 40}, 20)`}>
                <Tooth
                  number={tooth}
                  isSelected={selectedTeeth.includes(tooth)}
                  onClick={() => onToothToggle(tooth)}
                />
              </g>
            ))}
          </g>

          <g transform="translate(430, 60)">
            <text x="100" y="0" textAnchor="middle" className="text-xs fill-gray-500 font-semibold">
              Left
            </text>
            {currentTeeth.upperLeft.map((tooth, index) => (
              <g key={tooth} transform={`translate(${index * 40}, 20)`}>
                <Tooth
                  number={tooth}
                  isSelected={selectedTeeth.includes(tooth)}
                  onClick={() => onToothToggle(tooth)}
                />
              </g>
            ))}
          </g>

          <line x1="400" y1="80" x2="400" y2="520" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" />
          <text x="405" y="300" className="text-xs fill-gray-400 font-semibold">Midline</text>

          <text x="400" y="570" textAnchor="middle" className="text-sm font-bold fill-gray-700">
            LOWER JAW (Mandible)
          </text>

          <g transform="translate(430, 360)">
            {currentTeeth.lowerLeft.map((tooth, index) => (
              <g key={tooth} transform={`translate(${index * 40}, 20)`}>
                <Tooth
                  number={tooth}
                  isSelected={selectedTeeth.includes(tooth)}
                  onClick={() => onToothToggle(tooth)}
                />
              </g>
            ))}
            <text x="100" y="80" textAnchor="middle" className="text-xs fill-gray-500 font-semibold">
              Left
            </text>
          </g>

          <g transform="translate(50, 360)">
            {currentTeeth.lowerRight.map((tooth, index) => (
              <g key={tooth} transform={`translate(${index * 40}, 20)`}>
                <Tooth
                  number={tooth}
                  isSelected={selectedTeeth.includes(tooth)}
                  onClick={() => onToothToggle(tooth)}
                />
              </g>
            ))}
            <text x="100" y="80" textAnchor="middle" className="text-xs fill-gray-500 font-semibold">
              Right
            </text>
          </g>

          <g transform="translate(600, 250)">
            <text x="0" y="0" className="text-xs font-bold fill-gray-700">Legend:</text>
            
            <rect x="0" y="10" width="20" height="20" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
            <text x="25" y="24" className="text-xs fill-gray-600">Available</text>

            <rect x="0" y="40" width="20" height="20" fill="#22c55e" stroke="#16a34a" strokeWidth="1.5" />
            <text x="25" y="54" className="text-xs fill-gray-600">Selected</text>

            <rect x="0" y="70" width="20" height="20" fill="#f59e0b" stroke="#d97706" strokeWidth="1.5" />
            <text x="25" y="84" className="text-xs fill-gray-600">Condition</text>
          </g>
        </svg>
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <span className="font-bold">💡 Tip:</span> Click on any tooth to select/deselect it for treatment planning. 
          Multiple teeth can be selected. FDI numbering system is used internationally.
        </p>
      </div>
    </div>
  );
};

export default ToothChart;
