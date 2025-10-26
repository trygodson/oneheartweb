import React, { useState } from "react";
import OtpInput from "react-otp-input";

export default function OTPInput({ otp, setOtp }) {
  return (
    <div className="otp">
      <OtpInput
        value={otp}
        onChange={(val) => setOtp(val)}
        numInputs={6}
        renderSeparator={<div className="w-6"></div>}
        inputStyle={{
          width: "2.2em",
          height: "2.2em",
          display: "grid",
          placeContent: "center",
          border: "1px solid gainsboro",
          outline: "1px solid #540A18",
          borderRadius: 4,
          color: "#540A18",
          fontSize: "20px",
        }}
        renderInput={(props) => (
          <input
            style={{ border: "1px solid " }}
            className="border"
            {...props}
          />
        )}
      />
    </div>
  );
}
