import React, { useContext, useEffect, useState } from 'react';
import { BiCaretDown } from 'react-icons/bi';
import { BsPlus } from 'react-icons/bs';
import { ImSpinner2 } from 'react-icons/im';
import { RiServiceFill } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { GET_STORAGE_ITEM } from '../../config/storage';
import shoppingBag from '../../assets/images/image-shopping-bag-dd0f7627.svg';

const CustomDropdown = ({ setSwitching }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  let partner = GET_STORAGE_ITEM('account');
  const [loading, setLoading] = useState(false);

  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isBusinessesOpen, setBusinessesOpen] = useState(false);
  // const { data: businesses, loading } = useSelector((state) => state.getMe);

  const handleDropdownToggle = () => {
    setDropdownOpen((prev) => !prev);
  };

  const switchAccount = (id) => {
    setSwitching(true);
    // dispatch(switchAccountAction({ id, setSwitching, dispatch, setPartner }));
  };

  useEffect(() => {
    // dispatch(getUserAccountAction());
  }, []);

  return (
    <div className="relative">
      <div
        onClick={() => {
          handleDropdownToggle();
          setBusinessesOpen(false);
        }}
      >
        <Title partner={partner} />
      </div>
      {isDropdownOpen && (
        <div className="text-sm absolute p-3 dropdown-list bg-white rounded-md top-14 min-w-full  z-10 shadow">
          <div
            className="hover:bg-bg/50 hover:!text-primary cursor-pointer rounded px-2"
            onClick={() => {
              navigate('/create-business');
            }}
          >
            <div className="whitespace-nowrap flex items-center gap-2 py-1">
              <BsPlus size={30} />
              <p> Add Business</p>
            </div>
          </div>
          <div className="text-sm ">
            {!loading ? (
              <>
                {/* {businesses.map((biz, idx) => (
                  <div
                    key={idx}
                    className={`${
                      partner?.id === biz.id && '!hidden'
                    } border-t hover:bg-bg/50 hover:!text-primary cursor-pointer hover:rounded`}
                    onClick={() => {
                      switchAccount(biz.id);
                      handleDropdownToggle();
                    }}
                  >
                    <div className="w-max min-w-[170px] whitespace-nowrap flex items-center gap-2 py-2.5 px-3">
                      <img className="w-6 h-6 rounded-full" src={biz.logo || shoppingBag} alt="business logo" />
                      <p>{biz.name}</p>
                    </div>
                  </div>
                ))} */}
              </>
            ) : (
              <p className="mt-2 text-sm flex items-center text-gray-500 gap-2 whitespace-nowrap m-auto ml-4 mx-5 ">
                <ImSpinner2 className="animate-spin" />
                Loading businesses
              </p>
            )}
          </div>
        </div>
      )}

      {/* {switching ? (
        <div className="z-10 w-full text-lg fixed inset-0 bg-black/70 grid place-content-center text-white/80">
          <p className="font-semibold flex items-center gap-2 whitespace-nowrap m-auto mx-5 ">
            <ImSpinner2 size={18} className="animate-spin" />
            Switching Account...
          </p>
          <p className="font-medium text-sm text-center">Please wait.</p>
        </div>
      ) : null} */}
    </div>
  );
};

const Title = ({ partner }) => {
  return (
    <button className="border bg-white border-primary/30 rounded-md px-3 py-2.5 flex items-center gap-2 text-primary">
      {partner?.partner?.name ? (
        <img className="w-6 h-6 rounded-full" src={partner?.partner?.logo || shoppingBag} alt="" />
      ) : (
        <RiServiceFill size={18} className="text-current" />
      )}
      <span className="font-medium">{partner?.partner?.name ?? 'Loading...'}</span>
      <BiCaretDown className="text-current ml-5" />
    </button>
  );
};

export default CustomDropdown;
