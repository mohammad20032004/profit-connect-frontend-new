import { BRAND, RADIUS } from '@/theme/tokens';
import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Box, Button, Typography, useTheme, Autocomplete, TextField } from '@mui/material';
import AddLocationAltOutlined from '@mui/icons-material/AddLocationAltOutlined';
import LocationOnOutlined from '@mui/icons-material/LocationOnOutlined';
import { useTranslation } from 'react-i18next';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import XYZ from 'ol/source/XYZ';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat, toLonLat } from 'ol/proj';
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import 'ol/ol.css';
import { extractCoordinates } from '@/utils/coordinates';
import countriesData from '../data/countries.json';

// ------------------------- الثوابت -------------------------
const SYRIA_CENTER = [38.5, 34.5]; // خط الطول، خط العرض
const SYRIA_ZOOM = 6;

// خيارات خرائط الأساس
const BASEMAPS = {
  topo: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  street: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
};

// ---------- دوال مساعدة ----------
const makeMarkerStyles = () => [
  new Style({
    image: new CircleStyle({
      radius: 18,
      fill: new Fill({ color: 'rgba(61, 28, 110, 0.15)' }),
      stroke: new Stroke({ color: 'rgba(61, 28, 110, 0.3)', width: 1 }),
    }),
  }),
  new Style({
    image: new CircleStyle({
      radius: 10,
      fill: new Fill({ color: BRAND }),
      stroke: new Stroke({ color: 'white', width: 3 }),
    }),
  }),
];

const createTileSource = (type) =>
  new XYZ({
    url: BASEMAPS[type],
    crossOrigin: 'anonymous',
    maxZoom: 23,
    attributions: '© Esri, USGS, NGA, NASA',
  });

const zoomForType = (type) =>
  type === 'country' ? 5 : type === 'state' || type === 'region' || type === 'county' ? 7 : 11;

// ---------- Hook مخصص للخريطة ----------
const useMap = ({
  containerRef,
  readonly,
  coordinates,
  location,
  basemap,
  controls,
  onCoordinatesChange,
  setPicking,
}) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const baseLayerRef = useRef(null);
  const viewRef = useRef(null);

  // دالة لإنشاء الخريطة
  const initializeMap = useCallback(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    // تحديد المركز الأولي
    const hasInitial = readonly ? !!extractCoordinates(location) : !!coordinates;
    let center, zoom;
    if (hasInitial) {
      const coords = readonly ? extractCoordinates(location) : extractCoordinates({ coordinates });
      center = fromLonLat(coords || SYRIA_CENTER);
      zoom = 12;
    } else {
      center = fromLonLat(SYRIA_CENTER);
      zoom = SYRIA_ZOOM;
    }

    // إنشاء طبقة العلامة
    const markerFeature = new Feature({ geometry: new Point(center) });
    markerFeature.setStyle(makeMarkerStyles());
    const vectorSource = new VectorSource({ features: [markerFeature] });
    const vectorLayer = new VectorLayer({ source: vectorSource });

    // طبقة الأساس
    const baseLayer = new TileLayer({ source: createTileSource(basemap) });
    baseLayerRef.current = baseLayer;

    // إعدادات الخريطة
    const view = new View({
      center,
      zoom,
      maxZoom: 23,
      constrainResolution: false,
    });
    viewRef.current = view;

    const map = new Map({
      target: container,
      layers: [baseLayer, vectorLayer],
      view,
      controls: controls ? undefined : readonly ? undefined : [],
    });

    mapRef.current = map;
    markerRef.current = markerFeature;

    // تفاعل النقر لاختيار موقع
    if (!readonly) {
      map.on('click', (evt) => {
        markerFeature.getGeometry().setCoordinates(evt.coordinate);
        const [lng, lat] = toLonLat(evt.coordinate);
        onCoordinatesChange?.({
          x: Math.round(lng * 1e6) / 1e6,
          y: Math.round(lat * 1e6) / 1e6,
        });
        setPicking(false);
      });
    }

    return map;
  }, [containerRef, readonly, coordinates, location, basemap, controls, onCoordinatesChange, setPicking]);

  // دالة لتحديث طبقة الأساس
  const updateBasemap = useCallback((newBasemap) => {
    if (baseLayerRef.current) {
      baseLayerRef.current.setSource(createTileSource(newBasemap));
    }
  }, []);

  // دالة لتحديث موقع العلامة
  const updateMarker = useCallback((coords) => {
    if (!mapRef.current || !markerRef.current) return;
    const pos = fromLonLat(coords);
    markerRef.current.getGeometry().setCoordinates(pos);
    mapRef.current.getView().setCenter(pos);
    mapRef.current.getView().setZoom(12);
  }, []);

  // دالة للطيران إلى موقع
  const flyTo = useCallback((lng, lat, zoom = 6) => {
    if (!mapRef.current) return;
    mapRef.current.getView().animate({
      center: fromLonLat([lng, lat]),
      zoom,
      duration: 800,
    });
  }, []);

  // تنظيف الخريطة
  const cleanup = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.setTarget(null);
      mapRef.current = null;
      markerRef.current = null;
      baseLayerRef.current = null;
      viewRef.current = null;
    }
  }, []);

  return {
    mapRef,
    markerRef,
    baseLayerRef,
    viewRef,
    initializeMap,
    updateBasemap,
    updateMarker,
    flyTo,
    cleanup,
  };
};

// ------------------------- المكوّن الرئيسي -------------------------
export default function LocationMap({
  coordinates,
  onCoordinatesChange,
  location,
  readonly = false,
  height = 320,
  controls = false,
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language === 'ar' ? 'ar' : 'en';
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const containerRef = useRef(null);
  const [picking, setPicking] = useState(false);
  const [basemap, setBasemap] = useState('topo');
  const [query, setQuery] = useState('');
  const [geoResults, setGeoResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // استدعاء Hook الخريطة
  const { initializeMap, updateBasemap, updateMarker, flyTo, cleanup } = useMap({
    containerRef,
    readonly,
    coordinates,
    location,
    basemap,
    controls,
    onCoordinatesChange,
    setPicking,
  });

  // ---------- البحث الجغرافي (Nominatim) ----------
  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setGeoResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const url =
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
            q
          )}&limit=8&accept-language=${lang}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error('Geocode failed');
        const data = await res.json();
        setGeoResults(
          data.map((r) => ({
            name: r.display_name,
            lat: parseFloat(r.lat),
            lng: parseFloat(r.lon),
            type: r.type,
          }))
        );
      } catch (err) {
        if (err.name !== 'AbortError') setGeoResults([]);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, lang]);

  // ---------- دمج بيانات الدول المحلية مع نتائج البحث ----------
  const filteredCountries = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return countriesData
      .filter((c) => c.name.toLowerCase().includes(q) || (c.ar && c.ar.includes(query.trim())))
      .slice(0, 12);
  }, [query]);

  const options = useMemo(() => {
    const seen = new Set();
    const merged = [];
    filteredCountries.forEach((c) => {
      const key = c.name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(c);
      }
    });
    geoResults.forEach((r) => {
      const key = r.name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(r);
      }
    });
    return merged;
  }, [filteredCountries, geoResults]);

  // ---------- تهيئة الخريطة عند تحميل المكوّن ----------
  useEffect(() => {
    const map = initializeMap();
    if (!map) return;

    const resizeObserver = new ResizeObserver(() => map.updateSize());
    resizeObserver.observe(containerRef.current);

    const raf = requestAnimationFrame(() => map.updateSize());

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // يتم التهيئة مرة واحدة فقط

  // ---------- تحديث طبقة الأساس عند تغييرها ----------
  useEffect(() => {
    updateBasemap(basemap);
  }, [basemap, updateBasemap]);

  // ---------- تحديث موقع العلامة عند تغير الإحداثيات من الخارج ----------
  useEffect(() => {
    if (!readonly && coordinates) {
      const parsed = extractCoordinates({ coordinates });
      if (parsed) updateMarker(parsed);
    }
  }, [coordinates, readonly, updateMarker]);

  // ---------- معالج الطيران عند اختيار نتيجة بحث ----------
  const handleSelect = useCallback(
    (value) => {
      if (value && value.lat != null) {
        const displayName = lang === 'ar' && value.ar ? value.ar : value.name;
        setQuery(displayName);
        flyTo(value.lng, value.lat, zoomForType(value.type));
      }
    },
    [flyTo, lang]
  );

  // ---------- عرض المكوّن ----------
  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          height,
          borderRadius: RADIUS,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          cursor: readonly ? 'grab' : picking ? 'crosshair' : 'pointer',
          bgcolor: isDark ? '#0d0919' : '#eaeaea',
          '& .ol-control': {
            background: 'rgba(255,255,255,0.92) !important',
            borderRadius: '4px !important',
            padding: '2px !important',
          },
          '& .ol-zoom': { top: '8px !important', insetInlineStart: '8px !important' },
          '& .ol-attribution': { display: 'none !important' },
        }}
      />

      {!readonly && (
        <>
          {/* شريط البحث */}
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              width: 'min(340px, calc(100% - 16px))',
              pointerEvents: 'auto',
            }}
          >
            <Autocomplete
              autoHighlight
              options={options}
              loading={searching}
              loadingText={t('employer.setup.searching')}
              noOptionsText=""
              isOptionEqualToValue={(o, v) => o === v}
              openOnFocus={false}
              inputValue={query}
              onInputChange={(_, value) => setQuery(value)}
              onChange={(_, value) => handleSelect(value)}
              getOptionLabel={(o) =>
                o && typeof o === 'object' ? (lang === 'ar' && o.ar ? o.ar : o.name) : ''
              }
              filterOptions={(opts) => opts}
              clearOnBlur={false}
              renderOption={(props, o) => (
                <Box component="li" {...props} sx={{ gap: 0.5 }}>
                  <LocationOnOutlined sx={{ fontSize: 18, color: 'primary.main', flexShrink: 0 }} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" noWrap>
                      {lang === 'ar' && o.ar ? o.ar : o.name}
                    </Typography>
                    {o.type && (
                      <Typography variant="caption" color="text.secondary" noWrap display="block">
                        {t(`employer.setup.placeType.${o.type}`, o.type)}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  placeholder={t('employer.setup.searchPlace')}
                  sx={{
                    bgcolor: 'background.paper',
                    borderRadius: RADIUS,
                    boxShadow: 3,
                    '& .MuiOutlinedInput-root': { borderRadius: RADIUS },
                  }}
                />
              )}
            />
          </Box>

          {/* مبدل طبقات الأساس */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              insetInlineStart: 8,
              zIndex: 5,
              display: 'flex',
              gap: 0.5,
              flexWrap: 'wrap',
              maxWidth: 'calc(100% - 16px)',
            }}
          >
            {[
              ['topo', t('employer.setup.layerTopo')],
              ['satellite', t('employer.setup.layerSatellite')],
              ['street', t('employer.setup.layerStreet')],
            ].map(([key, label]) => (
              <Button
                key={key}
                size="small"
                variant={basemap === key ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setBasemap(key)}
                sx={{
                  minWidth: 0,
                  px: 1,
                  py: 0.25,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  boxShadow: 2,
                  textTransform: 'none',
                }}
              >
                {label}
              </Button>
            ))}
          </Box>

          {/* زر تحديد الموقع */}
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              insetInlineEnd: 8,
              zIndex: 5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 1,
              maxWidth: 'calc(100% - 16px)',
            }}
          >
            <Button
              size="small"
              variant="contained"
              color={picking ? 'secondary' : 'primary'}
              startIcon={<AddLocationAltOutlined />}
              onClick={() => setPicking((p) => !p)}
              sx={{ boxShadow: 3, whiteSpace: 'nowrap', fontWeight: 600 }}
            >
              {picking ? t('employer.setup.cancelPick') : t('employer.setup.placePin')}
            </Button>
            {picking && (
              <Typography
                variant="caption"
                sx={{
                  bgcolor: 'background.paper',
                  color: 'text.primary',
                  px: 1,
                  py: 0.5,
                  borderRadius: RADIUS,
                  boxShadow: 1,
                  textAlign: 'center',
                  lineHeight: 1.4,
                }}
              >
                {t('employer.setup.pickHint')}
              </Typography>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}