import React, { useEffect, useState } from 'react';
import AuthPagesLayout from '../../layout/AuthPagesLayout';
import { MyInput as CustomInput } from '../../components/CustomInput/MyInput';
import CustomButton from '../../components/Buttons/CustomButton';
import OTPInput from '../../components/CustomInput/OTPInput';
import CustomSelect from '../../components/CustomInput/Select';
import { Link, useNavigate } from 'react-router-dom';
import ValidationError from '../../components/Error/ValidationError';
import { useSelector, useDispatch } from 'react-redux';
import { IoMdCheckmark } from 'react-icons/io';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { GET_STORAGE_ITEM, SET_STORAGE_ITEM } from '../../config/storage';

export const Register = () => {
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state.signup);
  const { data: all_states } = useSelector((state) => state.all_states);
  const { data: partner_group } = useSelector((state) => state.partner_group);
  const { data: partner_subgroup } = useSelector((state) => state.partner_subgroup);

  const navigate = useNavigate();

  const [currStep, setCurrStep] = useState(1);

  const [state, setState] = useState([{ label: 'Select State', value: 0 }]);
  const [partnerId, setPartnerId] = useState();

  const [category, setCategory] = useState([
    {
      value: 0,
      label: 'Select Category',
    },
  ]);

  const handleChangeCategory = (value) => setPartnerId(value);

  const [subCategory, setSubCategory] = useState([
    {
      value: 0,
      label: 'Select Sub Category',
    },
  ]);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
    },
    validationSchema: Yup.object().shape({
      firstName: Yup.string().required('First Name is required'),
      lastName: Yup.string().required('Last Name is required'),
      phone: Yup.string().required('Phone Number is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit(values) {
      SET_STORAGE_ITEM('phone', formik.values.phone);
      values.deviceToken = 'test_token';
      // dispatch(signupAction({ data: values, navigate }));
    },
  });

  const { errors, touched, handleSubmit, getFieldProps } = formik;

  // Create Business Formik
  const bizFormik = useFormik({
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
    },
    validationSchema: Yup.object().shape({
      category: Yup.string().required('Select category'),
      name: Yup.string().required('Name is required'),
      address: Yup.string().required('Address is required'),
      description: Yup.string().required('Description is required'),
      email: Yup.string().email('Please supply a valid email').required('Email is required'),
      phoneNumber: Yup.string().required('Phone Number is required'),
      partnerSubGroupId: Yup.string().required('Select subcategory'),
      stateId: Yup.string().required('Please select a state'),
    }),
    onSubmit(values) {
      delete values.category;
      values.deviceToken = 'test_token';
      dispatch(createPartnerAction({ data: values, navigate }));
    },
  });

  const {
    errors: biz_errors,
    touched: biz_touched,
    handleSubmit: biz_handleSubmit,
    getFieldProps: biz_getFieldProps,
    setFieldValue,
  } = bizFormik;

  const handleChangeSubCategory = (value) => setFieldValue('partnerSubGroupId', Number(value));

  const handleChangeState = (value) => setFieldValue('stateId', Number(value));

  useEffect(() => {
    dispatch(allStateAction());
    dispatch(partnerGroupAction());
  }, []);

  useEffect(() => {
    const formattedPartner = partner_group.map((group) => ({
      value: group.id,
      label: group.name,
    }));
    formattedPartner.unshift({ value: 0, label: 'Select Business Category' });
    setCategory(formattedPartner);
  }, [partner_group]);

  useEffect(() => {
    const formatted = all_states.map((state) => ({
      value: state.id,
      label: state.name,
    }));
    formatted.unshift({ value: 0, label: 'Select State' });
    setState(formatted);
  }, [all_states]);

  useEffect(() => {
    if (partnerId) dispatch(partnerSubGroupAction(partnerId));
  }, [partnerId]);

  useEffect(() => {
    const formattedPartner = partner_subgroup.map((group) => ({
      value: group.id,
      label: group.name,
    }));
    formattedPartner.unshift({ value: 0, label: 'Select Sub Category' });
    setSubCategory(formattedPartner);
  }, [partner_subgroup]);

  return (
    <div>
      <AuthPagesLayout>
        <div className="max-w-[500px] w-full mt-16 my-16 sm:my-10  flex flex-col self-start px-5">
          <div className="text-center">
            <p className="font-semibold text-3xl">Sign up</p>
            <p className="text-sm text-secondary-brown">
              Already have an account?{' '}
              <Link to={'/login'} className="text-primary font-medium">
                Login
              </Link>
            </p>
            <p className="text-sm mt-14">
              Join our vibrant community! Sign up now to unlock exclusive features and explore endless possibilities
              with us.
            </p>
          </div>

          {currStep === 1 ? (
            <div className="w-full">
              <form onSubmit={handleSubmit}>
                <div className="grid sm:grid-cols-2 gap-5 gap-y-6 !text-black">
                  <div>
                    <CustomInput
                      label={'First Name'}
                      className="!h-[50px]"
                      type={'text'}
                      placeholder={'John'}
                      id={'first_name'}
                      {...getFieldProps('firstName')}
                    />
                    {touched.firstName && errors.firstName && <ValidationError msg={errors.firstName} />}
                  </div>
                  <div>
                    <CustomInput
                      label={'Last Name'}
                      className="!h-[50px]"
                      type={'text'}
                      placeholder="Doe"
                      id={'last_name'}
                      {...getFieldProps('lastName')}
                    />
                    {touched.lastName && errors.lastName && <ValidationError msg={errors.lastName} />}
                  </div>
                  <div className="sm:col-span-2">
                    <CustomInput
                      label={'Email'}
                      className="!h-[50px]"
                      type={'text'}
                      placeholder={'Email'}
                      id={'email'}
                      {...getFieldProps('email')}
                    />{' '}
                    {touched.email && errors.email && <ValidationError msg={errors.email} />}
                  </div>
                  <div>
                    <CustomInput
                      placeholder={'Phone Number'}
                      label={'Phone Number'}
                      id={'phone'}
                      type={'text'}
                      className="transparent-bg !h-[50px]"
                      {...getFieldProps('phone')}
                    />{' '}
                    {touched.phone && errors.phone && <ValidationError msg={errors.phone} />}
                  </div>
                  <div>
                    <CustomInput
                      label={'Password'}
                      placeholder={'Password'}
                      id={'password'}
                      type={'password'}
                      className="transparent-bg !h-[50px]"
                      {...getFieldProps('password')}
                    />{' '}
                    {touched.password && errors.password && <ValidationError msg={errors.password} />}
                  </div>
                </div>
                <div className="ml-auto w-full sm:w-fit mt-10">
                  <CustomButton
                    // clickHandler={() => setCurrStep(2)}
                    className={'w-full'}
                    children={'Save and Next'}
                    type={'submit'}
                    loading={loading}
                    disabled={loading}
                  />
                </div>
              </form>
            </div>
          ) : null}

          {currStep === 3 ? (
            <form onSubmit={biz_handleSubmit} className="w-full mt-14">
              <div className="grid sm:grid-cols-2 gap-4 gap-y-5 sm:gap-y-7">
                <div>
                  <CustomSelect onChange={handleChangeCategory} options={category} />
                  {biz_touched.category && biz_errors.category && <ValidationError msg={biz_errors.category} />}
                </div>
                <div>
                  <CustomSelect options={subCategory} onChange={handleChangeSubCategory} />
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
                    {...biz_getFieldProps('address')}
                  />{' '}
                  {biz_touched.address && biz_errors.address && <ValidationError msg={biz_errors.address} />}
                </div>
                <div className="sm:col-span-2">
                  <CustomSelect options={state} onChange={handleChangeState} />
                  {biz_touched.stateId && biz_errors.stateId && <ValidationError msg={biz_errors.stateId} />}
                </div>
                <div className="sm:col-span-2">
                  <CustomInput
                    className={'!h-[50px]'}
                    type={'text'}
                    placeholder={'Business Description'}
                    id={'business_description'}
                    {...biz_getFieldProps('description')}
                  />{' '}
                  {biz_touched.description && biz_errors.description && (
                    <ValidationError msg={biz_errors.description} />
                  )}
                </div>
              </div>
              <div className=" mt-10 flex justify-end">
                <CustomButton
                  type={'submti'}
                  className={'w-full sm:w-fit '}
                  // clickHandler={() => navigate("/login")}
                  children={'Create Account'}
                />
              </div>
            </form>
          ) : null}
        </div>
      </AuthPagesLayout>
    </div>
  );
};

export * from './CreateBusiness';
export * from './VerifyAccount';
