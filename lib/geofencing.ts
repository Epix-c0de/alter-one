import { LocationObject } from 'expo-location';
import { Database } from '@/types/database';

type Parish = Database['public']['Tables']['parishes']['Row'];

export const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
};

export const findParishByLocation = (
  location: LocationObject,
  parishes: Parish[]
): Parish | null => {
  for (const parish of parishes) {
    if (parish.latitude && parish.longitude && parish.radius_meters) {
      const distance = getDistance(
        location.coords.latitude,
        location.coords.longitude,
        parish.latitude,
        parish.longitude
      );
      if (distance < parish.radius_meters) {
        return parish;
      }
    }
  }
  return null;
};

type Session = Database['public']['Tables']['sessions']['Row'];

export const findNearbySession = (
  location: LocationObject,
  sessions: Session[]
): Session | null => {
  for (const session of sessions) {
    if (session.latitude && session.longitude && session.radius) {
      const distance = getDistance(
        location.coords.latitude,
        location.coords.longitude,
        session.latitude,
        session.longitude
      );
      if (distance < session.radius) {
        return session;
      }
    }
  }
  return null;
};
