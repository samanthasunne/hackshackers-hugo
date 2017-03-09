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
      if (!groups[group] || !groups[group].coordinates) {
        return;
      }

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
    popup.setContent(popupLabelEl(group));
    marker.bindPopup(popup);

    function openPopup(evt) {
      evt.target.openPopup();
    }

    marker.on({
      mouseover: openPopup,
      click: openPopup,
    });
  }

  /**
   * Make a label element for the group popup
   *
   * @param obj group
   * @return HTML element for label, <a> or <span>
   */
  function popupLabelEl(group) {
    const label = (group.externalUrl || group.groupPage) ?
      document.createElement('a') :
      document.createElement('span');

    label.innerText = group.label;
    label.className = 'group-popup-label';

    if (group.groupPage) {
      // Internal group page, e.g. hh.com/groups/atlanta
      label.href = `/groups/${group.groupPage}`;
    } else if (group.externalUrl) {
      // External link, e.g. meetup.com/groups/HHAtlanta
      label.href = group.externalUrl;
      label.target = '_blank';
      label.className += ' external';
    }

    return label;
  }

  /**
   * Add button to controls to toggle map dragging
   *
   * @param Leaflet map
   */
  function toggleDragging(map) {
    const zoomEl = map.zoomControl.getContainer();
    if (!zoomEl) {
      return;
    }

    function _disableTouchEvents() {
      map.dragging.disable();
      if (map.tap) {
        map.tap.disable();
      }
    }

    function _enableTouchEvents() {
      map.dragging.enable();
      if (map.tap) {
        map.tap.enable();
      }
    }

    // Disable dragging and tapping to start off
    // then toggle with control
    _disableTouchEvents();

    // Create button to toggle dragging and insert it
    const toggle = document.createElement('a');
    toggle.href = '#';
    toggle.innerHTML = '<i class="fa fa-arrows" aria-hidden="true"></i>';
    toggle.className = 'leaflet-button-dragging dragging-disabled';
    zoomEl.appendChild(toggle);

    // Add listener to toggle dragging
    toggle.addEventListener('click', (evt) => {
      evt.preventDefault();
      if (map.dragging.enabled()) {
        _disableTouchEvents();
      } else {
        _enableTouchEvents();
      }
      toggle.classList.toggle('dragging-disabled');
    });
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

    // Options that need to be applied after map setup
    config.postSetup.disable.forEach((key) => map[key].disable());

    // Add button to toggle map panning on mobile
    if (window.innerWidth < config.mobileBreakpoint) {
      toggleDragging(map);
    }
  }

  init();
}
