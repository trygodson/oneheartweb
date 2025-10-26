import React from 'react';
import '../styles/login.css';
import '../index.css';
// import SimpleSlider from "../components/Slider";
const AuthPagesLayout = ({ children }) => {
  return (
    <main className="authPages login grid text-black lg:grid-cols-1">
      {/* <section className="right bg-primaryColor-900 h-full !hidden lg:!flex ">
        <div className="login-img">
          <img src={heroImg} alt="img" />
        </div>
        <div className="login-footer mt-auto ">
          <h3 className="font-semibold !text-2xl my-5 mt-7 !leading-5">
            {' '}
            <span className=" text-secondary font-semibold">Grow</span> your business with GlowBiz.
          </h3>
          <p className="!text-[15px] max-w-[450px] mt-3">
            With Glowbiz you now have access to finance that helps grow your business savings, loans and joining a
            coperative society
          </p>
        </div>
        <div className="mt-3 flex justify-center gap-1 items-center mb-3">
          <div className="bg-white w-1.5 h-1.5 rounded-full"></div>
          <div className="bg-secondary w-1.5 h-1.5 rounded-full"></div>
          <div className="bg-white w-1.5 h-1.5 rounded-full"></div>
        </div>
      </section> */}
      <section className="relative  !bg-white/90  overflow-auto">{children}</section>
    </main>
  );
};

export default AuthPagesLayout;
