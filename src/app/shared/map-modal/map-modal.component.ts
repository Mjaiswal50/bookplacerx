/* eslint-disable quote-props */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable no-var */
import {
  Component,
  OnInit,
  AfterViewInit,
  Input
} from '@angular/core';
import { ModalController } from '@ionic/angular';


@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss']
})
export class MapModalComponent implements OnInit, AfterViewInit {

  @Input() center = { lat: 77.397, lng: 23.644 };
  @Input() selectable = true;
  @Input() closeButtonText = 'Cancel';
  @Input() title = 'Pick Location';

  constructor(
    private modalCtrl: ModalController,
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
        var mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
        mapboxgl.accessToken = 'xxx';
        var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [this.center.lat, this.center.lng],
        zoom: 19
        });
        if(this.selectable){
        map.on('click', e => {
          const selectedCoords = {
            lat: e.lngLat.wrap().lng,
            lng: e.lngLat.wrap().lat
          };
          this.modalCtrl.dismiss(selectedCoords);
        });
         }
  }
  onCancel() {
    this.modalCtrl.dismiss();
  }
}

