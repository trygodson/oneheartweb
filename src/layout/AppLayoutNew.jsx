import React, { useContext, useEffect, useState } from 'react';
import { FiLogOut, FiChevronRight, FiFileText } from 'react-icons/fi';
import { GoBell, GoPerson, GoPersonFill } from 'react-icons/go';
import { GrCircleQuestion, GrSearch } from 'react-icons/gr';
import { LuChartPie } from 'react-icons/lu';

import { Link, Navigate, Outlet, Route, Routes, useLocation, useMatch, useNavigate } from 'react-router-dom';
import { BiCaretUp, BiX, BiMenu } from 'react-icons/bi';
import logo from '../assets/images/logo.png';
import { ToggleSidebarContext } from '../App';
import { GET_STORAGE_ITEM, REMOVE_STORAGE_ITEM } from '../config/storage';
import { useDispatch, useSelector } from 'react-redux';
import { userPermissions } from '../utils/userPermissions';
import { useAuthContext } from '../context/authContext';
import { MdOutlineTask } from 'react-icons/md';

export const handleLogout = () => {
  REMOVE_STORAGE_ITEM('token');
  REMOVE_STORAGE_ITEM('userData');
  // REMOVE_STORAGE_ITEM('user');
  // REMOVE_STORAGE_ITEM('phone');
  // REMOVE_STORAGE_ITEM('account');

  window.location.replace('/login');
};

const UserProfileCard = ({ onClick }) => {
  const { profileData: user } = useSelector((state) => state.userProfile);
  // console.log(profileData, '====profle Data====');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleCardClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogoutClick = () => {
    setShowDropdown(false);
    handleLogout();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById('user-dropdown');
      if (dropdown && !dropdown.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  console.log(user, '====user data====');
  return (
    <div className="relative mx-5 mb-6">
      <div
        onClick={handleCardClick}
        className="bg-white rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user?.profile && user?.profile?.length > 0 ? (
              <img
                src={user?.profile ?? 'https://randomuser.me/api/portraits/men/32.jpg'}
                alt={user?.user_name ?? 'Unknown User'}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 flex border  items-center justify-center rounded-full object-cover">
                <GoPerson size={30} />
              </div>
            )}
            <div>
              <h3 className="text-gray-900 font-medium text-sm">{user?.user_name || ''}</h3>
              <p className="text-gray-500 text-xs">{user?.role_name}</p>
            </div>
          </div>
          <FiChevronRight className="text-gray-400" size={18} />
        </div>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
            {/* <button
              onClick={handleProfileClick}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FiUsers size={16} />
              <span>Profile</span>
            </button> */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FiLogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const AppLayoutNew = ({ children, noHeader = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [openSubMenu, setOpenSubMenu] = useState(-1);
  const [switching, setSwitching] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  const [permissionedList, setPermissionedList] = useState([]);
  const [subMenuPermsionedList, setSubMenuPermsionedList] = useState([]);
  // const { user } = useSelector((state) => state.authenticate);
  const { sidebarOpen, setSidebarOpen } = useContext(ToggleSidebarContext);
  const { userData } = useAuthContext();
  const toggleSubMenu = (index) => {
    setOpenSubMenu(openSubMenu === index ? null : index);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const sidebarElements = [
    {
      name: 'Dashboard',
      path: '/app/home',
      icon: <LuChartPie size={20} />,
      permissions: [],
    },
    {
      name: 'KYC Management',
      path: '/app/kyc',

      icon: <MdOutlineTask size={20} />,
      permissions: [...Object.values(userPermissions).map((r) => r)],
    },
  ];

  useEffect(() => {
    filteredList(sidebarElements);
  }, [userData?.id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById('sidebar');
      const toggleBtn = document.getElementById('sidebar-toggle');

      if (
        window.innerWidth < 1280 &&
        sidebarOpen &&
        sidebar &&
        !sidebar.contains(event.target) &&
        !toggleBtn.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen, setSidebarOpen]);

  useEffect(() => {
    if (window.innerWidth < 1280) {
      setSidebarOpen(false);
    }
  }, [location.pathname, setSidebarOpen]);

  const filteredList = (menuItems) => {
    // const permission = userData?.role_id;

    setPermissionedList(
      menuItems.filter((x) => {
        // return x.permissions && x.permissions?.length > 0 && x.permissions.indexOf(permission) >= 0 ? x : null;

        // if (x.path === '/app/delivery-management') {
        //   return x.permissions && x.permissions?.length > 0 && permission.some((r) => x.permissions.indexOf(r) >= 0)
        //     ? // !partner?.partner?.isDeliveryPermmited
        //       x
        //     : null;
        // } else {
        //   return x.permissions && x.permissions?.length > 0 && permission.some((r) => x.permissions.indexOf(r) >= 0)
        //     ? x
        //     : null;
        // }
        return x;
      }),
    );
    // if (permission) {
    // }
    // return menuItems;
  };

  // if (!GET_STORAGE_ITEM('token')) {
  //   return <Navigate to={'/login'} />;
  // }

  // if (!GET_STORAGE_ITEM('user').isPhoneConfirmed) {
  //   return <Navigate to={'/verify-account'} />;
  // }

  // if (!GET_STORAGE_ITEM('account').id) {
  //   return <Navigate to={'/create-business'} />;
  // }

  return (
    <>
      <div className="flex h-screen">
        {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 xl:hidden" />}
        <aside
          id="sidebar"
          className={`
            flex flex-col h-full overflow-y-auto shadow-md py-5 transition-all ease-in-out duration-300 z-50 bg-white
            ${
              sidebarOpen
                ? 'w-[300px] fixed xl:relative left-0 top-0'
                : 'w-0 xl:w-[300px] fixed xl:relative -left-[300px] xl:left-0 top-0'
            }
          `}
        >
          <div className="flex items-center justify-between px-5">
            <div className="flex items-center gap-2 px-5">
              <img src={logo} alt="logo" className="w-44" />
            </div>

            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="xl:hidden text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <BiX size={24} />
            </button>
          </div>

          {/* <UserProfileCard /> */}

          <div className="mt-4 px-5 mb-5">
            <ul>
              {permissionedList.map((item, idx) => (
                <li
                  key={idx}
                  className={`items-center text-sm font-medium pl-6 pr-5 py-3.5 hover:bg-gray-100 cursor-pointer transition-all duration-300 ease-in-out
                      ${item.hasSubMenu ? 'grid' : 'flex'}
                      ${item.hasSubMenu && openSubMenu === idx ? 'active-link' : ''}
                      ${location.pathname === item.path ? 'active-link' : ''}
                      `}
                  onClick={() => {
                    if (!item.hasSubMenu && window.innerWidth < 1280) {
                      setSidebarOpen(false);
                    }
                    setTimeout(() => {
                      item.hasSubMenu ? toggleSubMenu(idx) : item.path ? navigate(item.path) : null;
                    }, 10);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex gap-3 items-center font-medium">
                      <span className="text-primary">{item.icon}</span>
                      <span className="whitespace-nowrap text-gray-700">{item.name}</span>
                    </div>
                    {item.hasSubMenu ? (
                      <BiCaretUp
                        size={12}
                        className={`ml-auto block transform ${
                          openSubMenu === idx ? 'rotate-0' : 'rotate-180'
                        } transition-transform duration-300 origin-center`}
                      />
                    ) : null}
                  </div>

                  <ul
                    style={{ transition: 'all 500ms ease' }}
                    className={`grid h-[0] pl-6 mt-2 overflow-hidden ease-linear ${
                      item?.hasSubMenu && openSubMenu === idx && '!h-[115px]'
                    }`}
                  >
                    <div className="!overflow-hidden">
                      {item.subMenu?.map((subItem, subIdx) => (
                        <li
                          key={subIdx}
                          onClick={() => {
                            if (window.innerWidth < 1280) {
                              setSidebarOpen(false);
                            }
                            setTimeout(() => {
                              subItem.path ? navigate(subItem.path) : null;
                            }, 10);
                          }}
                          className="text-sm py-2 hover:bg-gray-100 text-gray-700 cursor-pointer transition-all duration-300 ease-in-out rounded-md px-2"
                        >
                          <div className="flex gap-3 items-center font-medium">
                            <span>{subItem.icon}</span>
                            <span>{subItem.name}</span>
                          </div>
                        </li>
                      ))}
                    </div>
                  </ul>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto text-white">
            <ul className="px-5">
              {subMenuPermsionedList.map((item, idx) => (
                <li
                  onClick={() => {
                    if (window.innerWidth < 1280) {
                      setSidebarOpen(false);
                    }
                    setTimeout(() => {
                      item.path ? navigate(item.path) : null;
                    }, 10);
                  }}
                  key={idx}
                  className={`text-gray-700 text-sm mb-1 px-6 py-2 flex gap-2.5 items-center hover:font-semibold hover:bg-gray-100 cursor-pointer rounded-lg`}
                >
                  {item.title}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="flex-1 h-screen overflow-auto overflow-x-hidden bg-bg">
          <header className="w-full min-w-[300px] h-[60px] lg:h-[90px] flex items-center justify-between px-5 sm:px-10 ">
            <div className="flex items-center gap-4">
              <button
                id="sidebar-toggle"
                onClick={toggleSidebar}
                className="xl:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle sidebar"
              >
                <BiMenu size={24} className="text-gray-700" />
              </button>
              <div className=" flex items-center w-full px-4 py-2 rounded-full  bg-gray-100 focus:outline-none">
                <GrSearch size={17} />
                <input type="text" placeholder="Search" className="ml-3 bg-gray-100" />
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <GrCircleQuestion size={22} />
              {/* <NotificationDropdown /> */}
            </div>
          </header>

          <section className="min-w-[300px] px-5 sm:px-7 ">
            <Outlet />
          </section>
        </main>
      </div>
    </>
  );
};
