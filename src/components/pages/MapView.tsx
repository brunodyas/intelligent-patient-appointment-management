"use client";

import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { MapViewProps, MarkerInterface } from "@/interface/mapBox";
import Map, { Marker, MapRef, NavigationControl, Source, Layer } from "react-map-gl";
import { twMerge } from "tailwind-merge";
import { LngLatBounds } from "mapbox-gl";
import polyline from "@mapbox/polyline";
import 'mapbox-gl/dist/mapbox-gl.css';
import { routes } from "@/constants/routes";
import CarMarkerIcon from "@/assets/icons/CarMarkerIcon";
import MarkerIcon from "@/assets/icons/Marker";

const MapView: React.FC<MapViewProps> = ({ markers, style, techmarkers }) => {
  const [selectedMarker, setSelectedMarker] = useState<MarkerInterface | null>(null);
  const [hasZoomed, setHasZoomed] = useState(false);
  const [mapRoutes, setMapRoutes] = useState<any>([]);
  const mapRef = useRef<MapRef | null>(null);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}min`;
  };

  const formatDistance = (meters: number) => {
    const miles = meters / 1609.34;
    return `${miles.toFixed(2)} miles`;
  };

  const decodePolyline6 = (encoded: any) => polyline.decode(encoded, 6);

  const getRoute = async (start: any, end: any) => {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?geometries=polyline6&access_token=${process.env.NEXT_PUBLIC_MAP_BOX_ACCESS_TOKEN}`;

    const response = await fetch(url);
    const data = await response.json();
    const { distance, duration, geometry } = data.routes[0];
    const decodedGeometry = decodePolyline6(geometry);
    const reversedCoordinates = decodedGeometry.map(([lat, lng]) => [lng, lat]);

    return {
      geometry: {
        type: "LineString",
        coordinates: reversedCoordinates,
      },
      distance,
      duration,
    };
  };

  const RouteLayer = ({ route, index }: any) => {
    const midpoint = route.geometry.coordinates[Math.floor(route.geometry.coordinates.length / 2)];
    const lineColor = route.technicianColor || "#4073f5";
    return (
      <>
        <Source id={`route-source-${index}`} type="geojson" data={route.geometry}>
          <Layer
            id={`route-layer-${index}`}
            type="line"
            paint={{
              "line-color": lineColor,
              "line-width": 6,
              "line-border-color": lineColor,
              "line-border-width": 1,
            }}
            layout={{
              "line-join": "round",
              "line-cap": "round",
            }}
          />
        </Source>

        {midpoint && (
          <Marker longitude={midpoint[0]} latitude={midpoint[1]} anchor="bottom">
            <div className="px-2 py-0.5 bg-white shadow-md rounded text-sm border border-border-secondary ">
              <p className="text-primary-main font-bold leading-[16px] text-xs">{formatDuration(route.duration)}</p>
              <p className="text-body-xs">{formatDistance(route.distance)}</p>
            </div>
          </Marker>
        )}
      </>
    );
  };

  const adjustMapView = useCallback((jobmarkers: MarkerInterface[]) => {
    if (jobmarkers.length === 0) {
      console.warn("No markers available to adjust map view");
      return;
    }

    const bounds = new LngLatBounds();
    jobmarkers.forEach((marker) => {
      console.log("Adding marker to bounds:", marker);
      bounds.extend([marker.longitude, marker.latitude]);
    });

    console.log("Fitting bounds:", bounds);
    mapRef.current?.fitBounds(bounds, { padding: 100, maxZoom: 14 });
  }, []);

  useEffect(() => {
    console.log("Markers received in MapView:", markers);
    if (mapRef.current) {
      console.log("MapRef initialized:", mapRef.current);
    } else {
      console.warn("MapRef is not initialized");
    }

    if (mapRef.current && markers.length > 0 && !hasZoomed) {
      console.log("Adjusting map view for markers:", markers);
      adjustMapView(markers);
      setHasZoomed(true);
    }
  }, [markers, hasZoomed, adjustMapView]);

  const fetchRoutes = async () => {
    if (markers && techmarkers) {
      const routes = await Promise.all(
        techmarkers?.map(async (tech) => {
          const assignedJobs = markers?.filter((job: MarkerInterface) => job?.assigned_tech === tech?.id)
            .sort((a: MarkerInterface, b: MarkerInterface) => {
              const jobTimeA = a.jobTime ?? '';
              const jobTimeB = b.jobTime ?? '';
              return new Date(jobTimeA).getTime() - new Date(jobTimeB).getTime()
            });

          let currentLocation = tech;
          let techRoutes = [];

          for (let i = 0; i < assignedJobs.length; i++) {
            const job = assignedJobs[i];
            const route = await getRoute(currentLocation, job);
            techRoutes.push({
              ...route,
              techID: job?.assigned_tech,
              technician: tech.name,
              job: job.name,
              technicianColor: job?.color
            });
            currentLocation = job;
          }
          return techRoutes;
        })
      );
      setMapRoutes(routes.flat().filter((route) => route !== null));
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, [markers, techmarkers]);

  const renderMapBox = useMemo(() => {
    console.log("Rendering Map with markers:", markers);
    return (
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: markers[0]?.longitude,
          latitude: markers[0]?.latitude,
          zoom: 1.5,
        }}
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100vh",
          minHeight: "50vh",
          maxHeight: "100vh",
          overflow: "hidden",
          ...style,
        }}
        mapStyle="mapbox://styles/mapbox/light-v10"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAP_BOX_ACCESS_TOKEN}
      >
        <NavigationControl position="top-left" />
        {markers.length && markers.map((marker) => (
          <Marker
            key={marker.id}
            longitude={marker.longitude}
            latitude={marker.latitude}
            anchor="center"
          >
            <div onClick={() => setSelectedMarker(marker)} className="cursor-pointer">
              <MarkerIcon />
            </div>
          </Marker>
        ))}
        {techmarkers?.length && techmarkers.map((marker: MarkerInterface) => {
          const matchingRoute = mapRoutes.find((route: any) => route.techID === marker.id);
          const markerColor = matchingRoute && matchingRoute.technicianColor;

          return (
            <Marker
              key={marker.id}
              longitude={marker.longitude}
              latitude={marker.latitude}
              anchor="center"
            >
              <div onClick={() => setSelectedMarker(marker)} className="cursor-pointer">
                <CarMarkerIcon color={markerColor} />
              </div>
            </Marker>
          )
        }
        )}
        {mapRoutes?.length && mapRoutes?.map((route: any, index: any) => {
          return <RouteLayer key={index} index={index} route={route} />
        })}
      </Map>
    );
  }, [markers, style, techmarkers]);

  return (
    <div className="overflow-hidden relative">
      {renderMapBox}
      {selectedMarker && (
        <div
          className={twMerge(
            "absolute left-0 right-0 bottom-1 rounded-xl w-auto z-[1]",
            "border border-neutral-lightest",
            "mx-2 bg-brand-white p-2",
            "flex gap-2 justify-between"
          )}
        >
          <div
            onClick={() => {
              window.open(`${routes.tech}/${selectedMarker.id}`, "_parent");
            }}
            className="cursor-pointer"
          >
            <p className="font-bold">
              {selectedMarker.name}
            </p>
            <p className="text-neutral-light truncate">{selectedMarker.created_at}</p>
          </div>
          <p
            onClick={(e) => {
              e.preventDefault();
              setSelectedMarker(null);
            }}
            className="font-bold cursor-pointer z-10 mr-2"
          >
            X
          </p>
        </div>
      )}
    </div>
  );
};

export default React.memo(MapView);
