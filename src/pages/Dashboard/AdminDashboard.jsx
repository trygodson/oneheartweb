import React, { useState, useEffect, useContext } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import PageLoading from '../../components/Loaders/PageLoading';
import { RiShareForwardFill, RiArrowRightUpLine } from 'react-icons/ri';
import { PiDotsNineBold } from 'react-icons/pi';
import { GoCheckCircle, GoPerson } from 'react-icons/go';
import { IoTimerOutline } from 'react-icons/io5';
import { useNavigate, useNavigation } from 'react-router-dom';
import { GetKYCSTATSService, GetKYCListService } from '../../services/kycService';
const Loading = () => (
  <div className="flex items-center gap-2 font-medium text-sm mt-2">
    <ImSpinner2 className="animate-spin" />
    <p>Loading...</p>
  </div>
);

export function AdminDashboard({ userId }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [kycStats, setKycStats] = useState({});
  const [kycList, setKycList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch KYC stats
        const statsResponse = await GetKYCSTATSService();
        if (statsResponse?.data) {
          setKycStats(statsResponse.data);
        }

        // Fetch KYC list
        const listResponse = await GetKYCListService({ page: 1 });
        if (listResponse?.success && listResponse?.data) {
          setKycList(listResponse.data.slice(0, 5)); // Get only the 5 most recent
        }
      } catch (error) {
        console.error('Error fetching KYC data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  return (
    // <AppLayoutNew noHeader={loading}>
    <>
      {loading ? (
        <PageLoading msg={'Fetching Home..'} />
      ) : (
        <>
          <div className=" min-h-screen px-8 py-6">
            <div>
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Welcome Back</h1>
                  <p className="text-gray-400 text-sm ">Inspector Admin Dashboard</p>
                </div>

                <div className="flex items-center ">
                  {/* <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 font-medium text-sm">
                    <RiShareForwardFill size={17} />
                    Generate PDF Report
                  </button> */}
                </div>
              </div>
              {/* KYC Stats Cards */}
              <div className="flex gap-4 mb-8">
                <div
                  className={`flex-1 rounded-2xl p-6 py-4 flex flex-col justify-between shadow-md bg-gray-900 text-white cursor-pointer`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <PiDotsNineBold size={14} />
                      <span className="text-sm ml-2 font-medium">Total Merchants</span>
                    </div>
                    <RiArrowRightUpLine size={16} />
                  </div>
                  <div className="flex items-end justify-between mt-16">
                    <span className="text-3xl font-bold">{kycStats?.totalMerchants || 0}</span>
                    <div className="flex flex-col">
                      <span className={`text-xs font-semibold text-green-400`}>
                        Verified: {kycStats?.verifiedMerchants || 0}
                      </span>
                      <span className={`text-xs font-semibold text-yellow-400`}>
                        Pending: {kycStats?.pendingMerchants || 0}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={`flex-1 rounded-2xl p-6 py-4 flex flex-col justify-between shadow-md bg-white text-gray-900 cursor-pointer`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <GoPerson size={14} />
                      <span className="text-sm ml-2 font-medium">Total Consumers</span>
                    </div>
                    <div></div>
                  </div>
                  <div className="flex items-end justify-between mt-16">
                    <span className="text-3xl font-bold">{kycStats?.totalConsumers || 0}</span>
                    <div className="flex flex-col">
                      <span className={`text-xs font-semibold text-green-400`}>
                        Verified: {kycStats?.verifiedConsumers || 0}
                      </span>
                      <span className={`text-xs font-semibold text-yellow-400`}>
                        Pending: {kycStats?.pendingConsumers || 0}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={`flex-1 rounded-2xl p-6 py-4 flex flex-col justify-between shadow-md bg-white text-gray-900 cursor-pointer`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <IoTimerOutline size={14} />
                      <span className="text-sm ml-2 font-medium">Verified Payments</span>
                    </div>
                    <div></div>
                  </div>
                  <div className="flex items-end justify-between mt-16">
                    <span className="text-3xl font-bold">{kycStats?.totalVerifiedPayments || 0}</span>
                  </div>
                </div>
                <div
                  className={`flex-1 rounded-2xl p-6 py-4 flex flex-col justify-between shadow-md bg-white text-gray-900 cursor-pointer`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <IoTimerOutline size={14} />
                      <span className="text-sm ml-2 font-medium">Pending Payments</span>
                    </div>
                    <div></div>
                  </div>
                  <div className="flex items-end justify-between mt-16">
                    <span className="text-3xl font-bold">{kycStats?.totalPendingPayments || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent KYC */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold mb-6">Recent KYC Submissions</h2>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Contact
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Payment Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {kycList && kycList.length > 0 ? (
                      kycList.map((kyc) => (
                        <tr key={kyc.id} className="hover:bg-gray-50 cursor-pointer">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium capitalize">{kyc.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {kyc.type === 'merchant' ? kyc.businessName : kyc.fullName || kyc.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {kyc.type === 'merchant' ? kyc.contactEmail : kyc.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {new Date(kyc.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                kyc.paymentVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {kyc.paymentVerified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                          No recent KYC submissions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
