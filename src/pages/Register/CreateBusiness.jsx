import React, { useContext, useEffect, useRef, useState } from 'react';
import logo from '../../assets/images/logo.png';
import { FaAddressCard, FaEdit, FaTrash, FaUsers } from 'react-icons/fa';
import CustomSelect from '../../components/CustomInput/Select';
import { useDispatch, useSelector } from 'react-redux';
import ValidationError from '../../components/Error/ValidationError';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/Buttons/CustomButton';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { MdOutlineDescription } from 'react-icons/md';

import shoppingBag from '../../assets/images/image-shopping-bag-dd0f7627.svg';
import { IoMdCheckmark } from 'react-icons/io';
import { ImSpinner2 } from 'react-icons/im';
import customToast from '../../components/Toast/toastify';
// import { uploadImageAction } from '../../store/slices/appData/uploadImageSlice';

export const CreateBusiness = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const imgRef = useRef(null);
  const [state, setState] = useState([{ label: 'Select State', value: null }]);
  const [partnerId, setPartnerId] = useState(null);
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedFileName, setSelectedFileName] = useState(null);

  const { loading } = useSelector((state) => state.create_partner);
  const { data: all_states } = useSelector((state) => state.all_states);
  const { data: partner_group } = useSelector((state) => state.partner_group);
  const { data: partner_subgroup, loading: loadingSubGroup } = useSelector((state) => state.partner_subgroup);
  const [imageLoading, setImageLoading] = useState(false);

  const categories = [
    {
      title: 'Retail/MSME',
      desc: ' Supermarket, Online Store, Laundry etc',
      img: shoppingBag,
    },
    {
      title: 'Production/Supply',
      desc: 'Production and Supply Companies etc',
      img: shoppingBag,
    },
    {
      title: 'Logistics ',
      desc: ' Logistic Companies and Others etc',
      img: shoppingBag,
    },
  ];

  const [category, setCategory] = useState([
    {
      value: null,
      label: 'Select Category',
    },
  ]);

  const [subCategory, setSubCategory] = useState([
    {
      value: null,
      label: loadingSubGroup ? 'Loading Sub Categories...' : 'Select Sub Category',
    },
  ]);

  function openFileInput() {
    imgRef.current.click();
  }

  function onFileSelected(event) {
    const file = event.target?.files[0];
    if (file && file.size <= 1024 * 1024) {
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedFileName(file.name);
      };
      reader.readAsDataURL(file);
      uploadImage();
    } else {
      customToast('File is too large or not supported. Try again.', true);
    }
  }

  // Create Business Formik
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      category: partnerId,
      name: '',
      address: '',
      description: '',
      email: '',
      phoneNumber: '',
      partnerSubGroupId: '',
      stateId: '',
      logo: '',
    },
    validationSchema: Yup.object().shape({
      category: Yup.number()
        // .oneOf(["1", "2", "3", "4"], "Select Category")

        .required('Select category')
        .nonNullable('Please select a business category'),
      name: Yup.string().required('Name is required'),
      address: Yup.string().required('Address is required'),
      description: Yup.string().required('Description is required'),
      email: Yup.string().email('Please supply a valid email').required('Email is required'),
      phoneNumber: Yup.string().required('Phone Number is required'),
      partnerSubGroupId: Yup.mixed()
        .oneOf([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 'Select subcategory')
        .required('Select subcategory')
        .nonNullable("Field can't be null"),
      stateId: Yup.string().required('Please select a state').nonNullable("Field can't be null"),
    }),
    onSubmit(values) {
      // delete values.category;
      values.deviceToken = 'test_token';
      // dispatch(createPartnerAction({ data: values, navigate, setPartner }));
    },
  });

  const {
    errors: biz_errors,
    touched: biz_touched,
    handleSubmit: biz_handleSubmit,
    getFieldProps: biz_getFieldProps,
    setFieldValue,
  } = formik;

  const handleChangeSubCategory = (value) => setFieldValue('partnerSubGroupId', Number(value));

  const handleChangeState = (value) => setFieldValue('stateId', Number(value));

  const uploadImage = (e) => {
    const formData = new FormData();
    formData.append('image', imgRef.current.files[0]);
    setImageLoading(true);
    // UploadImage(formData)
    //   .then((res) => {
    //     setFieldValue('logo', res.imageUrl);
    //     customToast(res.message ?? 'Image uploaded');
    //   })
    //   .catch((e) => customToast(e.message, true))
    //   .finally(() => setImageLoading(false));
    // dispatch(uploadImageAction({ formData, formik, field: 'logo' }));
  };

  useEffect(() => {
    // dispatch(allStateAction());
    // dispatch(partnerGroupAction());
  }, []);

  return (
    <div className="w-full py-10 sm:py-20">
      <div className="w-[95%] sm:w-[570px] m-auto min-h-[500px]">
        <div className="text-center">
          <p className="text-lg font-semibold opacity-80">Create a New Business</p>
          <p className="text-sm  mt-3 w-[90%] m-auto">
            Empower your business aspirations today! Seamlessly create a new business venture with our robust,
            user-friendly tools for unparalleled growth and prosperity.
          </p>
        </div>
        <div className="border mt-10">
          <div className="bg-[#f5f8fd] text-sm w-full h-40 grid place-content-center text-center">
            {selectedFileName && !imageLoading ? (
              <p className="italic text-sm m-auto text-center"> {selectedFileName} </p>
            ) : (
              <img className="w-32 m-auto" src={logo} alt="logo" />
            )}
            <p className="text-center mt-3">Drag or Drop Company / Business Logo Here</p>
            {imageLoading ? (
              <div className=" cursor-pointer flex items-center justify-center gap-1 text-sm font-medium">
                <ImSpinner2 size={18} className=" text-green-800 animate-spin" />
                <span>Uploading...</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openFileInput()}
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

          <div className="p-5 sm:p-7">
            <form onSubmit={biz_handleSubmit} className="w-full mt-7">
              <div className="mb-7">
                <p className="text-sm font-medium opacity-80 mb-2 ">Select Your business category</p>
                <div className="grid sm:grid-cols-3 gap-4">
                  {categories.map((cat, idx) => (
                    <div
                      onClick={() => {
                        setFieldValue('category', idx + 1);
                        setPartnerId(idx + 1);
                      }}
                      key={idx}
                      className={`cursor-pointer flex items-center gap-1 border p-1 pr-2 rounded ${
                        partnerId == idx + 1 && 'border !border-primary'
                      }`}
                    >
                      <img className="w-10" src={cat.img} alt="shopping-bag" />
                      <div>
                        <p className="text-xs font-medium">{cat.title}</p>
                        <p className="text-[10px]">{cat.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {biz_touched.category && biz_errors.category && <ValidationError msg={biz_errors.category} />}
              </div>
              <div className="grid sm:grid-cols-2 gap-5 gap-y-5 sm:gap-y-7">
                <div className="sm:col-span-2">
                  <CustomSelect allowFirstOption={true} options={subCategory} onChange={handleChangeSubCategory} />
                  {biz_touched.partnerSubGroupId && biz_errors.partnerSubGroupId && (
                    <ValidationError msg={biz_errors.partnerSubGroupId} />
                  )}
                </div>
                <div className="sm:col-span-2 ">
                  <CustomInput
                    className={'!h-[50px]'}
                    type={'text'}
                    placeholder={'Company Name'}
                    id={'company_name'}
                    hasIcon
                    Icon={FaUsers}
                    {...biz_getFieldProps('name')}
                  />
                  {biz_touched.name && biz_errors.name && <ValidationError msg={biz_errors.name} />}
                </div>
                <div>
                  <CustomInput
                    className={'!h-[50px]'}
                    type={'email'}
                    placeholder="Business Email"
                    id={'partner_email'}
                    {...biz_getFieldProps('email')}
                  />{' '}
                  {biz_touched.email && biz_errors.email && <ValidationError msg={biz_errors.email} />}
                </div>
                <div>
                  <CustomInput
                    className={'!h-[50px]'}
                    type={'busisness_phone'}
                    placeholder="Business Phone Number"
                    id={'partner_phone'}
                    {...biz_getFieldProps('phoneNumber')}
                  />{' '}
                  {biz_touched.phoneNumber && biz_errors.phoneNumber && (
                    <ValidationError msg={biz_errors.phoneNumber} />
                  )}
                </div>
                <div className="sm:col-span-2">
                  <CustomInput
                    className={'!h-[50px]'}
                    type={'text'}
                    placeholder={'Company Address'}
                    id={'company_address'}
                    hasIcon
                    Icon={FaAddressCard}
                    {...biz_getFieldProps('address')}
                  />{' '}
                  {biz_touched.address && biz_errors.address && <ValidationError msg={biz_errors.address} />}
                </div>
                <div className="sm:col-span-2">
                  <CustomSelect allowFirstOption options={state} onChange={handleChangeState} />
                  {biz_touched.stateId && biz_errors.stateId && <ValidationError msg={biz_errors.stateId} />}
                </div>
                <div className="sm:col-span-2">
                  <CustomInput
                    className={'!h-[50px]'}
                    type={'text'}
                    placeholder={'Business Description'}
                    id={'business_description'}
                    hasIcon={true}
                    Icon={MdOutlineDescription}
                    {...biz_getFieldProps('description')}
                  />{' '}
                  {biz_touched.description && biz_errors.description && (
                    <ValidationError msg={biz_errors.description} />
                  )}
                </div>
              </div>
              <div className="mt-14 my-7 flex justify-end">
                <CustomButton
                  loading={loading}
                  disabled={loading}
                  type={'submit'}
                  className={'w-full '}
                  children={'Submit Information'}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
      <p className=" text-sm text-center mt-3 ">
        Don't know what's happening here?{' '}
        <Link className="text-primary font-medium" to={-1}>
          Go Back
        </Link>
      </p>
    </div>
  );
};
