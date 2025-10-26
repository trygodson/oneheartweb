import moment from 'moment';
import React from 'react';
import { ImSpinner2 } from 'react-icons/im';
import { TbRefresh } from 'react-icons/tb';
import empty from '../../assets/images/undraw_no-data.png';

const ActivityTrail = ({ loading, data, emptyMsg, className, dashboard }) => {
  return (
    <div className={`w-full h-full bg-white rounded-xl p-6 pt-3 mr-5 flex flex-col ${className}`}>
      <div className="flex items-center justify-between h-fit ">
        <p className="font-semibold text-primary ">Activity Trails</p>
        <button className="p-3 rounded-full hover:bg-slate-100">
          <TbRefresh size={18} />
        </button>
      </div>
      <div className={`flex-1 flex ${dashboard ? 'max-h-[450px]' : 'max-h-[700px]l'} overflow-y-auto`}>
        {loading ? (
          <div className="bg-white rounded flex-1 grid place-content-center py-20">
            <div className="flex items-center gap-1 justify-center text-sm p-2 py-10 font-medium">
              <ImSpinner2 className="animate-spin" />
              <p>Loading</p>
            </div>
          </div>
        ) : (
          <>
            {!loading && data?.length ? (
              <div>
                <div className="mt-2 pl-2">
                  {data?.map((note, idx) => (
                    <div key={idx} className="text-sm relative p-5 pt-2 pb-3 border-l">
                      <p className="text-sm ">
                        <span className="font-medium first-letter:capitalize">
                          {note?.title ?? note?.action ?? 'No description.'}
                        </span>{' '}
                      </p>
                      <p className="mt-0">{note?.body ?? note?.description}</p>
                      <p className="font-medium">{moment(note?.createdDate).format('lll')}</p>
                      <p className="mt-1 text-sm italic">
                        <span className="font-semibold text-xs">by: </span> {note?.performedBy?.firstName}{' '}
                        {note?.performedBy?.lastName}
                      </p>
                      <div className="absolute -left-[6px] top-[14px] h-2.5 w-2.5 rounded-full bg-primary"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex my-3 pt-8 flex-col items-center justify-center text-center pb-10">
                <div className=" flex flex-col justify-center items-center">
                  <img className="w-32 sm:w-40" src={empty} alt="no data" />
                  {emptyMsg ?? (
                    <p>No activities for this product at the minute. Hit the refresh button to check udpate.</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ActivityTrail;
