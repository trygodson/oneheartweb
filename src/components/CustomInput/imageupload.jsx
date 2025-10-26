import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const ImageComponent = ({
  onChangeFunction,
  label,
  hasIcon = false,
  Icon,
  id,
  placeHolder = '',
  className = '',
  setFieldValue,
  fieldName,
  ...rest
}) => {
  const [imageUrl, setImageUrl] = useState();
  const [fileName, setFileName] = useState(placeHolder);
  const dispatch = useDispatch();
  const imgPickerRef = useRef(null);

  function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16),
    );
  }

  const handleFileChange = async (e) => {
    let image = e.target.files[0];

    let blob = image.slice(0, image.size);
    let newFile = new File([blob], `${uuidv4()}_logo.jpg`, { type: `${image.type}` });

    let formData = new FormData();
    formData.append('image', newFile);
    setFileName(e.target.files[0].name);
    setFieldValue(fieldName, 'https://cdn.pixabay.com/photo/2014/11/13/06/12/boy-529067_1280.jpg');
    // console.log(e.target.files);
    // dispatch(imageUploadAsyncAction(formData)).then((res) => {
    //   if (res.meta.requestStatus === 'fulfilled')
    //     setImageUrl(res.payload.imageUrl);
    //     if (onChangeFunction) onChangeFunction(res?.payload?.imageUrl);
    //     if (props.addDocument) {
    //       props.formik.setFieldValue(props.name, res?.payload?.imageUrl);
    //     }
    //   }
    // });
  };

  function handleUpdatePhoto() {
    // const payload = { imageURL: imageUrl };
    // dispatch(changeImageAction(payload)).then(() => dispatch(userDetailAction()));
    // dispatch(staffDetailsAction({ id: regularId }));
  }

  return (
    <div className="">
      {label ? (
        <label htmlFor={id} className="block text-sm mb-0.5 text-primary">
          {label}
        </label>
      ) : null}
      <div
        className={`relative w-full bg-white mt-1 block !w-full rounded p-3 py-[14px] text-sm border outline-none focus:border-primary ${className}`}
      >
        <input
          // defaultValue={defaultValue ?? null}
          // autoComplete="off"
          // placeholder={placeholder ?? ''}
          name="file"
          type="file"
          onChange={(v) => handleFileChange(v)}
          className={`absolute inset-0 w-full opacity-0 cursor-pointer `}
          id={id}
          {...rest}
        />
        <span className="text-sm text-gray-400">{fileName}</span>
        {hasIcon && <Icon size={18} className="opacity-50 absolute right-3 top-1/2 -translate-y-1/2" />}
      </div>
    </div>
  );
};

export default ImageComponent;
