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
                        : 'bg-[var(--background)] border-[var(--border)] hover:border-[var(--foreground-secondary)]'
                    }
                    focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:ring-offset-2 focus:ring-offset-[var(--background)]
                `}
            >
                {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>
            {label && (
                <label
                    htmlFor={id}
                    className="text-sm text-[var(--foreground-secondary)] cursor-pointer select-none hover:text-[var(--foreground)] transition-colors"
                >
                    {label}
                </label>
            )}
        </div>
    );
}
