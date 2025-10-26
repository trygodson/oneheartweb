import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { SlCalender } from 'react-icons/sl';
import Editor from 'react-simple-wysiwyg';
export default function CustomInput({
  value,
  defaultValue,
  className,
  containerClassName = '',
  placeholder,
  label,
  type = 'text',
  id,
  hasIcon,
  Icon,
  ...rest
}) {
  const [inputType, setInputType] = useState('password');
  // const [value, setValue] = useState();
  const handleChangeType = () => {
    if (inputType == 'password') setInputType('text');
    else setInputType('password');
  };

  return (
    <div className={`w-full ${containerClassName}`}>
      {label ? (
        <label htmlFor={id} className="block text-sm mb-0.5 text-primary">
          {label}
        </label>
      ) : null}
      <div className="relative w-full">
        <input
          value={value}
          defaultValue={defaultValue ?? null}
          autoComplete="off"
          placeholder={placeholder ?? ''}
          type={type == 'password' ? inputType : type}
          className={` bg-white mt-1 text-black block !w-full rounded p-3 py-[14px] text-sm border outline-none focus:border-primary ${className}`}
          id={id}
          {...rest}
        />
        {type == 'password' && (
          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2">
            {inputType == 'password' ? (
              <FiEye size={17} onClick={handleChangeType} color="black" />
            ) : (
              <FiEyeOff size={17} onClick={handleChangeType} color="black" />
            )}
          </button>
        )}

        {type == 'data' && <SlCalender className="absolute right-3 top-1/2 -translate-y-1/2" />}

        {hasIcon && <Icon />}
      </div>
    </div>
  );
}
export function CustomDescriptionInput({ label, className, id, value: vValue = null, onChange = () => null }) {
  const [value, setValue] = useState(vValue);
  // const [value, setValue] = useState();
  const handleChangeType = () => {};

  return (
    <div className="">
      {label ? (
        <label htmlFor={id} className="block text-sm mb-0.5 text-primary">
          {label}
        </label>
      ) : null}
      <div className="relative w-full">
        <Editor
          value={value}
          className={className ?? ''}
          onChange={(e) => {
            onChange(e.target.value);
            setValue(e.target.value);
          }}
          name={id}
        />
      </div>
    </div>
  );
}
export function AutoCompleteInput({
  defaultValue,
  className,
  placeholder,
  label,
  type = 'text',
  id,
  hasIcon,
  onChange,
  Icon,
  ...rest
}) {
  const [inputType, setInputType] = useState('password');
  const [value, setValue] = useState(null);
  const handleChangeType = () => {
    if (inputType == 'password') setInputType('text');
    else setInputType('password');
  };

  // console.log(value, '------value----');

  return (
    <div className="">
      {label ? (
        <label htmlFor={id} className="block text-sm mb-0.5 text-primary">
          {label}
        </label>
      ) : null}
      <div className="relative w-full">
        {/* <input
          defaultValue={defaultValue ?? null}
          autoComplete="off"
          placeholder={placeholder ?? ""}
          type={type == "password" ? inputType : type}
          className={` bg-white mt-1 block !w-full rounded p-3 py-[14px] text-sm border outline-none focus:border-primary ${className}`}
          id={id}
          {...rest}
        /> */}
        {/* <GooglePlacesAutocomplete
          apiKey={GOOGLE_APIKEY}
          apiOptions={{}}
          autocompletionRequest={{
            // bounds: [
            //   {
            //     lat: 9.05785,
            //     lng: 7.49508,
            //   },
            // ],
            radius: 5000,
            componentRestrictions: {
              country: ['ng'],
            },
            location: {
              lat: 9.05785,
              lng: 7.49508,
            },
          }}
          selectProps={{
            value,
            onChange: (v) => {
              geocodeByAddress(v.label)
                .then((results) => getLatLng(results[0]))
                .then(({ lat, lng }) => onChange({ lat, long: lng, label: v.label }))
                .catch((err) => console.log(err, '-----err fetching lat lang---'));
              setValue(v);
            },
            styles: {
              container: (provided) => ({
                ...provided,
                backgroundColor: '#f3f4f6',
                padding: '4px',
                borderRadius: '5px',
                border: '0px solid transparent',
                outline: 'none',
                color: 'black',
              }),

              valueContainer: (provided) => ({
                ...provided,
                color: 'black',
              }),
              indicatorsContainer: (provided) => ({
                ...provided,
                backgroundColor: '#f3f4f6',
                color: 'black',
              }),
              indicatorSeparator: (provided) => ({
                ...provided,
                backgroundColor: '#f3f4f6',
                borderRadius: '10px',
                color: 'black',
              }),

              control: (provided, state) => ({
                ...provided,
                backgroundColor: '#f3f4f6',
                color: 'black',
                border: state.isFocused ? 0 : 0,
                boxShadow: state.isFocused ? 0 : 0,
                '&:hover': {
                  border: state.isFocused ? 0 : 0,
                },
              }),
            },
          }}
        /> */}
        {type == 'password' && (
          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2">
            {inputType == 'password' ? (
              <FiEye size={17} onClick={handleChangeType} />
            ) : (
              <FiEyeOff size={17} onClick={handleChangeType} />
            )}
          </button>
        )}

        {type == 'data' && <SlCalender className="absolute right-3 top-1/2 -translate-y-1/2" />}

        {hasIcon && <Icon size={18} className="opacity-50 absolute right-3 top-1/2 -translate-y-1/2" />}
      </div>
    </div>
  );
}
