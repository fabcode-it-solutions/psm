import * as RadixSelect from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import { SelectOption } from './Select';

interface MultiSelectProps {
  options: SelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  error?: boolean;
  className?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select options...',
  error = false,
  className = '',
}) => {
  const toggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const selectedLabels = options
    .filter(option => value.includes(option.value))
    .map(option => option.label);

  return (
    <RadixSelect.Root>
      <RadixSelect.Trigger
        className={`
          w-full flex items-center justify-between px-4 py-3 bg-white 
          text-gray-900 text-sm border rounded-lg min-h-[44px]
          focus:outline-none focus:ring-1 focus:border-transparent
          ${error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-200 focus:ring-blue-500'
          }
          ${className}
        `}
      >
        <div className="flex flex-wrap gap-1">
          {selectedLabels.length > 0 ? (
            selectedLabels.map((label, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
              >
                {label}
              </span>
            ))
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <RadixSelect.Icon>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          className="bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-auto"
          position="popper"
          sideOffset={5}
        >
          <RadixSelect.Viewport className="p-1">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => toggleOption(option.value)}
                className="
                  flex items-center px-3 py-2 text-sm text-gray-900
                  hover:bg-blue-50 rounded cursor-pointer
                "
              >
                <div
                  className={`
                    w-4 h-4 border border-gray-300 rounded mr-3
                    ${value.includes(option.value)
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-white'
                    }
                  `}
                >
                  {value.includes(option.value) && (
                    <Check className="w-3 h-3 text-white m-0.5" />
                  )}
                </div>
                {option.label}
              </div>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
};