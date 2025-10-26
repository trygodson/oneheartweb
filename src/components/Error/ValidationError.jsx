import React from "react";

const ValidationError = ({ msg }) => {
  return <span className="text-xs text-red-700">{msg}</span>;
};

export default ValidationError;
