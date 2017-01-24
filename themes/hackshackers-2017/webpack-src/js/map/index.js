import * as LeafletStyles from 'style!raw!leaflet/dist/leaflet.css'; // eslint-disable-line no-unused-vars
import Leaflet from 'leaflet';
import config from './config';

export default function (mapId) {
  const mapEl = document.querySelector(`#${mapId}`);
  const groups = window.__hh_groups__ || null;

  function addTileLayer(map) {
    Leaflet.tileLayer(config.tileLayer.url, config.tileLayer.opts).addTo(map);
  }

  /**
   * @todo Use custom marker
   */
  function addMarkers(map) {
    const defaultMarker = new Leaflet.Icon(config.markerOpts);

    Object.keys(groups).forEach((group) => {
      const latLng = Leaflet.latLng(groups[group].coordinates);
      const marker = Leaflet.marker(latLng, {
        icon: defaultMarker,
      });
      marker.addTo(map);
      addPopupToMarker(groups[group], marker);
    });
  }

  /**
   * Create popup and bind to marker
   *
   * @param obj group
   * @param Marker Leaflet.js Marker to bind Tooltip to
   * @return none
   */
  function addPopupToMarker(group, marker) {
    const popup = new Leaflet.Popup(config.popup);
    popup.setContent(groupLinkEl(group));
    marker.bindPopup(popup);
    marker.on('mouseover', (evt) => {
      evt.target.openPopup();
    });
  }

  /**
   * Make a link element for the group popup
   *
   * @param obj group
   * @return HTMLAnchorElement
   */
  function groupLinkEl(group) {
    let href;
    if (group.groupPage) {
      // Internal group page, e.g. hh.com/groups/atlanta
      href = group.groupPage;
    } else if (group.externalUrl) {
      // External link, e.g. meetup.com/groups/HHAtlanta
      href = group.externalUrl;
    } else {
      // Fallback
      href = '#0';
    }

    const link = document.createElement('a');
    link.href = href;
    link.innerText = group.label;
    link.className = 'group-popup-link';

    if (group.externalUrl) {
      link.target = '_blank';
      link.className += ' external';
    }
    return link;
  }

  function init() {
    if (!mapEl || !groups) {
      return;
    }

    // Set these manually in case Webpack hasn't applied styles yet
    mapEl.style.height = config.mapStyle.height;
    mapEl.style.width = config.mapStyle.width;

    const map = Leaflet.map(mapId).setView(config.map.center, config.map.zoom);
    addTileLayer(map);
    addMarkers(map);
    map.scrollWheelZoom.disable();
  }

  init();
}
