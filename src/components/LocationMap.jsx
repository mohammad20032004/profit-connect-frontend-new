import { useRef, useEffect } from 'react'
import { Box } from '@mui/material'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import OSM from 'ol/source/OSM'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { fromLonLat, toLonLat } from 'ol/proj'
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style'
import 'ol/ol.css'
import { extractCoordinates } from '@/utils/coordinates'

const DEFAULT_CENTER = [46.6753, 24.7136]

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
        fill: new Fill({ color: '#3D1C6E' }),
        stroke: new Stroke({ color: 'white', width: 3 }),
      }),
    }),
  ]
}

function resolveInitialCenter(readonly, location, coordinates) {
  if (readonly) {
    return extractCoordinates(location) || DEFAULT_CENTER
  }
  if (coordinates) {
    return extractCoordinates({ coordinates }) || DEFAULT_CENTER
  }
  return DEFAULT_CENTER
}

export default function LocationMap({
  coordinates,
  onCoordinatesChange,
  location,
  readonly = false,
  height = 320,
  controls = true,
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const onCoordsRef = useRef(null)
  onCoordsRef.current = onCoordinatesChange

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const createMap = () => {
      if (mapRef.current) return
      if (!container || container.offsetWidth === 0 || container.offsetHeight === 0) return

      const initCoords = resolveInitialCenter(readonly, location, coordinates)
      const center = fromLonLat(initCoords)

      const markerFeature = new Feature({ geometry: new Point(center) })
      markerFeature.setStyle(makeMarkerStyles())
      const vectorSource = new VectorSource({ features: [markerFeature] })

      const mapOptions = {
        target: container,
        layers: [
          new TileLayer({ source: new OSM() }),
          new VectorLayer({ source: vectorSource }),
        ],
        view: new View({ center, zoom: 12 }),
      }

      if (!controls) {
        mapOptions.controls = []
      }

      const map = new Map(mapOptions)
      mapRef.current = map
      markerRef.current = markerFeature

      if (!readonly) {
        map.on('click', (evt) => {
          markerFeature.getGeometry().setCoordinates(evt.coordinate)
          const [lON, lAT] = toLonLat(evt.coordinate)
          if (onCoordsRef.current) {
            onCoordsRef.current({
              x: Math.round(lON * 1000000) / 1000000,
              y: Math.round(lAT * 1000000) / 1000000,
            })
          }
        })
      }
    }

    createMap()

    if (!mapRef.current) {
      const observer = new ResizeObserver(() => {
        createMap()
        if (mapRef.current) observer.disconnect()
      })
      observer.observe(container)
      return () => observer.disconnect()
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.setTarget(null)
        mapRef.current = null
        markerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || !markerRef.current || readonly) return

    if (coordinates) {
      const parsed = extractCoordinates({ coordinates })
      if (parsed) {
        const pos = fromLonLat(parsed)
        markerRef.current.getGeometry().setCoordinates(pos)
        mapRef.current.getView().setCenter(pos)
        mapRef.current.getView().setZoom(12)
      }
    }
  }, [coordinates, readonly])

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.updateSize()
    }
  })

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height,
        borderRadius: 1,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        '& .ol-control': {
          background: 'rgba(255,255,255,0.9) !important',
          borderRadius: '4px !important',
          padding: '2px !important',
        },
        '& .ol-zoom': { top: '8px !important', left: '8px !important' },
        '& .ol-attribution': { display: 'none !important' },
      }}
    />
  )
}
