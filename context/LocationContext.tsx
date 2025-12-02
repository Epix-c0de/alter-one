import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationContextType {
  location: Location.LocationObject | null;
  errorMsg: string | null;
  requestPermission: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const requestPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    } catch (error) {
      setErrorMsg('Could not fetch location');
    }
  };

  return (
    <LocationContext.Provider value={{ location, errorMsg, requestPermission }}>
      {children}
    </LocationContext.Provider>
  );
};
