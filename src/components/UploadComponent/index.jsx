import { useRef, useState } from 'react';
import { UploadImageService, UploadVideoService } from '../../Services';
import customToast from '../Toast/toastify';
import { ImSpinner2 } from 'react-icons/im';
import { FaEdit } from 'react-icons/fa';

export const UploadVideoComponent = ({ title, onUploadSuccess = () => null }) => {
  const imgRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  function onFileSelected(event) {
    const file = event.target?.files[0];
    if (file && file.size <= 120 * 1024 * 1024) {
      setSelectedFileName();
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {};
      reader.readAsDataURL(file);
      setImageLoading(true);
      const formData = new FormData();
      formData.append('file', imgRef.current.files[0]);
      UploadVideoService(formData, setUploadProgress)
        .then((res) => {
          if (res) {
            setSelectedFileName(file.name);
            onUploadSuccess(res);
          }
        })
        .catch((err) => {
          customToast('Error Uploading Video. ' + err?.message ?? '', true);
        })
        .finally((d) => {
          setImageLoading(false);
        });
    } else {
      customToast('File is too large or not supported. Try again.', true);
    }
  }

  return (
    <div className="bg-[#f5f8fd] text-sm w-full h-40 grid place-content-center text-center mb-3">
      {selectedFileName && !imageLoading ? (
        <p className="italic text-sm m-auto text-center">{selectedFileName}</p>
      ) : (
        <p></p>
      )}
      <p className="text-center mt-3">{title ?? 'Election Cover Video'}</p>
      {imageLoading ? (
        <div className=" cursor-pointer flex items-center justify-center gap-1 text-sm font-medium">
          <ImSpinner2 size={18} className=" text-green-800 animate-spin" />
          <span>Uploading...</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => imgRef.current.click()}
          className="m-auto flex items-center gap-1 text-blue-900 font-semibold"
        >
          <span>
            <FaEdit />
          </span>
          <span>Browse File</span>
        </button>
      )}
      <input hidden ref={imgRef} onChange={onFileSelected} accept="video/*" type="file" />
    </div>
  );
};
export const UploadImageComponent = ({ title, onUploadSuccess = () => null }) => {
  const imgRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  function onFileSelected(event) {
    const file = event.target?.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedFileName(file.name);
      };
      reader.readAsDataURL(file);
      setImageLoading(true);
      // console.log(imgRef.current.files[0], 'imgRef.current.files[0]', reader);
      const formData = new FormData();
      formData.append('file', imgRef.current.files[0]);
      UploadImageService(formData, setUploadProgress)
        .then((res) => {
          if (res) {
            onUploadSuccess(res);
          }
        })
        .catch((err) => {
          customToast('Error Uploading Image. ' + err?.message ?? '', true);
        })
        .finally((d) => {
          setImageLoading(false);
        });
    } else {
      customToast('File is too large or not supported. Try again.', true);
    }
  }

  return (
    <div className="bg-[#f5f8fd] text-sm w-full h-40 grid place-content-center text-center mb-3">
      {selectedFileName && !imageLoading ? (
        <p className="italic text-sm m-auto text-center">{selectedFileName}</p>
      ) : (
        <p></p>
      )}
      <p className="text-center mt-3">{title ?? 'Election Cover Photo'}</p>
      {imageLoading ? (
        <div className=" cursor-pointer flex items-center justify-center gap-1 text-sm font-medium">
          <ImSpinner2 size={18} className=" text-green-800 animate-spin" />
          <span>Uploading...</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => imgRef.current.click()}
          className="m-auto flex items-center gap-1 text-blue-900 font-semibold"
        >
          <span>
            <FaEdit />
          </span>
          <span>Browse File</span>
        </button>
      )}
      <input hidden ref={imgRef} onChange={onFileSelected} accept="image/*" type="file" />
    </div>
  );
};
