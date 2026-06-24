import { useEffect, useRef, useState } from "react";
import { StorePackageRequest } from "../types/locker";
import { packageStatusSyntax } from "./Constant";

type PackageSize = StorePackageRequest["packageSize"];

interface Option {
  value: PackageSize;
  label: string;
  description: string;
}

const SIZE_OPTIONS: Option[] = [
  {
    value: "SMALL",
    label: packageStatusSyntax.small,
    description: packageStatusSyntax.smDesc,
  },
  {
    value: "MEDIUM",
    label: packageStatusSyntax.medium,
    description: packageStatusSyntax.mdDesc,
  },
  {
    value: "LARGE",
    label: packageStatusSyntax.large,
    description: packageStatusSyntax.largeDesc,
  },
];

interface PackageSizeSelectProps {
  value: PackageSize;
  onChange: (value: PackageSize) => void;
  disabled?: boolean;
}

export default function PackageSizeSelect({
  value,
  onChange,
  disabled = false,
}: PackageSizeSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption =
    SIZE_OPTIONS.find((option) => option.value === value) ?? SIZE_OPTIONS[0];

  const close = (): void => setOpen(false);
  const toggle = (): void => {
    if (!disabled) {
      setOpen((isOpen) => !isOpen);
    }
  };

  useEffect(() => {
    if (disabled && open) {
      close();
      return;
    }

    if (!open) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        close();
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [disabled, open]);

  const handleSelect = (option: Option) => {
    onChange(option.value);
    close();
  };

  const handleKeyDown = (event: React.KeyboardEvent, option: Option) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect(option);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`custom-select${open ? " custom-select--open" : ""}${disabled ? " custom-select--disabled" : ""}`}
    >
      <button
        type="button"
        className="custom-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggle}
        disabled={disabled}
      >
        <span className="custom-select__trigger-label">
          {selectedOption.label}
        </span>
        <span className="custom-select__chevron" aria-hidden="true">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {/* Panel */}
      {open && !disabled && (
        <ul
          className="custom-select__panel"
          role="listbox"
          aria-label="Package size"
        >
          {SIZE_OPTIONS.map((option) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              tabIndex={0}
              className={`custom-select__option${option.value === value ? " custom-select__option--selected" : ""}`}
              onClick={() => handleSelect(option)}
              onKeyDown={(event) => handleKeyDown(event, option)}
            >
              <span className="custom-select__option-label">
                {option.label}
              </span>
              <span className="custom-select__option-desc">
                {option.description}
              </span>
              {option.value === value && (
                <svg
                  className="custom-select__option-check"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M3 8.5L6.5 12L13 5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
