import React, { useState } from 'react';
import CustomButton from '../Buttons/CustomButton';
import { BiPlus } from 'react-icons/bi';
import { CgSearch } from 'react-icons/cg';
import ComingSoon from '../Modal/ComingSoon';

const TableTop = ({ what_to_import, what_to_add, addHandler, searchTerm, setSearchTerm }) => {
  const [comingSoonModal, setComingSoonModal] = useState(false);
  const openComingSoonModal = () => setComingSoonModal(true);

  return (
    <div className="w-full flex gap-4 pt-3">
      <CustomButton
        clickHandler={addHandler}
        className={
          ' !bg-[rgba(0,158,170,0.1)] !px-3 font-semibold !text-[rgba(0,158,170,1)] border !border-[rgba(0,158,170,1)] sm:!px-7 !py-1 rounded-lg'
        }
        children={
          <div className="flex items-center gap-1 !text-sm">
            <BiPlus size={20} />
            <span className="md:block hidden">{what_to_add}</span>
            <span className="block md:hidden">New</span>
          </div>
        }
      />
      <div className="flex-1 relative">
        <div className="span absolute left-3 top-[11px] ">
          <CgSearch size={18} className="text-gray-500" />
        </div>
        <input
          value={searchTerm ?? ''}
          onChange={setSearchTerm ? (e) => setSearchTerm(e.target.value) : null}
          type="text"
          placeholder="Search product by name"
          className="w-full rounded-sm border outline-none h-full px-5 pl-10 text-sm placeholder:text-sm"
        />
      </div>
      <CustomButton
        clickHandler={openComingSoonModal}
        className={
          '!py-2 !rounded-lg !px-7 bg-transparent border !border-[rgba(0,158,170,1)] !text-[rgba(0,158,170,1)]'
        }
        children={
          <div className="flex items-center gap-1 !text-sm">
            <span className="md:block hidden">{what_to_import}</span>
            <span className="block md:hidden">Import</span>
          </div>
        }
      />
      {comingSoonModal ? <ComingSoon closeModal={() => setComingSoonModal(false)} /> : null}
    </div>
  );
};

export default TableTop;
