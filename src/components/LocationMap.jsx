﻿import { BRAND, RADIUS } from '@/theme/tokens'
import { useRef, useEffect, useState, useMemo } from 'react'
import { Box, Button, Typography, useTheme, Autocomplete, TextField } from '@mui/material'
import AddLocationAltOutlined from '@mui/icons-material/AddLocationAltOutlined'
import { useTranslation } from 'react-i18next'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { fromLonLat, toLonLat } from 'ol/proj'
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style'
import 'ol/ol.css'
import { extractCoordinates } from '@/utils/coordinates'
import countriesData from '../data/countries.json'

const DEFAULT_CENTER = [10, 50]
const DEFAULT_ZOOM = 4

const BASEMAPS = {
  topo: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  street: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
}

function makeMarkerStyles() {
  return [
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
  ]
}

function resolveInitialCenter(readonly, location, coordinates) {
  if (readonly) return extractCoordinates(location) || DEFAULT_CENTER
  if (coordinates) return extractCoordinates({ coordinates }) || DEFAULT_CENTER
  return DEFAULT_CENTER
}

export default function LocationMap({
  coordinates,
  onCoordinatesChange,
  location,
  readonly = false,
  height = 320,
  controls = false,
}) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'ar' ? 'ar' : 'en'
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const baseLayerRef = useRef(null)
  const [picking, setPicking] = useState(false)
  const [basemap, setBasemap] = useState('topo')
  const [query, setQuery] = useState('')

  const buildSource = (type) => new XYZ({
    url: BASEMAPS[type],
    crossOrigin: 'anonymous',
    maxZoom: 23,
    attributions: '© Esri, USGS, NGA, NASA',
  })

  const flyTo = (lon, lat, zoom = 6) => {
    if (!mapRef.current) return
    mapRef.current.getView().animate({ center: fromLonLat([lon, lat]), zoom, duration: 800 })
  }

  const filtered = useMemo(() => {
    const q = (query || '').trim()
    if (!q) return []
    const lower = q.toLowerCase()
    return countriesData
      .filter((c) => c.name.toLowerCase().includes(lower) || (c.ar && c.ar.includes(q)))
      .slice(0, 12)
  }, [query])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const createMap = () => {
      if (mapRef.current) return

      const initCoords = resolveInitialCenter(readonly, location, coordinates)
      const center = fromLonLat(initCoords)
      const hasInitial = readonly ? !!extractCoordinates(location) : !!coordinates
      const zoom = hasInitial ? 12 : DEFAULT_ZOOM

      const markerFeature = new Feature({ geometry: new Point(center) })
      markerFeature.setStyle(makeMarkerStyles())
      const vectorSource = new VectorSource({ features: [markerFeature] })

      const baseLayer = new TileLayer({ source: buildSource(basemap) })
      baseLayerRef.current = baseLayer

      const options = {
        target: container,
        layers: [
          baseLayer,
          new VectorLayer({ source: vectorSource }),
        ],
        view: new View({
          center,
          zoom,
          maxZoom: 23,
          constrainResolution: false,
        }),
      }
      if (!controls) options.controls = []

      const map = new Map(options)
      mapRef.current = map
      markerRef.current = markerFeature

      if (!readonly) {
        map.on('click', (evt) => {
          markerFeature.getGeometry().setCoordinates(evt.coordinate)
          const [lng, lat] = toLonLat(evt.coordinate)
          if (onCoordinatesChange) {
            onCoordinatesChange({
              x: Math.round(lng * 1000000) / 1000000,
              y: Math.round(lat * 1000000) / 1000000,
            })
          }
          setPicking(false)
        })
      }
    }

    createMap()

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) mapRef.current.updateSize()
    })
    resizeObserver.observe(container)

    const raf = requestAnimationFrame(() => {
      if (mapRef.current) mapRef.current.updateSize()
    })

    return () => {
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      if (mapRef.current) {
        mapRef.current.setTarget(null)
        mapRef.current = null
        markerRef.current = null
        baseLayerRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (baseLayerRef.current) {
      baseLayerRef.current.setSource(buildSource(basemap))
    }
  }, [basemap])

  useEffect(() => {
    if (!mapRef.current || !markerRef.current || readonly) return
    const parsed = coordinates ? extractCoordinates({ coordinates }) : null
    if (parsed) {
      const pos = fromLonLat(parsed)
      markerRef.current.getGeometry().setCoordinates(pos)
      mapRef.current.getView().setCenter(pos)
      mapRef.current.getView().setZoom(12)
    }
  }, [coordinates, readonly])

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

      {/* Editable overlays */}
      {!readonly && (
        <>
          {/* Country search (local JSON) */}
          <Box sx={{
            position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
            zIndex: 6, width: 'min(340px, calc(100% - 16px))',
          }}>
            <Autocomplete
              options={filtered}
              inputValue={query}
              onInputChange={(e, value) => setQuery(value)}
              onChange={(e, value) => {
                if (value && value.lat != null) {
                  setQuery(lang === 'ar' && value.ar ? value.ar : value.name)
                  flyTo(value.lng, value.lat, 6)
                }
              }}
              getOptionLabel={(o) => (!o || typeof o === 'string') ? '' : (lang === 'ar' && o.ar ? o.ar : o.name)}
              filterOptions={(opts) => opts}
              clearOnBlur={false}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  placeholder={t('employer.setup.searchCountry')}
                  sx={{
                    bgcolor: 'background.paper', borderRadius: RADIUS, boxShadow: 3,
                    '& .MuiOutlinedInput-root': { borderRadius: RADIUS },
                  }}
                />
              )}
            />
          </Box>

          {/* Basemap switcher */}
          <Box sx={{
            position: 'absolute', bottom: 8, insetInlineStart: 8, zIndex: 5,
            display: 'flex', gap: 0.5, flexWrap: 'wrap', maxWidth: 'calc(100% - 16px)',
          }}>
            {[['topo', t('employer.setup.layerTopo')], ['satellite', t('employer.setup.layerSatellite')], ['street', t('employer.setup.layerStreet')]].map(([key, label]) => (
              <Button
                key={key}
                size="small"
                variant={basemap === key ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setBasemap(key)}
                sx={{ minWidth: 0, px: 1, py: 0.25, fontSize: '0.7rem', fontWeight: 600, boxShadow: 2, textTransform: 'none' }}
              >
                {label}
              </Button>
            ))}
          </Box>

          {/* Place-pin button */}
          <Box sx={{
            position: 'absolute', top: 8, insetInlineEnd: 8, zIndex: 5,
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1,
            maxWidth: 'calc(100% - 16px)',
          }}>
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
              <Typography variant="caption" sx={{
                bgcolor: 'background.paper', color: 'text.primary',
                px: 1, py: 0.5, borderRadius: RADIUS, boxShadow: 1, textAlign: 'center', lineHeight: 1.4,
              }}>
                {t('employer.setup.pickHint')}
              </Typography>
            )}
          </Box>
        </>
      )}
    </Box>
  )
}
