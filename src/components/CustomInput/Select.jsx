import React from 'react';
import { BiCaretDown } from 'react-icons/bi';

const CustomSelect = ({ disabled, options, allowFirstOption, className, label, onChange, emptyMsg }) => {
  return (
    <div className="relative w-full">
      {label ? (
        <label htmlFor={''} className="block text-sm">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <select
          onChange={(e) => onChange(parseInt(e.target.value))}
          disabled={disabled}
          className={` text-gray-600 w-full h-[50px] appearance-none px-2 py-3 rounded border focus-within:border-primary hover:border-primary outline-none mt-1 text-sm ${className}`}
        >
          {options && options?.length && (
            <>
              <option value={''}>{'Select'}</option>
              {options.map((option, idx) => (
                <option key={idx} value={option.value}>
                  {option.label}
                </option>
              ))}
            </>
          )}
          {!options?.length ? (
            <option disabled={!allowFirstOption}>{emptyMsg ?? 'No item to choose from'}</option>
          ) : null}
        </select>
        <BiCaretDown className="absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none" />
      </div>
    </div>
  );
};

export default CustomSelect;
