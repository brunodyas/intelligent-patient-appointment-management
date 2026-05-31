"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import useWebSocket from '@/utils/websocket';
import getWebSocketUrl from '@/utils/getWebSocketUrl';
import { useAuth } from '@/context/auth';

interface TechLocation {
  tech_id: number;
  tech_name: string;
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface TechLocationContextProps {
  techLocations: TechLocation[];
}

const TechLocationContext = createContext<TechLocationContextProps | undefined>(undefined);

const TechLocationProvider = ({ children }: { children: ReactNode }) => {
  const [techLocations, setTechLocations] = useState<TechLocation[]>([]);
  const backendUrl = process.env.NEXT_PUBLIC_BE_URL;
  const wsUrl = backendUrl ? getWebSocketUrl(backendUrl) : '';
  const { user } = useAuth(); // Get user info from auth context

  // WebSocket to receive locations from the backend
  useWebSocket(`${wsUrl}/ws/location/`, (data) => {
    console.log("Received tech location data:", data); // Already in place

    if (data.type && data.type === 'authenticated') {
      console.log("Authentication successful, no action needed.");
      return;
    }

    // Check if the data is coming as expected
    if (!data.tech_id || !data.latitude || !data.longitude) {
      console.error("Incomplete data:", data);
      return;
    }
    setTechLocations((prevLocations) => {
      // Log previous locations for comparison
      console.log("Previous tech locations:", prevLocations);
  
      const existingIndex = prevLocations.findIndex(location => location.tech_id === data.tech_id);
      const newLocation: TechLocation = {
        tech_id: data.tech_id,
        tech_name: data.tech_name,
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: data.timestamp,
      };
  
      console.log("New location to set:", newLocation);
      if (existingIndex !== -1) {
        const existingLocation = prevLocations[existingIndex];
        if (newLocation.timestamp > existingLocation.timestamp) {
          const updatedLocations = [...prevLocations];
          updatedLocations[existingIndex] = newLocation;
          return updatedLocations;
        }
        return prevLocations;
      } else {
        return [...prevLocations, newLocation];
      }
    });
  }, !!user);

  return (
    <TechLocationContext.Provider value={{ techLocations }}>
      {children}
    </TechLocationContext.Provider>
  );
};

const useTechLocation = () => {
  const context = useContext(TechLocationContext);
  if (context === undefined) {
    throw new Error('useTechLocation must be used within a TechLocationProvider');
  }
  return context;
};

export { TechLocationProvider, useTechLocation };
