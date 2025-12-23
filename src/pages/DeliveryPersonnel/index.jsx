import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImSpinner2 } from 'react-icons/im';
import { MdRefresh } from 'react-icons/md';
import { FiMoreVertical, FiX } from 'react-icons/fi';
import ReactPaginate from 'react-paginate';
import moment from 'moment';
import { GetDeliveryPersonelService, createADeliveryPersonelService } from '../../services/deliveryPersonelService';
import {
  GetLocationStateService,
  GetLocationLGAByStateService,
  GetLocationCityByLGAService,
  GetDeliveryZoneService,
} from '../../services/deliveryZoneService';
import empty from '../../assets/images/undraw_no-data.png';
import customToast from '../../components/Toast/toastify';

export function DeliveryPersonnel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(20);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const buttonRefs = useRef({});
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [cities, setCities] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedStateId, setSelectedStateId] = useState('');
  const [selectedLGAId, setSelectedLGAId] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    vehicleType: 'bike',
    vehicleNumber: '',
    zoneIds: [],
  });

  const fetchPersonnel = async (page = 1) => {
    try {
      setLoading(true);
      const res = await GetDeliveryPersonelService({ page, limit: perPage });
      const payload = res?.data?.success ? res.data : res;
      if (payload?.success) setData(payload);
      else setData(null);
    } catch (e) {
      console.error('Error fetching delivery personnel:', e);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonnel(currentPage);
    fetchStates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    if (selectedStateId) {
      fetchLGAs(selectedStateId);
    } else {
      setLgas([]);
      setCities([]);
      setZones([]);
      setSelectedLGAId('');
      setSelectedCityId('');
    }
  }, [selectedStateId]);

  useEffect(() => {
    if (selectedLGAId) {
      fetchCities(selectedLGAId);
    } else {
      setCities([]);
      setZones([]);
      setSelectedCityId('');
    }
  }, [selectedLGAId]);

  useEffect(() => {
    if (selectedCityId) {
      fetchZonesByCity(selectedCityId);
    } else {
      setZones([]);
    }
  }, [selectedCityId]);

  const fetchStates = async () => {
    try {
      const response = await GetLocationStateService();
      if (response?.data?.success) {
        setStates(response.data.data || []);
      } else if (response?.success) {
        setStates(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const fetchLGAs = async (stateId) => {
    try {
      const response = await GetLocationLGAByStateService(stateId);
      if (response?.data?.success) {
        setLgas(response.data.data?.lgas || []);
      } else if (response?.success) {
        setLgas(response.data?.lgas || []);
      }
    } catch (error) {
      console.error('Error fetching LGAs:', error);
      setLgas([]);
    }
  };

  const fetchCities = async (lgaId) => {
    try {
      const response = await GetLocationCityByLGAService(lgaId);
      if (response?.data?.success) {
        setCities(response.data.data?.cities || response.data.data || []);
      } else if (response?.success) {
        setCities(response.data?.cities || response.data || []);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCities([]);
    }
  };

  const fetchZonesByCity = async (cityId) => {
    try {
      const response = await GetDeliveryZoneService({ status: 'active' });
      const payload = response?.data?.success ? response.data : response;
      const allZones = payload?.data || payload?.zones || [];
      // Filter zones by cityId
      const filteredZones = allZones.filter((zone) => zone?.cityId === cityId);
      setZones(filteredZones);
    } catch (error) {
      console.error('Error fetching zones:', error);
      setZones([]);
    }
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    fetchPersonnel(1);
  };

  const handlePageChange = (pageIndex) => {
    setCurrentPage(pageIndex.selected + 1);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleZoneToggle = (zoneId) => {
    setFormData((prev) => {
      const current = prev.zoneIds || [];
      const updated = current.includes(zoneId) ? current.filter((id) => id !== zoneId) : [...current, zoneId];
      return { ...prev, zoneIds: updated };
    });
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName) {
        customToast('Please enter first name and last name', true);
        return;
      }
      if (!formData.email) {
        customToast('Please enter an email', true);
        return;
      }
      if (!formData.phone) {
        customToast('Please enter a phone number', true);
        return;
      }
      if (!formData.password || formData.password.length < 6) {
        customToast('Please enter a password (minimum 6 characters)', true);
        return;
      }
      if (!formData.vehicleNumber) {
        customToast('Please enter a vehicle number', true);
        return;
      }
      if (!selectedCityId) {
        customToast('Please select a city', true);
        return;
      }
      if (!formData.zoneIds || formData.zoneIds.length === 0) {
        customToast('Please select at least one zone', true);
        return;
      }

      setSubmitting(true);

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        vehicleType: formData.vehicleType,
        vehicleNumber: formData.vehicleNumber,
        zoneIds: formData.zoneIds,
      };

      const res = await createADeliveryPersonelService(payload);

      const ok = res?.data?.success || res?.success;
      if (ok) {
        customToast('Delivery personnel created successfully');
        setModalOpen(false);
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          password: '',
          vehicleType: 'bike',
          vehicleNumber: '',
          zoneIds: [],
        });
        setSelectedStateId('');
        setSelectedLGAId('');
        setSelectedCityId('');
        setZones([]);
        // Refresh data
        fetchPersonnel(currentPage);
      } else {
        customToast(res?.data?.message || res?.message || 'Failed to create delivery personnel', true);
      }
    } catch (e) {
      console.error('Error creating delivery personnel:', e);
      customToast(e?.message || 'Failed to create delivery personnel', true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      vehicleType: 'bike',
      vehicleNumber: '',
      zoneIds: [],
    });
    setSelectedStateId('');
    setSelectedLGAId('');
    setSelectedCityId('');
    setZones([]);
  };

  const handleDropdownToggle = (personnelId, buttonElement) => {
    if (openDropdown === personnelId) {
      setOpenDropdown(null);
    } else {
      if (buttonElement) {
        const rect = buttonElement.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          right: window.innerWidth - rect.right,
        });
      }
      setOpenDropdown(personnelId);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown && !event.target.closest('[data-dropdown]')) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const personnel = data?.data || [];

  return (
    <div className="py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Personnel</h1>
          <p className="text-sm text-gray-500">View and manage delivery personnel</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            Create Delivery Personnel
          </button>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <MdRefresh size={18} />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Personnel</h2>
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold">{data?.totalData ?? 0}</span>
          </div>
        </div>

        {loading ? (
          <div className="py-24 flex items-center gap-2 justify-center">
            <ImSpinner2 className="animate-spin" size={20} />
            <p className="text-sm font-medium text-gray-600">Loading personnel...</p>
          </div>
        ) : personnel.length === 0 ? (
          <div className="py-20 flex flex-col justify-center items-center">
            <img className="w-32" src={empty} alt="no data" />
            <p className="font-medium text-gray-500 mt-2">No personnel found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Availability
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zones
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {personnel.map((p) => {
                    const name = `${p?.userId?.firstName || ''} ${p?.userId?.lastName || ''}`.trim() || 'Unnamed';
                    const isDropdownOpen = openDropdown === p._id;
                    return (
                      <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{name}</div>
                          <div className="text-xs text-gray-500">{p?._id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{p?.userId?.phone || '—'}</div>
                          <div className="text-xs text-gray-500">{p?.userId?.email || '—'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">{p?.vehicleType || '—'}</div>
                          <div className="text-xs text-gray-500">{p?.vehicleNumber || ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              p?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {p?.status || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              p?.isAvailable ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {p?.isAvailable ? 'available' : 'unavailable'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {Array.isArray(p?.zones) ? p.zones.length : 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {p?.createdAt ? moment(p.createdAt).format('MMM DD, YYYY') : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="relative inline-block" data-dropdown>
                            <button
                              ref={(el) => (buttonRefs.current[p._id] = el)}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDropdownToggle(p._id, e.currentTarget);
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <FiMoreVertical size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {data?.totalPage > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * perPage + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * perPage, data?.totalData || 0)}</span> of{' '}
                  <span className="font-medium">{data?.totalData || 0}</span> results
                </div>
                <ReactPaginate
                  breakLabel="..."
                  nextLabel="Next"
                  previousLabel="Previous"
                  onPageChange={handlePageChange}
                  pageRangeDisplayed={5}
                  pageCount={data?.totalPage || 1}
                  forcePage={currentPage - 1}
                  containerClassName="flex items-center gap-2"
                  pageClassName="w-8 h-8 flex justify-center items-center font-semibold text-gray-700 rounded-md hover:bg-gray-100"
                  pageLinkClassName="w-full h-full flex items-center justify-center"
                  activeClassName="bg-gray-200"
                  previousClassName="px-3 py-1 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
                  nextClassName="px-3 py-1 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
                  disabledClassName="opacity-50 cursor-not-allowed"
                  renderOnZeroPageCount={null}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Dropdown Portal - rendered outside table overflow */}
      {openDropdown && (
        <>
          <div className="fixed inset-0 z-[10000]" onClick={() => setOpenDropdown(null)} />
          <div
            className="fixed w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-[10001]"
            style={{
              top: `${dropdownPosition.top}px`,
              right: `${dropdownPosition.right}px`,
            }}
            data-dropdown
          >
            {personnel
              .filter((p) => p._id === openDropdown)
              .map((p) => (
                <React.Fragment key={p._id}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(null);
                      navigate(`/app/delivery-personnel/${p._id}`);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg transition-colors"
                  >
                    View More
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(null);
                      navigate(`/app/delivery-personnel/${p._id}/transactions`);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg transition-colors"
                  >
                    Transactions
                  </button>
                </React.Fragment>
              ))}
          </div>
        </>
      )}

      {/* Create Delivery Personnel Modal */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[10000] transition-opacity" onClick={handleCloseModal} />
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Create Delivery Personnel</h2>
                  <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <FiX size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Enter first name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Enter last name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter phone number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Enter password (min 6 characters)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Vehicle Type & Number */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type *</label>
                      <select
                        value={formData.vehicleType}
                        onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="bike">Bike</option>
                        <option value="car">Car</option>
                        <option value="truck">Truck</option>
                        <option value="van">Van</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Number *</label>
                      <input
                        type="text"
                        value={formData.vehicleNumber}
                        onChange={(e) => handleInputChange('vehicleNumber', e.target.value)}
                        placeholder="Enter vehicle number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Location Selection */}
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Location & Zones</h3>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                        <select
                          value={selectedStateId}
                          onChange={(e) => {
                            setSelectedStateId(e.target.value);
                            setSelectedLGAId('');
                            setSelectedCityId('');
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select State</option>
                          {states.map((state) => (
                            <option key={state._id} value={state._id}>
                              {state.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      {selectedStateId && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">LGA *</label>
                          <select
                            value={selectedLGAId}
                            onChange={(e) => {
                              setSelectedLGAId(e.target.value);
                              setSelectedCityId('');
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            disabled={!selectedStateId}
                          >
                            <option value="">Select LGA</option>
                            {lgas.map((lga) => (
                              <option key={lga._id} value={lga._id}>
                                {lga.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      {selectedLGAId && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                          <select
                            value={selectedCityId}
                            onChange={(e) => setSelectedCityId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            disabled={!selectedLGAId}
                          >
                            <option value="">Select City</option>
                            {cities.map((city) => (
                              <option key={city._id} value={city._id}>
                                {city.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Zones Selection */}
                    {selectedCityId && zones.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Zones *</label>
                        <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
                          {zones.map((zone) => (
                            <label
                              key={zone._id}
                              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={formData.zoneIds.includes(zone._id)}
                                onChange={() => handleZoneToggle(zone._id)}
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm text-gray-900">{zone.name}</span>
                            </label>
                          ))}
                        </div>
                        {formData.zoneIds.length === 0 && (
                          <p className="text-xs text-red-600 mt-1">Please select at least one zone</p>
                        )}
                      </div>
                    )}
                    {selectedCityId && zones.length === 0 && (
                      <p className="text-sm text-gray-500">No zones available for this city</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 flex gap-3 border-t">
                    <button
                      onClick={handleCloseModal}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <ImSpinner2 className="animate-spin" size={16} />
                          Creating...
                        </>
                      ) : (
                        'Create Personnel'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
