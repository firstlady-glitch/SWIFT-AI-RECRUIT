import { Check } from 'lucide-react';

interface CheckboxProps {
    id: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    className?: string;
}

export function Checkbox({ id, checked, onChange, label, className = '' }: CheckboxProps) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <button
                type="button"
                id={id}
                role="checkbox"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`
                    w-5 h-5 rounded border flex items-center justify-center transition-all duration-200
                    ${checked
                        ? 'bg-[var(--primary-blue)] border-[var(--primary-blue)] text-white'
                        : 'bg-[#0b0c0f] border-gray-700 hover:border-gray-500'
                    }
                    focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:ring-offset-2 focus:ring-offset-[#15171e]
                `}
            >
                {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>
            {label && (
                <label
                    htmlFor={id}
                    className="text-sm text-gray-400 cursor-pointer select-none hover:text-gray-300 transition-colors"
                    onClick={() => onChange(!checked)}
                >
                    {label}
                </label>
            )}
        </div>
    );
}
