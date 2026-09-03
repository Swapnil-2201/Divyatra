/**
 * @file templeService.js
 * @description Service interface for querying temple data, facilities, and premise zones.
 * Designed to seamlessly connect to REST API endpoints with robust client mock fallback.
 */

import { TEMPLES_DATA, getAllTemples, getTempleDataById } from '../data/temples';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const templeService = {
  /**
   * Fetch all registered pilgrimage temples
   * @returns {Promise<import('../data/temples').Temple[]>}
   */
  async getTemples() {
    try {
      const res = await fetch(`${BASE_URL}/temples`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      return json.data || getAllTemples();
    } catch (err) {
      // Graceful local data resolution
      return getAllTemples();
    }
  },

  /**
   * Fetch complete temple details by unique ID
   * @param {string} id - 'somnath' | 'dwarka' | 'ambaji' | 'pavagadh'
   * @returns {Promise<import('../data/temples').Temple>}
   */
  async getTempleById(id) {
    if (!id) return getTempleDataById('somnath');
    try {
      const res = await fetch(`${BASE_URL}/temples/${id.toLowerCase()}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      return json.data || getTempleDataById(id);
    } catch (err) {
      return getTempleDataById(id);
    }
  },

  /**
   * Fetch facilities available at a temple
   * @param {string} templeId
   * @returns {Promise<import('../data/temples').TempleFacility[]>}
   */
  async getTempleFacilities(templeId) {
    const temple = await this.getTempleById(templeId);
    return temple?.facilities || [];
  },

  /**
   * Fetch premise zones and congestion maps
   * @param {string} templeId
   * @returns {Promise<import('../data/temples').TempleZone[]>}
   */
  async getTempleZones(templeId) {
    const temple = await this.getTempleById(templeId);
    return temple?.zones || [];
  }
};
