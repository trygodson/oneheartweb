import React, { useState, useEffect, useRef } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import { MdRefresh, MdAdd } from 'react-icons/md';
import { FiMoreVertical, FiX } from 'react-icons/fi';
import {
  GetDeliveryZoneService,
  createDeliveryZoneService,
  UpdateDeliveryZoneService,
  DeleteDeliveryZoneService,
  GetLocationStateService,
  GetLocationLGAByStateService,
  GetLocationCityByLGAService,
} from '../../services/deliveryZoneService';
import customToast from '../../components/Toast/toastify';
import moment from 'moment';
import empty from '../../assets/images/undraw_no-data.png';

export function DeliveryZones() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [zones, setZones] = useState([]);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [cities, setCities] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cityId: '',
    deliveryTimeWindows: [''],
  });
  const [selectedStateId, setSelectedStateId] = useState('');
  const [selectedLGAId, setSelectedLGAId] = useState('');
  const dropdownRefs = useRef({});

  useEffect(() => {
    fetchZones();
    fetchStates();
  }, []);

  useEffect(() => {
    if (selectedStateId) {
      fetchLGAs(selectedStateId);
    } else {
      setLgas([]);
      setCities([]);
      setSelectedLGAId('');
      setFormData({ ...formData, cityId: '' });
    }
  }, [selectedStateId]);

  useEffect(() => {
    if (selectedLGAId) {
      fetchCities(selectedLGAId);
    } else {
      setCities([]);
      setFormData({ ...formData, cityId: '' });
    }
  }, [selectedLGAId]);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const response = await GetDeliveryZoneService({});
      if (response?.data?.success) {
        setZones(response.data.data || []);
      } else if (response?.success) {
        setZones(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching delivery zones:', error);
      customToast(error?.message || 'Failed to fetch delivery zones', true);
    } finally {
      setLoading(false);
    }
  };

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

  const handleOpenCreateModal = () => {
    setFormData({
      name: '',
      description: '',
      cityId: '',
      deliveryTimeWindows: [''],
    });
    setSelectedStateId('');
    setSelectedLGAId('');
    setCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalOpen(false);
    setFormData({
      name: '',
      description: '',
      cityId: '',
      deliveryTimeWindows: [''],
    });
    setSelectedStateId('');
    setSelectedLGAId('');
  };

  const handleOpenUpdateModal = (zone) => {
    setSelectedZone(zone);
    setFormData({
      name: zone.name || '',
      description: zone.description || '',
      cityId: zone.cityId || '',
      deliveryTimeWindows: zone.deliveryTimeWindows?.length > 0 ? zone.deliveryTimeWindows : [''],
    });
    // Note: We'd need to fetch state/LGA from cityId, but for now we'll let user reselect
    setSelectedStateId('');
    setSelectedLGAId('');
    setOpenDropdownId(null);
    setUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setUpdateModalOpen(false);
    setSelectedZone(null);
    setFormData({
      name: '',
      description: '',
      cityId: '',
      deliveryTimeWindows: [''],
    });
    setSelectedStateId('');
    setSelectedLGAId('');
  };

  const handleOpenDeleteModal = (zone) => {
    setSelectedZone(zone);
    setOpenDropdownId(null);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedZone(null);
  };

  const handleAddTimeWindow = () => {
    setFormData({
      ...formData,
      deliveryTimeWindows: [...formData.deliveryTimeWindows, ''],
    });
  };

  const handleRemoveTimeWindow = (index) => {
    const newWindows = formData.deliveryTimeWindows.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      deliveryTimeWindows: newWindows.length > 0 ? newWindows : [''],
    });
  };

  const handleTimeWindowChange = (index, value) => {
    const newWindows = [...formData.deliveryTimeWindows];
    newWindows[index] = value;
    setFormData({
      ...formData,
      deliveryTimeWindows: newWindows,
    });
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.cityId || formData.deliveryTimeWindows.filter((w) => w.trim()).length === 0) {
      customToast('Please fill in all required fields', true);
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        name: formData.name,
        description: formData.description,
        cityId: formData.cityId,
        deliveryTimeWindows: formData.deliveryTimeWindows.filter((w) => w.trim()),
      };
      const response = await createDeliveryZoneService(payload);
      if (response?.data?.success || response?.success) {
        customToast('Delivery zone created successfully');
        handleCloseCreateModal();
        fetchZones();
      } else {
        customToast(response?.data?.message || response?.message || 'Failed to create delivery zone', true);
      }
    } catch (error) {
      console.error('Error creating delivery zone:', error);
      customToast(error?.message || 'Failed to create delivery zone', true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.name || !formData.cityId || formData.deliveryTimeWindows.filter((w) => w.trim()).length === 0) {
      customToast('Please fill in all required fields', true);
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        name: formData.name,
        description: formData.description,
        cityId: formData.cityId,
        deliveryTimeWindows: formData.deliveryTimeWindows.filter((w) => w.trim()),
      };
      const response = await UpdateDeliveryZoneService(selectedZone._id, payload);
      if (response?.data?.success || response?.success) {
        customToast('Delivery zone updated successfully');
        handleCloseUpdateModal();
        fetchZones();
      } else {
        customToast(response?.data?.message || response?.message || 'Failed to update delivery zone', true);
      }
    } catch (error) {
      console.error('Error updating delivery zone:', error);
      customToast(error?.message || 'Failed to update delivery zone', true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      const response = await DeleteDeliveryZoneService(selectedZone._id);
      if (response?.data?.success || response?.success) {
        customToast('Delivery zone deleted successfully');
        handleCloseDeleteModal();
        fetchZones();
      } else {
        customToast(response?.data?.message || response?.message || 'Failed to delete delivery zone', true);
      }
    } catch (error) {
      console.error('Error deleting delivery zone:', error);
      customToast(error?.message || 'Failed to delete delivery zone', true);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleDropdown = (zoneId, e) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === zoneId ? null : zoneId);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isModalClick = event.target.closest('[data-modal]') || event.target.closest('[data-modal-backdrop]');
      const isDropdownClick = event.target.closest('[data-dropdown-menu]');
      if (isModalClick || isDropdownClick) {
        return;
      }
      Object.keys(dropdownRefs.current).forEach((key) => {
        if (dropdownRefs.current[key] && !dropdownRefs.current[key].contains(event.target)) {
          setOpenDropdownId(null);
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Delivery Zones</h2>
        <div className="flex gap-3">
          <button
            onClick={fetchZones}
            className="p-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 transition-colors"
          >
            <MdRefresh size={22} color="black" />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <MdAdd size={20} />
            Create Zone
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        {loading ? (
          <div className="py-24 flex items-center gap-1 justify-center text-sm p-2 font-medium">
            <ImSpinner2 className="animate-spin" />
            <p>Loading</p>
          </div>
        ) : zones.length === 0 ? (
          <div className="py-20 flex flex-col justify-center items-center">
            <img className="w-32" src={empty} alt="no data" />
            <p className="font-medium flex justify-center">No delivery zones found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-separate border-spacing-y-3">
              <thead>
                <tr className="text-left opacity-70 font-semibold">
                  <th className="text-sm py-3 border-y font-semibold">Name</th>
                  <th className="text-sm py-3 border-y font-semibold">Description</th>
                  <th className="text-sm py-3 border-y font-semibold">Delivery Time Windows</th>
                  <th className="text-sm py-3 border-y font-semibold">Status</th>
                  <th className="text-sm py-3 border-y font-semibold">Created At</th>
                  <th className="text-sm py-3 border-y font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((zone) => (
                  <tr key={zone._id} className="pt-3 transition-all duration-300 shadow-sm hover:shadow-md bg-white mb-2">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{zone.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{zone.description || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {zone.deliveryTimeWindows?.map((window, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                          >
                            {window}
                          </span>
                        )) || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          zone.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {zone.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {zone.createdAt ? moment(zone.createdAt).format('MMM DD, YYYY') : 'N/A'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-500 relative">
                      <div className="relative" ref={(el) => (dropdownRefs.current[zone._id] = el)}>
                        <button
                          onClick={(e) => toggleDropdown(zone._id, e)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <FiMoreVertical size={18} />
                        </button>
                        {openDropdownId === zone._id && (
                          <div
                            data-dropdown-menu
                            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenUpdateModal(zone);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Update Zone
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDeleteModal(zone);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                              >
                                Delete Zone
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {createModalOpen && (
        <div
          data-modal-backdrop
          className="fixed inset-0 bg-black/60 overflow-hidden grid place-content-center z-[10001]"
          onClick={handleCloseCreateModal}
        >
          <div
            data-modal
            className="bg-white rounded-xl p-6 min-w-[500px] max-w-[600px] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create Delivery Zone</h3>
              <button
                onClick={handleCloseCreateModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={actionLoading}
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter zone name"
                  disabled={actionLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter description"
                  rows={3}
                  disabled={actionLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedStateId}
                  onChange={(e) => {
                    setSelectedStateId(e.target.value);
                    setSelectedLGAId('');
                    setFormData({ ...formData, cityId: '' });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={actionLoading}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LGA <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedLGAId}
                    onChange={(e) => {
                      setSelectedLGAId(e.target.value);
                      setFormData({ ...formData, cityId: '' });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={actionLoading || !selectedStateId}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.cityId}
                    onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={actionLoading || !selectedLGAId}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Time Windows <span className="text-red-500">*</span>
                </label>
                {formData.deliveryTimeWindows.map((window, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={window}
                      onChange={(e) => handleTimeWindowChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., 7:00-9:00 AM"
                      disabled={actionLoading}
                    />
                    {formData.deliveryTimeWindows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTimeWindow(index)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        disabled={actionLoading}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddTimeWindow}
                  className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  disabled={actionLoading}
                >
                  Add Time Window
                </button>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={handleCloseCreateModal}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={actionLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading && <ImSpinner2 className="animate-spin" size={16} />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {updateModalOpen && (
        <div
          data-modal-backdrop
          className="fixed inset-0 bg-black/60 overflow-hidden grid place-content-center z-[10001]"
          onClick={handleCloseUpdateModal}
        >
          <div
            data-modal
            className="bg-white rounded-xl p-6 min-w-[500px] max-w-[600px] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Update Delivery Zone</h3>
              <button
                onClick={handleCloseUpdateModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={actionLoading}
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter zone name"
                  disabled={actionLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter description"
                  rows={3}
                  disabled={actionLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedStateId}
                  onChange={(e) => {
                    setSelectedStateId(e.target.value);
                    setSelectedLGAId('');
                    setFormData({ ...formData, cityId: '' });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={actionLoading}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LGA <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedLGAId}
                    onChange={(e) => {
                      setSelectedLGAId(e.target.value);
                      setFormData({ ...formData, cityId: '' });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={actionLoading || !selectedStateId}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.cityId}
                    onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={actionLoading || !selectedLGAId}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Time Windows <span className="text-red-500">*</span>
                </label>
                {formData.deliveryTimeWindows.map((window, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={window}
                      onChange={(e) => handleTimeWindowChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., 7:00-9:00 AM"
                      disabled={actionLoading}
                    />
                    {formData.deliveryTimeWindows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTimeWindow(index)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        disabled={actionLoading}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddTimeWindow}
                  className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  disabled={actionLoading}
                >
                  Add Time Window
                </button>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={handleCloseUpdateModal}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={actionLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading && <ImSpinner2 className="animate-spin" size={16} />}
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div
          data-modal-backdrop
          className="fixed inset-0 bg-black/60 overflow-hidden grid place-content-center z-[10001]"
          onClick={handleCloseDeleteModal}
        >
          <div
            data-modal
            className="bg-white rounded-xl p-6 min-w-[400px] max-w-[500px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Delete Delivery Zone</h3>
              <button
                onClick={handleCloseDeleteModal}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={actionLoading}
              >
                <FiX size={20} />
              </button>
            </div>
            {selectedZone && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{selectedZone.name}</p>
              </div>
            )}
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this delivery zone? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCloseDeleteModal}
                disabled={actionLoading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading && <ImSpinner2 className="animate-spin" size={16} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

