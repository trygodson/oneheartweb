import React, { useState } from 'react';
import { BiPrinter, BiShare } from 'react-icons/bi';
import { FaCreditCard, FaTrash } from 'react-icons/fa';
import { GoCopy } from 'react-icons/go';
import { numberFormatter } from '../../utils/helper';
import moment from 'moment';
import { IoMdCheckmark } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { DeleteProduct } from '../../Services/ProductServices';
import { ImSpinner2 } from 'react-icons/im';
import { useDispatch, useSelector } from 'react-redux';
import { deleteBookAction } from '../../store/slices/book-keeping/deleteBookSlice';
import { updateBookStatusAction } from '../../store/slices/book-keeping/updateBookStatusSlice';
import { CgArrowsExchangeV } from 'react-icons/cg';
import CustomInput from '../CustomInput';
import CustomButton from '../Buttons/CustomButton';
import { GrClose, GrPaypal } from 'react-icons/gr';
import { PiCurrencyNgnLight } from 'react-icons/pi';
import { payDebtAction } from '../../store/slices/book-keeping/payDebtSlice';

const Receipt = ({ partner, response, user, preview, transactions }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [deleteModal, setDeleteModal] = useState(false);
  const { loading } = useSelector((state) => state.delete_book);
  const { loading: update_loading } = useSelector((state) => state.update_book_status);
  const { loading: paying_debt } = useSelector((state) => state.pay_debt);
  const [currStep, setCurrStep] = useState(response?.serviceStatusType?.value);
  const [updateStatus, setUpdateStatus] = useState(false);
  const [payDebtModal, setPayDebtModal] = useState(false);

  const [comment, setComment] = useState('');
  const [debtAmount, setDebtAmount] = useState(0);

  console.log(update_loading);

  const status = [
    { label: 'Submitted', value: 1 },
    { label: 'Processing', value: 2 },
    { label: 'Completed', value: 3 },
    { label: 'Delivered', value: 4 },
  ];
  const steps = [
    { name: 'Submitted', id: 1 },
    { name: 'Processing', id: 2 },
    { name: 'Completed', id: 3 },
    { name: 'Delivered', id: 4 },
  ];

  function handleDelete() {
    dispatch(deleteBookAction({ type: response?.bookType?.value, id: response?.id, navigate }));
  }

  const handleChangeStatus = () => {
    const bookId = response?.id;
    const payload = {
      serviceStatusType: currStep,
      description: comment,
    };
    dispatch(updateBookStatusAction({ bookId, payload, dispatch, setUpdateStatus }));
  };

  const handlePayDebt = () => {
    const bookId = response?.id;
    const amount = debtAmount;
    const payload = { bookId, amount };

    dispatch(payDebtAction({ payload, dispatch }));
  };

  return (
    <div>
      <div className="px-4 py-6 !sm:p-6 bg-dimmed_white rounded-xl md:min-w-[600px]">
        <form className="grid grid-cols-1 gap-5 w-full">
          <div className="grid gap-5">
            <div className=" pt-3 bg-dimmed_white rounded-xl min-h-[150px]">
              <div className="flex justify-between items-center pb-5">
                <div>
                  <p className="text-sm font-medium opacity-70">Amount</p>
                  <p className="font-bold text-2xl text-primary">
                    {numberFormatter(response?.amountExpected)}{' '}
                    <span className="italic text-xs text-black opacity-70">
                      ({response?.paymentChannelType?.label})
                    </span>{' '}
                  </p>
                </div>
                {!preview ? (
                  <div className="flex items-center gap-3">
                    <FaTrash onClick={() => setDeleteModal(true)} className="cursor-pointer text-[tomato]" />
                    <BiShare
                      onClick={() =>
                        navigate(`/receipt/${response?.reference}`, { state: { response, user, partner } })
                      }
                      size={24}
                      className="cursor-pointer text-green-950"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <GoCopy size={22} className="cursor-pointer text-primary" />
                    <BiPrinter size={22} className="cursor-pointer text-primary" />
                  </div>
                )}
              </div>

              <div className="border-y py-1.5 text-sm flex items-center justify-between">
                <div className="flex gap-2">
                  <p className="font-medium opacity-80 pl-2">Reference Code: </p>
                  <p>{response?.reference}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-medium opacity-80 pl-2">Tranx. Date: </p>
                  <p>{moment(response?.invoiceDate).format('ll')}</p>
                </div>
              </div>

              <div className="mt-3 pl-2 flex items-center justify-between">
                <div className="text-sm flex items-center gap-2">
                  <p className="italic font-bold">Order Status:</p>
                  <p>{response?.serviceStatusType?.label}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUpdateStatus(true);
                  }}
                  className="text-primary text-sm flex items-center font-medium "
                >
                  <CgArrowsExchangeV size={23} />
                  Update Status
                </button>
              </div>

              <div className="italic text-sm sm:pl-5 my-5 grid grid-cols-2 gap-4 sm:gap-10">
                <div className="grid gap-2 capitalize">
                  <p className="font-medium opacity-80 mt-3 ">From: </p>
                  <p>
                    <span className="font-semibold lowercase ">name: </span>
                    {partner?.name}
                  </p>
                  <p>
                    <span className="font-semibold lowercase ">address: </span>
                    {partner?.address}
                  </p>
                  <p>
                    <span className="font-semibold lowercase ">phone: </span>
                    {partner?.phoneNumber}
                  </p>
                  <p></p>
                </div>
                <div className=" grid gap-2">
                  <p className=" font-medium opacity-80 mt-3 ">Sold To: </p>
                  <p className="">
                    {' '}
                    <span className="font-semibold">name: </span> {user?.name || 'Name not supplied'}
                  </p>
                  <p>
                    <span className="font-semibold">address: </span>
                    {user?.address || 'Address not available'}
                  </p>
                  <p>
                    <span className="font-semibold">phone: </span>
                    {user?.phoneNumber || '+234 907 8888 798'}
                  </p>
                  <p></p>
                </div>
              </div>

              <div className="my-5">
                <p className="text-sm font-medium -mb-2">Items</p>
                <table className="text-sm w-full table-auto border-separate border-spacing-y-3 ">
                  <thead className="bg-[#f3f4f5] shadow">
                    <tr className="!text-left !opacity-70 !font-semibold bg-[#f3f4f5]">
                      <th className="text-xs pl-3 w-[25%] py-2 !font-semibold">Name</th>
                      <th className="text-xs pl-3 w-[25%] py-2 !font-semibold">Quantity</th>
                      <th className="text-xs pl-3 w-[25%] py-2 !font-semibold">
                        Amount <span className=" sm:inline hidden">/ Item</span>
                      </th>
                      <th className="text-xs pl-3 w-[25%] py-2 !font-semibold">
                        Total <span className=" sm:inline hidden "> Cost</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {response?.bookItems?.map((item, idx) => (
                      <tr
                        className="pt-1 transition-all duration-300 shadow-sm hover:shadow-md bg-white mb-1"
                        key={idx}
                      >
                        <td className="py-2 text-xs pl-3 ">{item.name}</td>
                        <td className="py-2 text-xs pl-7">{item.count}</td>
                        <td className="py-2 text-xs pl-3">{numberFormatter(item.amount)}</td>
                        <td className="py-2 text-xs pl-3">
                          {numberFormatter(Number(item.count) * Number(item.amount))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="my-5">
                <p className="text-sm font-medium -mb-2">Transactions</p>
                <table className="text-sm w-full table-auto border-separate border-spacing-y-3 ">
                  <thead className="bg-[#f3f4f5] shadow">
                    <tr className="!text-left !opacity-70 !font-semibold bg-[#f3f4f5]">
                      <th className="text-xs pl-3 w-1/5 py-2 !font-semibold">Trnx. Ref.</th>
                      <th className="text-xs pl-3 w-1/5 py-2 !font-semibold">Amount Paid</th>
                      <th className="text-xs pl-3 w-1/5 py-2 !font-semibold">Type </th>
                      <th className="text-xs pl-3 w-1/5 py-2 !font-semibold">Payment Mode </th>
                      <th className="text-xs pl-3 w-1/5 py-2 !font-semibold">Status </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions?.map((item, idx) => (
                      <tr
                        className="pt-1 transition-all duration-300 shadow-sm hover:shadow-md bg-white mb-1"
                        key={idx}
                      >
                        <td className="py-2 text-xs pl-3 ">{item.reference}</td>
                        <td className="py-2 text-xs pl-3">{numberFormatter(item.amount)}</td>
                        <td className="py-2 text-xs pl-3">{item.transactionType.label}</td>
                        <td className="py-2 text-xs pl-3">{item.paymentChannelType.label}</td>
                        <td className="py-2 text-xs pl-3">{item.transactionStatus.label}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {response?.debt && !preview ? (
                  <div className="text-sm flex items-center gap-2">
                    <p>
                      {' '}
                      A debt of <span className="font-bold italic">{numberFormatter(response?.debt)}</span> is yet to be
                      paid{' '}
                    </p>
                    <button
                      onClick={() => setPayDebtModal(true)}
                      type="button"
                      className="font-medium pt-0.5 py-1 px-3 bg-primary text-white rounded"
                    >
                      pay now
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="grid sm:grid-cols-2 sm:pl-5 text-sm mt-10 gap-5">
                <div className="sm:order-first order-last mt-7 sm:mt-0">
                  <p className="font-medium opacity-80 mb-2">Comment: </p>
                  <p>{response?.description}</p>
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-2 gap-5">
                    <p className="sm:text-right font-medium opacity-80">Sub-total:</p>
                    <p>{numberFormatter(response?.amountExpected)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <p className="sm:text-right font-medium opacity-80">Tax:</p>
                    <p>{numberFormatter(0)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <p className="sm:text-right font-medium opacity-80">Total Due:</p>
                    <p>{numberFormatter(response?.amountExpected)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-5 border-t pt-2 ">
                    <p className="sm:text-right font-medium opacity-80">Amount Paid:</p>
                    <p>{numberFormatter(response?.amountPaid)}</p>
                  </div>
                  <div className="text-red-500 grid grid-cols-2 gap-5">
                    <p className="sm:text-right font-medium opacity-80">Debt</p>
                    <p>{numberFormatter(response?.debt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      {deleteModal ? (
        <div className="fixed inset-0 bg-black/60 overflow-hidden grid place-content-center z-[10001]">
          <div className="bg-white rounded-xl p-5">
            <p className="text-center font-semibold text-lg mt-10">Confirm Delete !!!</p>
            <p className="max-w-[300px] text-sm mx-auto text-center my-3">
              Confirm that you want to delete this transaction record. Note that this action is irrevocable.
            </p>
            <div className="mt-6 text-sm mb-10 justify-center flex items-center gap-4">
              <button
                disabled={loading}
                type="button"
                onClick={handleDelete}
                className="bg-[coral] disabled:bg-opacity-60 disabled:cursor-auto text-white px-7 py-2 rounded-lg flex items-center gap-2"
              >
                {loading && <ImSpinner2 className="animate-spin" />}
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setDeleteModal(false)}
                className="bg-green-500 text-white px-7 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {updateStatus ? (
        <div className="fixed inset-0 bg-black/60 overflow-hidden grid place-content-center z-[10001]">
          <div className="bg-white rounded-xl p-5 relative">
            <GrClose
              size={17}
              className="absolute top-4 right-5 cursor-pointer"
              onClick={() => setUpdateStatus(false)}
            />
            <p className="text-center font-semibold text-lg pb-2">Update Status !!!</p>
            <div className="grid grid-cols-4 gap-5 my-5">
              {status.map((item, idx) => (
                <div
                  onClick={() => setCurrStep(item.value)}
                  className="cursor-pointer text-sm flex flex-col text-center"
                >
                  <div
                    className={`m-auto mb-1 w-3 h-3 rounded-full border border-primary ${
                      currStep == idx + 1 && 'bg-primary font-medium'
                    }`}
                  ></div>
                  <p
                    className={`
                     ${currStep == idx + 1 && 'text-primary font-medium'}
                    `}
                  >
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
            <div>
              <CustomInput
                label={'Comment'}
                value={comment}
                placeholder={'Reason to update status'}
                onChange={(e) => {
                  setComment(e.target.value);
                }}
              />
            </div>
            <div>
              <CustomButton
                clickHandler={handleChangeStatus}
                loading={update_loading}
                disabled={update_loading}
                type={'button'}
                className="w-full mt-7 mb-3 text-white text-sm flex items-center justify-center gap-2 !px-10 !py-3 rounded-md"
              >
                Update Status
              </CustomButton>
            </div>
          </div>
        </div>
      ) : null}
      {payDebtModal ? (
        <div className="fixed inset-0 bg-black/60 overflow-hidden grid place-content-center z-[10001]">
          <div className="bg-white rounded-xl p-5 relative min-w-[400px]">
            <GrClose
              size={17}
              className="absolute top-4 right-5 cursor-pointer"
              onClick={() => setPayDebtModal(false)}
            />
            <p className="text-center font-semibold text-lg pb-5">Pay Debt</p>

            <div>
              <label htmlFor="" className="text-sm">
                Amount to Pay
              </label>
              <div className="flex-1 relative">
                <div className="span absolute left-3 top-4 text-lg">
                  <PiCurrencyNgnLight />{' '}
                </div>
                <input
                  value={debtAmount}
                  placeholder={'0.00'}
                  onChange={(e) => {
                    setDebtAmount(e.target.value);
                  }}
                  type="text"
                  className="!bg-bg w-full rounded border outline-none h-full px-5 pl-8 py-[14px] text-sm placeholder:text-sm"
                />
              </div>
            </div>
            <div>
              <CustomButton
                clickHandler={handlePayDebt}
                loading={paying_debt}
                disabled={paying_debt}
                type={'button'}
                className="w-full mt-7 mb-3 text-white text-sm flex items-center justify-center gap-2 !px-10 !py-3 rounded-md"
              >
                {!paying_debt ? <FaCreditCard /> : null}Pay {numberFormatter(debtAmount)}
              </CustomButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Receipt;
