import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const CrowdContext = createContext();

export const CrowdProvider = ({ children }) => {
  const [crowdData, setCrowdData] = useState(null);
  const [temples, setTemples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchLiveCrowd = useCallback(async () => {
    try {
      const [crowdRes, templesRes] = await Promise.all([
        api.getLiveCrowd(),
        api.getTemples()
      ]);
      setCrowdData(crowdRes);
      setTemples(templesRes);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching live crowd:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll live crowd telemetry every 6 seconds
  useEffect(() => {
    fetchLiveCrowd();
    const interval = setInterval(() => {
      fetchLiveCrowd();
    }, 6000);
    return () => clearInterval(interval);
  }, [fetchLiveCrowd]);

  // Trigger manual simulation pulse
  const triggerSimulationPulse = async () => {
    setIsSimulating(true);
    await api.triggerCrowdSimulation();
    await fetchLiveCrowd();
    setTimeout(() => setIsSimulating(false), 800);
  };

  const getTempleCrowdStatus = (templeId) => {
    if (!templeId) return null;
    const overview = crowdData?.templeOverview?.find(
      (t) => t.templeId.toLowerCase() === templeId.toLowerCase()
    );
    const templeObj = temples.find(
      (t) => t.id.toLowerCase() === templeId.toLowerCase()
    );
    return {
      overview,
      temple: templeObj,
      crowdPercentage: overview?.crowdPercentage || templeObj?.liveStatus?.crowdPercentage || 50,
      avgWait: overview?.avgWait || templeObj?.liveStatus?.estimatedWaitMinutes || 25,
      statusLabel: overview?.statusLabel || templeObj?.liveStatus?.statusLabel || "Normal",
      statusColor: overview?.statusColor || templeObj?.liveStatus?.statusColor || "emerald"
    };
  };

  return (
    <CrowdContext.Provider
      value={{
        crowdData,
        temples,
        loading,
        lastUpdated,
        isSimulating,
        refreshCrowd: fetchLiveCrowd,
        triggerSimulationPulse,
        getTempleCrowdStatus
      }}
    >
      {children}
    </CrowdContext.Provider>
  );
};

export const useCrowd = () => useContext(CrowdContext);
