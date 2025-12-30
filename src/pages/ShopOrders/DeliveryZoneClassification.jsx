import React, { useState, useEffect } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import { MdRefresh } from 'react-icons/md';
import { FiX } from 'react-icons/fi';
import moment from 'moment';
import {
  GetShopOrdersTodayByDeliveryZoneService,
  GetShopOrderDetailByIdService,
  GetDeliveryPlanService,
  SaveDeliveryPlanService,
} from '../../services/shopOrdersService';
import {
  GetLocationStateService,
  GetLocationLGAByStateService,
  GetLocationCityByLGAService,
  GetDeliveryPersonelService,
} from '../../services/deliveryZoneService';
import { numberFormatter } from '../../utils/helper';
import empty from '../../assets/images/undraw_no-data.png';
import customToast from '../../components/Toast/toastify';

export function DeliveryZoneClassification() {
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [zonesData, setZonesData] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [selectedStateId, setSelectedStateId] = useState('');
  const [selectedLGAId, setSelectedLGAId] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [cities, setCities] = useState([]);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [draggedOrder, setDraggedOrder] = useState(null);
  const [zones, setZones] = useState([]);
  const [zoneSummaryOpen, setZoneSummaryOpen] = useState(false);
  const [selectedZoneKey, setSelectedZoneKey] = useState(null);
  const [deliveryPersonnel, setDeliveryPersonnel] = useState([]);
  const [savingPlan, setSavingPlan] = useState(false);
  const [activeTab, setActiveTab] = useState('live'); // 'live' or 'saved'

  useEffect(() => {
    fetchStates();
    fetchDeliveryPersonnel();
  }, []);

  useEffect(() => {
    if (selectedStateId) {
      fetchLGAs(selectedStateId);
    } else {
      setLgas([]);
      setCities([]);
      setSelectedLGAId('');
      setSelectedCityId('');
    }
  }, [selectedStateId]);

  useEffect(() => {
    if (selectedLGAId) {
      fetchCities(selectedLGAId);
    } else {
      setCities([]);
      setSelectedCityId('');
    }
  }, [selectedLGAId]);

  useEffect(() => {
    fetchZonesData();
  }, [selectedDate, selectedCityId, activeTab]);

  const getZoneKey = (zone) => zone?.zoneId ?? 'no-zone';

  const normalizeZonesPayload = (raw) => {
    const data = raw || {};
    const normalizedZones = (data?.zones || []).map((z) => ({
      ...z,
      zoneId: z?.zoneId ?? null,
      zoneName: z?.zoneName ?? z?.name ?? 'No Zone Assigned',
      cityId: z?.cityId ?? null,
      deliveryZoneId: z?.deliveryZoneId ?? z?.zoneId ?? null,
      deliveryPersonnelIds: Array.isArray(z?.deliveryPersonnelIds) ? z.deliveryPersonnelIds : [],
      orders: Array.isArray(z?.orders)
        ? z.orders.map((o) => ({
            ...o,
            _id: o?._id ?? o?.orderId ?? o?.id,
            orderId: o?.orderId ?? o?._id ?? o?.id,
            assignedToDeliveryPersonnelId: o?.assignedToDeliveryPersonnelId ?? null,
            items: Array.isArray(o?.items)
              ? o.items.map((item) => ({
                  ...item,
                  assignedToDeliveryPersonnelId: item?.assignedToDeliveryPersonnelId ?? null,
                }))
              : [],
          }))
        : [],
    }));

    return {
      ...data,
      date: data?.date ?? null,
      totalZones: data?.totalZones ?? normalizedZones.length,
      totalOrders:
        data?.totalOrders ??
        normalizedZones.reduce((sum, z) => sum + (Array.isArray(z.orders) ? z.orders.length : 0), 0),
      zones: normalizedZones,
    };
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

  const fetchDeliveryPersonnel = async () => {
    try {
      const response = await GetDeliveryPersonelService({ page: 1, limit: 200 });
      const payload = response?.data?.success ? response.data : response;
      const list = payload?.data || payload?.data?.data || [];
      setDeliveryPersonnel(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error fetching delivery personnel:', error);
      setDeliveryPersonnel([]);
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

  const fetchZonesData = async () => {
    try {
      setLoading(true);

      if (activeTab === 'saved') {
        // Fetch saved plan - IMPORTANT: Never call delivery plan endpoints without a cityId
        if (!selectedCityId) {
          setZonesData(null);
          setZones([]);
          return;
        }

        const planRes = await GetDeliveryPlanService({
          date: selectedDate,
          cityId: selectedCityId,
        });

        const planOk = planRes?.data?.success || planRes?.success;
        const planDataRaw = planOk ? planRes?.data?.data || planRes?.data : null;
        const planData = planDataRaw ? normalizeZonesPayload(planDataRaw) : null;

        if (planData?.zones?.length) {
          setZonesData(planData);
          setZones(planData.zones);
        } else {
          setZonesData(null);
          setZones([]);
        }
      } else {
        // Fetch live orders
        const response = await GetShopOrdersTodayByDeliveryZoneService({
          date: selectedDate,
          cityId: selectedCityId || undefined,
        });
        if (response?.data?.success || response?.success) {
          const dataRaw = response?.data?.data || response?.data;
          let data = normalizeZonesPayload(dataRaw);

          // If cityId is selected, check for saved plan and merge assignments
          if (selectedCityId) {
            try {
              const planRes = await GetDeliveryPlanService({
                date: selectedDate,
                cityId: selectedCityId,
              });

              const planOk = planRes?.data?.success || planRes?.success;
              const planDataRaw = planOk ? planRes?.data?.data || planRes?.data : null;
              const planData = planDataRaw ? normalizeZonesPayload(planDataRaw) : null;

              if (planData?.zones?.length) {
                // Create a map of saved plan orders by orderId for quick lookup
                const savedOrdersMap = new Map();
                planData.zones.forEach((savedZone) => {
                  if (Array.isArray(savedZone.orders)) {
                    savedZone.orders.forEach((savedOrder) => {
                      const orderId = savedOrder.orderId || savedOrder._id;
                      if (orderId) {
                        savedOrdersMap.set(orderId, savedOrder);
                      }
                    });
                  }
                });

                // Merge saved plan assignments into live orders
                data.zones = data.zones.map((liveZone) => {
                  const liveZoneKey = getZoneKey(liveZone);

                  // Find corresponding saved zone
                  const savedZone = planData.zones.find((sz) => getZoneKey(sz) === liveZoneKey);

                  if (savedZone && Array.isArray(liveZone.orders)) {
                    // Update orders with saved plan data if they exist in saved plan
                    const updatedOrders = liveZone.orders.map((liveOrder) => {
                      const orderId = liveOrder.orderId || liveOrder._id;
                      const savedOrder = savedOrdersMap.get(orderId);

                      if (savedOrder) {
                        // Create a map of saved items by productId for matching
                        const savedItemsMap = new Map();
                        if (Array.isArray(savedOrder.items)) {
                          savedOrder.items.forEach((savedItem) => {
                            const productId = savedItem.productId || savedItem._id;
                            if (productId) {
                              savedItemsMap.set(productId, savedItem);
                            }
                          });
                        }

                        // Merge saved order (with assignments) into live order
                        return {
                          ...liveOrder,
                          assignedToDeliveryPersonnelId:
                            savedOrder.assignedToDeliveryPersonnelId || liveOrder.assignedToDeliveryPersonnelId,
                          items: Array.isArray(liveOrder.items)
                            ? liveOrder.items.map((liveItem) => {
                                const productId = liveItem.productId || liveItem._id;
                                const savedItem = productId ? savedItemsMap.get(productId) : null;

                                return {
                                  ...liveItem,
                                  assignedToDeliveryPersonnelId:
                                    savedItem?.assignedToDeliveryPersonnelId || liveItem?.assignedToDeliveryPersonnelId,
                                };
                              })
                            : [],
                        };
                      }
                      return liveOrder;
                    });

                    return {
                      ...liveZone,
                      orders: updatedOrders,
                    };
                  }

                  return liveZone;
                });
              }
            } catch (planError) {
              // If saved plan fetch fails, just use live orders
              console.error('Error fetching saved plan for merge:', planError);
            }
          }

          setZonesData(data);
          setZones(data?.zones || []);
        } else {
          setZonesData(null);
          setZones([]);
        }
      }
    } catch (error) {
      console.error('Error fetching zones data:', error);
      setZonesData(null);
      setZones([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetail = async (id) => {
    try {
      setDetailLoading(true);
      const response = await GetShopOrderDetailByIdService(id);
      if (response?.data?.success || response?.success) {
        setOrderDetail(response?.data?.data || response?.data);
        setDetailModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching order detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchZonesData();
  };

  const handleDragStart = (e, order, sourceZoneId) => {
    const status = String(order?.status || '').toLowerCase();
    // Only allow dragging orders with status "ready"
    if (status !== 'ready') {
      e.preventDefault();
      return;
    }
    setDraggedOrder({ order, sourceZoneId });
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedOrder(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetZoneId) => {
    e.preventDefault();
    if (!draggedOrder || draggedOrder.sourceZoneId === targetZoneId) {
      return;
    }

    // Update zones state
    const updatedZones = zones.map((zone) => {
      if (getZoneKey(zone) === draggedOrder.sourceZoneId) {
        // Remove order from source zone
        return {
          ...zone,
          orders: zone.orders.filter((o) => o._id !== draggedOrder.order._id),
          totalOrders: Math.max(0, (zone.totalOrders || 0) - 1),
          totalRevenue: Math.max(0, (zone.totalRevenue || 0) - (draggedOrder.order.totalAmount || 0)),
          totalItems: Math.max(0, (zone.totalItems || 0) - (draggedOrder.order.itemsCount || 0)),
        };
      }
      if (getZoneKey(zone) === targetZoneId) {
        // Add order to target zone and clear all assignments (moved to new zone)
        const orderWithoutAssignments = {
          ...draggedOrder.order,
          assignedToDeliveryPersonnelId: null,
          items: Array.isArray(draggedOrder.order?.items)
            ? draggedOrder.order.items.map((item) => ({
                ...item,
                assignedToDeliveryPersonnelId: null,
              }))
            : [],
        };
        return {
          ...zone,
          orders: [...zone.orders, orderWithoutAssignments],
          totalOrders: (zone.totalOrders || 0) + 1,
          totalRevenue: (zone.totalRevenue || 0) + (draggedOrder.order.totalAmount || 0),
          totalItems: (zone.totalItems || 0) + (draggedOrder.order.itemsCount || 0),
        };
      }
      return zone;
    });

    setZones(updatedZones);
    setDraggedOrder(null);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      ready: 'bg-green-100 text-green-800',
      confirmed: 'bg-blue-100 text-blue-800',
      received: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-purple-100 text-purple-800',
    };
    return (
      <span
        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status || 'N/A'}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusColors = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-purple-100 text-purple-800',
    };
    return (
      <span
        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status || 'N/A'}
      </span>
    );
  };

  const openZoneSummary = (zoneKey) => {
    setSelectedZoneKey(zoneKey);
    setZoneSummaryOpen(true);
  };

  const selectedZone = zones.find((z) => getZoneKey(z) === selectedZoneKey) || null;

  const getAssignedPersonnelName = (personnelId) => {
    if (!personnelId) return null;
    const personnel = deliveryPersonnel.find((p) => p._id === personnelId);
    if (!personnel) return null;
    const firstName = personnel?.userId?.firstName || '';
    const lastName = personnel?.userId?.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'Unnamed';
  };

  const setOrderPersonnel = (zoneKey, orderId, personnelId) => {
    setZones((prev) =>
      prev.map((z) => {
        if (getZoneKey(z) !== zoneKey) return z;
        const orders = Array.isArray(z.orders) ? z.orders : [];
        const nextOrders = orders.map((o) => {
          const oid = o?._id ?? o?.orderId;
          if (oid !== orderId) return o;
          return { ...o, assignedToDeliveryPersonnelId: personnelId || null };
        });
        return { ...z, orders: nextOrders };
      }),
    );
  };

  const setItemPersonnel = (zoneKey, orderId, itemIndex, personnelId) => {
    setZones((prev) =>
      prev.map((z) => {
        if (getZoneKey(z) !== zoneKey) return z;
        const orders = Array.isArray(z.orders) ? z.orders : [];
        const nextOrders = orders.map((o) => {
          const oid = o?._id ?? o?.orderId;
          if (oid !== orderId) return o;
          const items = Array.isArray(o.items) ? o.items : [];
          const nextItems = items.map((item, idx) => {
            if (idx !== itemIndex) return item;
            return { ...item, assignedToDeliveryPersonnelId: personnelId || null };
          });
          return { ...o, items: nextItems };
        });
        return { ...z, orders: nextOrders };
      }),
    );
  };

  const handleSavePlan = async () => {
    try {
      if (!selectedCityId) {
        customToast('Please select a City before saving a delivery plan.', true);
        return;
      }

      setSavingPlan(true);

      // Collect all unique personnel IDs from item-level assignments only
      const allPersonnelIds = new Set();
      zones.forEach((z) => {
        if (Array.isArray(z.deliveryPersonnelIds)) {
          z.deliveryPersonnelIds.forEach((id) => allPersonnelIds.add(id));
        }
        if (Array.isArray(z.orders)) {
          z.orders.forEach((o) => {
            if (Array.isArray(o.items)) {
              o.items.forEach((item) => {
                if (item.assignedToDeliveryPersonnelId) {
                  allPersonnelIds.add(item.assignedToDeliveryPersonnelId);
                }
              });
            }
          });
        }
      });

      const payload = {
        date: selectedDate,
        cityId: selectedCityId,
        zones: zones.map((z) => ({
          zoneId: z?.zoneId ?? null,
          deliveryZoneId: z?.deliveryZoneId ?? z?.zoneId ?? null,
          zoneName: z?.zoneName ?? 'No Zone Assigned',
          cityId: z?.cityId ?? null,
          totalOrders: z?.totalOrders ?? (Array.isArray(z?.orders) ? z.orders.length : 0),
          totalRevenue: z?.totalRevenue ?? 0,
          totalItems: z?.totalItems ?? 0,
          uniqueShops: z?.uniqueShops ?? 0,
          deliveryPersonnelIds: Array.from(allPersonnelIds), // All unique personnel IDs
          orders: (Array.isArray(z?.orders) ? z.orders : []).map((o) => ({
            orderId: o?.orderId ?? o?._id ?? null,
            _id: o?._id ?? o?.orderId ?? null,
            orderNumber: o?.orderNumber,
            businessId: o?.businessId,
            businessName: o?.businessName,
            orderDate: o?.orderDate,
            expectedDeliveryDate: o?.expectedDeliveryDate,
            status: o?.status,
            paymentStatus: o?.paymentStatus,
            totalAmount: o?.totalAmount,
            itemsCount: o?.itemsCount,
            items: (Array.isArray(o?.items) ? o.items : []).map((item) => ({
              productId: item?.productId ?? item?._id ?? null,
              productName: item?.productName ?? 'N/A',
              quantity: item?.quantity ?? 0,
              assignedToDeliveryPersonnelId: item?.assignedToDeliveryPersonnelId ?? null,
            })),
          })),
        })),
      };

      const res = await SaveDeliveryPlanService(payload);
      const ok = res?.data?.success || res?.success;
      if (ok) {
        customToast(res?.data?.message || res?.message || 'Delivery plan saved');
        // Refresh from backend so UI reflects canonical saved state
        await fetchZonesData();
      } else {
        customToast('Failed to save delivery plan', true);
      }
    } catch (e) {
      console.error('Save plan error:', e);
      customToast(e?.message || 'Failed to save delivery plan', true);
    } finally {
      setSavingPlan(false);
    }
  };

  return (
    <div className="py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Delivery Zone Classification</h1>
            <p className="text-sm text-gray-500 mt-1">View and manage delivery zone assignments</p>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'live' && (
              <button
                onClick={handleSavePlan}
                disabled={savingPlan || loading || !selectedCityId}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {savingPlan ? <ImSpinner2 className="animate-spin" size={18} /> : null}
                Save Plan
              </button>
            )}
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <MdRefresh size={18} />
              Refresh
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('live')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'live'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Live Orders
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'saved'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Saved Plans
            </button>
          </nav>
        </div>
      </div>
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={moment().format('YYYY-MM-DD')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
            <select
              value={selectedStateId}
              onChange={(e) => {
                setSelectedStateId(e.target.value);
                setSelectedLGAId('');
                setSelectedCityId('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All States</option>
              {states.map((state) => (
                <option key={state._id} value={state._id}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>
          {selectedStateId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LGA</label>
              <select
                value={selectedLGAId}
                onChange={(e) => {
                  setSelectedLGAId(e.target.value);
                  setSelectedCityId('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={!selectedStateId}
              >
                <option value="">All LGAs</option>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <select
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={!selectedLGAId}
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city._id} value={city._id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
      {/* Summary Statistics */}
      {zonesData && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Zones</p>
              <p className="text-2xl font-bold text-gray-900">{zonesData.totalZones || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{zonesData.totalOrders || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Date</p>
              <p className="text-2xl font-bold text-gray-900">
                {zonesData.date ? moment(zonesData.date).format('MMM DD, YYYY') : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="w-full">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 flex items-center gap-2 justify-center">
            <ImSpinner2 className="animate-spin" size={24} />
            <p className="text-sm font-medium text-gray-600">Loading zones data...</p>
          </div>
        ) : activeTab === 'saved' && !selectedCityId ? (
          <div className="bg-white rounded-xl shadow-sm p-20 flex flex-col justify-center items-center">
            <img className="w-32" src={empty} alt="no data" />
            <p className="font-medium text-gray-500 mt-4">Please select a city to view saved plans</p>
          </div>
        ) : zones.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-20 flex flex-col justify-center items-center">
            <img className="w-32" src={empty} alt="no data" />
            <p className="font-medium text-gray-500 mt-4">
              {activeTab === 'saved' ? 'No saved plans found for this date and city' : 'No zones found'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 pb-4">
            {zones.map((zone) => (
              <div
                key={getZoneKey(zone)}
                className="bg-gray-50 rounded-lg shadow-sm min-w-0"
                onDragOver={activeTab === 'live' ? handleDragOver : undefined}
                onDrop={activeTab === 'live' ? (e) => handleDrop(e, getZoneKey(zone)) : undefined}
              >
                {/* Zone Header */}
                <div
                  className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-lg border-b-2 border-indigo-200 cursor-pointer hover:from-indigo-100 hover:to-blue-100 transition-all"
                  onClick={() => openZoneSummary(getZoneKey(zone))}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-base font-bold text-gray-900 leading-tight">
                        {zone.zoneName || 'No Zone Assigned'}
                      </h3>
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                        {zone.totalOrders || 0}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-indigo-200/50">
                      <div>
                        <p className="text-xs text-gray-600 mb-0.5">Revenue</p>
                        <p className="text-sm font-bold text-gray-900">{numberFormatter(zone.totalRevenue || 0)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-0.5">Items</p>
                        <p className="text-sm font-bold text-gray-900">{zone.totalItems || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Zone Orders - Kanban Cards */}
                <div className="p-3 space-y-2 min-h-[200px] max-h-[600px] overflow-y-auto overflow-x-hidden">
                  {zone.orders && zone.orders.length > 0 ? (
                    zone.orders.map((order) => (
                      <div
                        key={order._id}
                        draggable={activeTab === 'live' && String(order?.status || '').toLowerCase() === 'ready'}
                        onDragStart={
                          activeTab === 'live' ? (e) => handleDragStart(e, order, getZoneKey(zone)) : undefined
                        }
                        onDragEnd={activeTab === 'live' ? handleDragEnd : undefined}
                        onClick={() => fetchOrderDetail(order._id)}
                        className={`bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-all hover:border-indigo-300 ${
                          activeTab === 'live' && String(order?.status || '').toLowerCase() === 'ready'
                            ? 'cursor-move'
                            : 'cursor-pointer'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">
                              {order.orderNumber || order._id.substring(0, 8)}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">{order.businessName || 'N/A'}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {getStatusBadge(order.status)}
                            {getPaymentStatusBadge(order.paymentStatus)}
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">
                              {order.orderDate ? moment(order.orderDate).format('MMM DD, HH:mm') : 'N/A'}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {order.totalAmount ? numberFormatter(order.totalAmount) : '₦0'}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            {order.itemsCount || 0} item{order.itemsCount !== 1 ? 's' : ''}
                          </div>
                          {order.assignedToDeliveryPersonnelId && (
                            <div className="mt-1 text-xs text-indigo-600 font-medium">
                              Assigned: {getAssignedPersonnelName(order.assignedToDeliveryPersonnelId) || 'N/A'}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-xs text-gray-400">No orders</p>
                      <p className="text-xs text-gray-400 mt-1">Drop orders here</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Order Detail Modal */}
      {detailModalOpen && (
        <div
          data-modal-backdrop
          className="fixed inset-0 bg-black/60 overflow-hidden grid place-content-center z-[10001]"
          onClick={() => setDetailModalOpen(false)}
        >
          <div
            data-modal
            className="bg-white rounded-xl p-6 min-w-[800px] max-w-[900px] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {detailLoading ? (
              <div className="py-12 flex items-center gap-2 justify-center">
                <ImSpinner2 className="animate-spin" size={20} />
                <p className="text-sm font-medium text-gray-600">Loading order details...</p>
              </div>
            ) : orderDetail ? (
              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Order Number</p>
                    <p className="text-sm font-medium text-gray-900">{orderDetail.orderNumber || orderDetail._id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Order Date</p>
                    <p className="text-sm font-medium text-gray-900">
                      {orderDetail.orderDate ? moment(orderDetail.orderDate).format('MMM DD, YYYY HH:mm') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <div>{getStatusBadge(orderDetail.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                    <div>{getPaymentStatusBadge(orderDetail.paymentStatus)}</div>
                  </div>
                  {orderDetail.paymentReference && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Payment Reference</p>
                      <p className="text-sm font-medium text-gray-900">{orderDetail.paymentReference}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Expected Delivery</p>
                    <p className="text-sm font-medium text-gray-900">
                      {orderDetail.expectedDeliveryDate
                        ? moment(orderDetail.expectedDeliveryDate).format('MMM DD, YYYY HH:mm')
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Business Info */}
                {orderDetail.business && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Business Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Business Name</p>
                        <p className="text-sm font-medium text-gray-900">
                          {orderDetail.business.businessName || 'N/A'}
                        </p>
                      </div>
                      {orderDetail.business.contactPerson && (
                        <>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Contact Person</p>
                            <p className="text-sm font-medium text-gray-900">
                              {orderDetail.business.contactPerson.name || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Phone</p>
                            <p className="text-sm font-medium text-gray-900">
                              {orderDetail.business.contactPerson.phone || 'N/A'}
                            </p>
                          </div>
                          {orderDetail.business.contactPerson.email && (
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Email</p>
                              <p className="text-sm font-medium text-gray-900">
                                {orderDetail.business.contactPerson.email}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Delivery Address */}
                {orderDetail.deliveryAddress && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Delivery Address</h4>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-900">{orderDetail.deliveryAddress.street || 'N/A'}</p>
                      {orderDetail.deliveryAddress.phone && (
                        <p className="text-sm text-gray-600">Phone: {orderDetail.deliveryAddress.phone}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Items */}
                {orderDetail.items && orderDetail.items.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Order Items</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bakery</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              Quantity
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {orderDetail.items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-2 text-sm text-gray-900">{item.productName || 'N/A'}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{item.bakeryName || 'N/A'}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {item.quantity} {item.unit || ''}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-900">
                                {item.price ? numberFormatter(item.price) : '₦0'}
                              </td>
                              <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                {item.totalPrice ? numberFormatter(item.totalPrice) : '₦0'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Order Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Subtotal:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {orderDetail.subtotal ? numberFormatter(orderDetail.subtotal) : '₦0'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Delivery Fee:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {orderDetail.deliveryFee ? numberFormatter(orderDetail.deliveryFee) : '₦0'}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-sm font-semibold text-gray-900">Total Amount:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {orderDetail.totalAmount ? numberFormatter(orderDetail.totalAmount) : '₦0'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status History */}
                {orderDetail.statusHistory && orderDetail.statusHistory.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Status History</h4>
                    <div className="space-y-3">
                      {orderDetail.statusHistory.map((history, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-900 capitalize">{history.status}</span>
                              <span className="text-xs text-gray-500">
                                {history.timestamp ? moment(history.timestamp).format('MMM DD, YYYY HH:mm') : 'N/A'}
                              </span>
                            </div>
                            {history.note && <p className="text-xs text-gray-600">{history.note}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-sm text-gray-500">No order details available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Zone Summary Modal */}
      {zoneSummaryOpen && (
        <div
          data-modal-backdrop
          className="fixed inset-0 bg-black/60 overflow-hidden grid place-content-center z-[10002]"
          onClick={() => setZoneSummaryOpen(false)}
        >
          <div
            data-modal
            className="bg-white rounded-xl p-6 w-[95vw] max-w-[1100px] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedZone?.zoneName || 'No Zone Assigned'} — Summary
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Date: {selectedDate} {selectedZone?.cityId ? ` • City: ${selectedZone.cityId}` : ''}
                </p>
              </div>
              <button
                onClick={() => setZoneSummaryOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {!selectedZone ? (
              <div className="py-10 text-center">
                <p className="text-sm text-gray-500">Zone not found.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Orders</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedZone.totalOrders || selectedZone.orders?.length || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Revenue</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {numberFormatter(selectedZone.totalRevenue || 0)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Items</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedZone.totalItems || 0}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Unique Shops</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedZone.uniqueShops || 0}</p>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Orders & Items Assignment</h4>
                  {Array.isArray(selectedZone.orders) && selectedZone.orders.length > 0 ? (
                    <div className="space-y-4">
                      {selectedZone.orders.map((o) => {
                        const oid = o?._id ?? o?.orderId;
                        const assigned = o?.assignedToDeliveryPersonnelId || '';
                        return (
                          <div key={oid} className="border rounded-lg p-4">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-900 truncate">{o?.orderNumber || oid}</p>
                                <p className="text-xs text-gray-500 truncate">{o?.businessName || 'N/A'}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  {getStatusBadge(o?.status)}
                                  {getPaymentStatusBadge(o?.paymentStatus)}
                                  <span className="text-xs text-gray-500">
                                    {o?.totalAmount ? numberFormatter(o.totalAmount) : '₦0'} •{' '}
                                    {o?.itemsCount || o?.items?.length || 0} items
                                  </span>
                                </div>
                              </div>
                              {/* <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-600 whitespace-nowrap">Order Assign:</label>
                                <select
                                  value={assigned}
                                  onChange={(e) => setOrderPersonnel(getZoneKey(selectedZone), oid, e.target.value)}
                                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm min-w-[150px]"
                                >
                                  <option value="">Unassigned</option>
                                  {deliveryPersonnel.map((p) => {
                                    const pid = p?._id;
                                    const name =
                                      `${p?.userId?.firstName || ''} ${p?.userId?.lastName || ''}`.trim() || 'Unnamed';
                                    return (
                                      <option key={pid} value={pid}>
                                        {name}
                                      </option>
                                    );
                                  })}
                                </select>
                              </div> */}
                            </div>

                            {Array.isArray(o?.items) && o.items.length > 0 ? (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-xs font-semibold text-gray-700 mb-2">Item Assignments</p>
                                {String(o?.status || '').toLowerCase() !== 'ready' ? (
                                  <p className="text-xs text-gray-500 italic">
                                    Only orders with status "ready" can be assigned to delivery personnel.
                                  </p>
                                ) : (
                                  <div className="space-y-2">
                                    {o.items.map((it, idx) => {
                                      const itemAssigned = it?.assignedToDeliveryPersonnelId || '';
                                      return (
                                        <div
                                          key={`${oid}_${idx}`}
                                          className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded"
                                        >
                                          <span className="truncate pr-2 flex-1">
                                            {it?.productName || 'Item'} {it?.bakeryName ? `• ${it.bakeryName}` : ''} •{' '}
                                            {it?.quantity ?? ''} {it?.unit || ''} •{' '}
                                            {it?.totalPrice ? numberFormatter(it.totalPrice) : ''}
                                          </span>
                                          <select
                                            value={itemAssigned}
                                            onChange={(e) =>
                                              setItemPersonnel(getZoneKey(selectedZone), oid, idx, e.target.value)
                                            }
                                            className="px-2 py-1 border border-gray-300 rounded text-xs min-w-[120px]"
                                          >
                                            <option value="">Unassigned</option>
                                            {deliveryPersonnel.map((p) => {
                                              const pid = p?._id;
                                              const name =
                                                `${p?.userId?.firstName || ''} ${p?.userId?.lastName || ''}`.trim() ||
                                                'Unnamed';
                                              return (
                                                <option key={pid} value={pid}>
                                                  {name}
                                                </option>
                                              );
                                            })}
                                          </select>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No orders in this zone.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
