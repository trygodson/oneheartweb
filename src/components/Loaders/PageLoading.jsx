import React from 'react';
import { ImSpinner2 } from 'react-icons/im';

const PageLoading = ({ msg }) => {
  return (
    <div className="flex h-screen items-center gap-1 justify-center text-sm p-2 py-10 font-medium">
      <ImSpinner2 className="!animate-spin" />
      <p>{msg ? msg : 'Loading'}</p>
    </div>
  );
};
export const LoadingIcon = ({ msg }) => {
  return (
    <div className="mx-auto">
      <ImSpinner2 className="!animate-spin mx-auto text-black" />
      {msg && <p>{msg}</p>}
    </div>
  );
};

export default PageLoading;
