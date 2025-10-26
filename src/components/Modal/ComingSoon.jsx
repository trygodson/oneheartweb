import React from 'react';
import clock from '../../assets/images/icons8-clock-100.png';
import { MdCancel, MdOutlineCancel } from 'react-icons/md';
import { FaTimes } from 'react-icons/fa';

const ComingSoon = ({ closeModal }) => {
  return (
    <div className="fixed inset-0 bg-black/60 overflow-hidden grid place-content-center z-[10001]">
      <div className="grid place-content-center text-center bg-white rounded-xl w-[450px] p-7 pb-8">
        <div className="w-[100px] aspect-square m-auto">
          <img src={clock} alt="clock" className="" />
        </div>
        <p className="text-3xl font-bold text-primary">Coming Soon!</p>
        <p className="mb-4">We're working on this feature.</p>
        <button
          onClick={closeModal}
          className="bg-primary text-white font-medium flex gap-1 items-center justify-center w-fit rounded-md m-auto py-3 px-10"
        >
          {' '}
          <FaTimes /> Close
        </button>
      </div>
    </div>
  );
};

export default ComingSoon;
