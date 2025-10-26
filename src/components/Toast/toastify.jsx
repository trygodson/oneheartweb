import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { CgClose } from "react-icons/cg";
import { toast } from "react-toastify";
import { BiError } from "react-icons/bi";

const CustomSuccessToast = ({ mssg, id }) => {
  const handleClose = () => {
    toast.dismiss(id);
  };

  return (
    <div className="flex gap-3 relative">
      <div className="w-5">
        <IoIosCheckmarkCircleOutline
          className="w-5"
          size={22}
          color={"rgb(21 128 61)"}
        />
      </div>
      <div className="text-base">
        <p className="text-green-500 font-semibold tracking-wide">
          Successful!
        </p>
        <p className="mt-0 text-[15px]">
          {mssg ? mssg : "Operation performed successfully "}
        </p>
      </div>
      <CgClose
        size={16}
        onClick={handleClose}
        className="absolute ml-auto min-w-3 -right-1 top-0"
      />
    </div>
  );
};

const CustomErrorToast = ({ mssg, id }) => {
  const handleClose = () => {
    toast.dismiss(id);
  };
  return (
    <div className="flex gap-3 relative">
      <div className="!w-4">
        <BiError size={22} color={"coral"} />
      </div>
      <div className="text-base">
        <p className="text-[red] font-semibold tracking-wide">Failed!</p>
        <p className="mt-0 text-[15px]">{mssg ? mssg : "An error occured "}</p>
      </div>
      <CgClose
        size={16}
        onClick={handleClose}
        className="absolute ml-auto min-w-3 -right-1 top-0"
      />
    </div>
  );
};

const customToast = (msg, error = false) => {
  let id = `kllm_${Math.random()}`;

  if (error)
    toast(<CustomErrorToast mssg={msg} id={id} />, {
      position: "top-right",
      closeButton: false,
      toastId: "so",
    });
  else
    toast(<CustomSuccessToast mssg={msg} id={id} />, {
      position: "top-right",
      closeButton: false,
      toastId: "so",
    });
};

export default customToast;
