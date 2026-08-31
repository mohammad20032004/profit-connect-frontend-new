import { BRAND, RADIUS } from '@/theme/tokens';
import { useRef, useEffect, useState, useCallback } from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import AddLocationAltOutlined from '@mui/icons-material/AddLocationAltOutlined';
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

// ------------------------- الثوابت -------------------------
const RIYADH_CENTER = [46.6753, 24.7136]; // خط الطول، خط العرض
const RIYADH_ZOOM = 12;

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

// ---------- Hook مخصص للخريطة ----------
const useMap = ({
  containerRef,
  readonly,
  coordinates,
  location,
  basemap,
  controls,
  onCoordinatesChange,
  pickingRef,
}) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const vectorLayerRef = useRef(null);
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
      center = fromLonLat(coords || RIYADH_CENTER);
      zoom = 12;
    } else {
      center = fromLonLat(RIYADH_CENTER);
      zoom = RIYADH_ZOOM;
    }

    // طبقة العلامة (فارغة في البداية)
    const vectorSource = new VectorSource({ features: [] });
    const vectorLayer = new VectorLayer({ source: vectorSource });
    vectorLayerRef.current = vectorLayer;

    // إذا كانت هناك إحداثيات محددة مسبقاً، أضف العلامة
    if (hasInitial) {
      const coords = readonly ? extractCoordinates(location) : extractCoordinates({ coordinates });
      if (coords) {
        const markerFeature = new Feature({ geometry: new Point(fromLonLat(coords)) });
        markerFeature.setStyle(makeMarkerStyles());
        vectorSource.addFeature(markerFeature);
        markerRef.current = markerFeature;
      }
    }

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

    // تفاعل النقر لاختيار موقع (فقط عند وضع الدبوس)
    if (!readonly) {
      map.on('click', (evt) => {
        if (!pickingRef.current) return;

        // إزالة العلامة القديمة
        vectorSource.clear();

        // إضافة علامة جديدة
        const markerFeature = new Feature({ geometry: new Point(evt.coordinate) });
        markerFeature.setStyle(makeMarkerStyles());
        vectorSource.addFeature(markerFeature);
        markerRef.current = markerFeature;

        const [lng, lat] = toLonLat(evt.coordinate);
        onCoordinatesChange?.({
          x: Math.round(lng * 1e6) / 1e6,
          y: Math.round(lat * 1e6) / 1e6,
        });
      });
    }

    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, readonly, basemap, controls]);

  // دالة لتحديث طبقة الأساس
  const updateBasemap = useCallback((newBasemap) => {
    if (baseLayerRef.current) {
      baseLayerRef.current.setSource(createTileSource(newBasemap));
    }
  }, []);

  // دالة لإظهار/إخفاء العلامة بناءً على وجود إحداثيات
  const showMarker = useCallback((coords) => {
    if (!mapRef.current || !vectorLayerRef.current) return;
    const source = vectorLayerRef.current.getSource();
    source.clear();
    if (coords) {
      const pos = fromLonLat(coords);
      const markerFeature = new Feature({ geometry: new Point(pos) });
      markerFeature.setStyle(makeMarkerStyles());
      source.addFeature(markerFeature);
      markerRef.current = markerFeature;
      mapRef.current.getView().setCenter(pos);
      mapRef.current.getView().setZoom(12);
    } else {
      markerRef.current = null;
    }
  }, []);

  // تنظيف الخريطة
  const cleanup = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.setTarget(null);
      mapRef.current = null;
      markerRef.current = null;
      vectorLayerRef.current = null;
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
    showMarker,
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
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const containerRef = useRef(null);
  const [picking, setPicking] = useState(false);
  const pickingRef = useRef(false);
  const [basemap, setBasemap] = useState('topo');

  // مزامنة pickingRef مع picking state
  const handleSetPicking = useCallback((value) => {
    const next = typeof value === 'function' ? value(pickingRef.current) : value;
    pickingRef.current = next;
    setPicking(next);
  }, []);

  // استدعاء Hook الخريطة
  const { initializeMap, updateBasemap, showMarker, cleanup } = useMap({
    containerRef,
    readonly,
    coordinates,
    location,
    basemap,
    controls,
    onCoordinatesChange,
    pickingRef,
  });

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
    if (!readonly) {
      const parsed = coordinates ? extractCoordinates({ coordinates }) : null;
      showMarker(parsed);
    }
  }, [coordinates, readonly, showMarker]);

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
              onClick={() => handleSetPicking((p) => !p)}
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