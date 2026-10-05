import { useEffect, useRef, useState } from "react";
import type {
  GeolocateControl as GeolocateControlInstance,
  Map as MaplibreMap,
} from "maplibre-gl";
import Map, { GeolocateControl, Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Store } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Data {
  label: string;
  value: string | null;
}

const shops: Data[] = [
  { label: "Wszystkie", value: null },
  { label: "Żabka", value: "zabka" },
  { label: "Biedronka", value: "biedronka" },
];

const provinces: Data[] = [
  { label: "Wszystkie", value: null },
  { label: "Dolnośląskie", value: "dolnośląskie" },
  { label: "Kujawsko-Pomorskie", value: "kujawsko-pomorskie" },
  { label: "Lubelskie", value: "lubelskie" },
  { label: "Lubuskie", value: "lubuskie" },
  { label: "Łódzkie", value: "łódzkie" },
  { label: "Małopolskie", value: "małopolskie" },
  { label: "Mazowieckie", value: "mazowieckie" },
  { label: "Opolskie", value: "opolskie" },
  { label: "Podkarpackie", value: "podkarpackie" },
  { label: "Podlaskie", value: "podlaskie" },
  { label: "Pomorskie", value: "pomorskie" },
  { label: "Śląskie", value: "śląskie" },
  { label: "Świętokrzyskie", value: "świętokrzyskie" },
  { label: "Warmińsko-Mazurskie", value: "warmińsko-mazurskie" },
  { label: "Wielkopolskie", value: "wielkopolskie" },
  { label: "Zachodniopomorskie", value: "zachodniopomorskie" },
];

const POLAND_BOUNDS: [number, number, number, number] = [
  13.9, 48.9, 24.3, 55.0,
];

function lockZoom(map: MaplibreMap) {
  const camera = map.cameraForBounds(POLAND_BOUNDS);
  if (camera?.zoom !== undefined) {
    map.setMinZoom(camera.zoom);
  }
}

type UserLocation = {
  longitude: number;
  latitude: number;
};

const App = () => {
  const geoControlRef = useRef<GeolocateControlInstance>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer = 0;
    let tries = 0;

    const tryTrigger = () => {
      if (cancelled || tries > 25) return;
      tries += 1;
      if (geoControlRef.current?.trigger()) return;
      timer = window.setTimeout(tryTrigger, 200);
    };

    timer = window.setTimeout(tryTrigger, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className="relative h-screen w-screen">
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <div className="grid size-12 place-items-center rounded-full bg-yellow-400 shadow-xl">
          <Store className="text-white" />
        </div>
      </div>
      <aside className="fixed bottom-0 left-0 z-10 w-full space-y-2 rounded-2xl border-2 border-yellow-950/5 bg-white p-4 text-yellow-950 shadow-xl lg:top-1/2 lg:bottom-auto lg:left-6 lg:h-auto lg:w-auto lg:-translate-y-1/2 lg:space-y-6 lg:p-6 lg:pb-3">
        <div className="hidden gap-x-4 lg:flex">
          <div className="grid size-14 place-items-center rounded-full bg-yellow-400">
            <Store className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold lg:text-lg">ZnajdzSklep.pl</h1>
            <p className="text-sm">Pobliskie sklepy w twojej okolicy.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2">
          <div className="flex-1 space-y-2">
            <Label className="text-sm font-semibold">Sklep</Label>
            <Select items={shops}>
              <SelectTrigger className="w-full max-w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sklepy</SelectLabel>
                  {shops.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-2">
            <Label className="text-sm font-semibold">Województwo</Label>
            <Select items={provinces}>
              <SelectTrigger className="w-full max-w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Województwa</SelectLabel>
                  {provinces.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 flex-1 space-y-2 sm:col-span-1 lg:col-span-2">
            <Label className="text-sm font-semibold">Wyszukaj sklep</Label>
            <Input
              placeholder="Wpisz nazwę miasta lub ulicy"
              className="w-full"
            />
          </div>
          <div className="flex gap-x-2">
            <Button>Google Maps</Button>
            <Button className="bg-green-500 text-white">Bolt</Button>
          </div>
        </div>
        <footer className="hidden border-t border-black/20 pt-3 text-center text-xs opacity-80 lg:block">
          <p>
            © {new Date().getFullYear()} znajdzsklep.pl | Projekt w celach
            hobbistycznych. <br />
            Zostaw gwiazdke na GitHubie, jeśli Ci się spodobał ⭐
          </p>
        </footer>
      </aside>

      <Map
        initialViewState={{ bounds: POLAND_BOUNDS }}
        maxBounds={POLAND_BOUNDS}
        mapStyle="https://tiles.openfreemap.org/styles/positron"
        attributionControl={{ compact: true }}
        style={{ width: "100%", height: "100%" }}
        onLoad={(e) => {
          const map = e.target;
          lockZoom(map);
          map.on("resize", () => lockZoom(map));
        }}
      >
        <GeolocateControl
          ref={geoControlRef}
          position="top-right"
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation
          showUserLocation={false}
          showAccuracyCircle={false}
          fitBoundsOptions={{ maxZoom: 14 }}
          onGeolocate={(event) => {
            setUserLocation({
              longitude: event.coords.longitude,
              latitude: event.coords.latitude,
            });
          }}
        />
        {userLocation && (
          <Marker
            longitude={userLocation.longitude}
            latitude={userLocation.latitude}
            anchor="center"
          >
            <div
              title="Twoja lokalizacja"
              className="pointer-events-none relative grid size-8 place-items-center"
            >
              <span className="absolute size-8 animate-ping rounded-full bg-yellow-400/70" />
              <span className="size-3.5 rounded-full border-2 border-white bg-yellow-400 shadow-md" />
            </div>
          </Marker>
        )}
      </Map>
    </div>
  );
};

export default App;
