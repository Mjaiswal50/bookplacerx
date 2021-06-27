/* eslint-disable object-shorthand */
/* eslint-disable max-len */
import { Component, OnInit, EventEmitter, Output ,Input } from '@angular/core';
import { ActionSheetController, AlertController, ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

import { MapModalComponent } from '../../map-modal/map-modal.component';
import { environment } from '../../../../environments/environment';
import { Coordinates, PlaceLocation } from '../../../places/location.model';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss']
})
export class LocationPickerComponent implements OnInit {
  @Output() locationPick = new EventEmitter<PlaceLocation>();
  @Input() showPreview = false;
  selectedLocationImage: string;
  isLoading = false;

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient,
    private actionSheetCtrl: ActionSheetController,
    private alertCtrl: AlertController) {}
  ngOnInit() {}
  onPickLocation() {
      this.actionSheetCtrl
      .create({
        header: 'Please Choose',
        buttons: [
          {
            text: 'Auto-Locate',
            handler: () => {
              this.locateUser();
            }
          },
          {
            text: 'Pick on Map',
            handler: () => {
              this.openMap();
            }
          },
          { text: 'Cancel', role: 'cancel' }
        ]
      })
      .then(actionSheetEl => {
        actionSheetEl.present();
      });
  }

    private showErrorAlert() {
    this.alertCtrl
      .create({
        header: 'Could not fetch location',
        message: 'Please use the map to pick a location!',
        buttons: ['Okay']
      })
      .then(alertEl => alertEl.present());
  }

  private locateUser() {
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      this.showErrorAlert();
      return;
    }
     this.isLoading = true;
    Geolocation.getCurrentPosition()
      .then(geoPosition => {
        const coordinates: Coordinates = {
          lat: geoPosition.coords.latitude,
          lng: geoPosition.coords.longitude
        };
          this.createPlace(coordinates.lat, coordinates.lng);
        this.isLoading = false;
      })
      .catch(err => {
        this.isLoading = false;
        this.showErrorAlert();
      });
  }


  private openMap() {
    this.modalCtrl.create({ component: MapModalComponent }).then(modalEl => {
      modalEl.onDidDismiss().then(modalData => {
        if (!modalData.data) {
          return;
        }
        const coordinates: Coordinates = {
          lat: modalData.data.lat,
          lng: modalData.data.lng
        };
        this.createPlace(coordinates.lat, coordinates.lng);
      });
      modalEl.present();
    });
  }


  private createPlace(lat: number, lng: number) {

    const pickedLocation: PlaceLocation = {
      lat: lat,
      lng: lng,
      address: null,
      staticMapImageUrl: null
    };
  //  console.log(lat , lng);
        this.getAddress(lat , lng).subscribe(addr => {
        // console.log(addr.features[0].place_name);
          pickedLocation.address =addr.features[0].place_name;
          return of(
                this.getMapImage(pickedLocation.lat, pickedLocation.lng, 14)
              ).subscribe(staticMapImageUrl => {
            pickedLocation.staticMapImageUrl = staticMapImageUrl;
            this.selectedLocationImage = staticMapImageUrl;
            this.isLoading = false;
            this.locationPick.emit(pickedLocation);
          });
        });

  }
  private getAddress(lat: number, lng: number) {
    return this.http
      .get<any>(
        // eslint-disable-next-line max-len
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lat},${lng}.json?access_token=pk.eyJ1IjoibWphaXN3YWw1MCIsImEiOiJja3B4d2JmcTEwMG84Mm5tcmY1OWRyeGJyIn0.BF9fta4v7R2zJzueFOxAUw`
      );
  }

  private getMapImage(lat: number, lng: number, zoom: number) {
    return `https://api.mapbox.com/styles/v1/mapbox/light-v10/static/pin-s-l+000(${lat},${lng})/${lat},${lng},${zoom}/500x300?access_token=pk.eyJ1IjoibWphaXN3YWw1MCIsImEiOiJja3B4d2JmcTEwMG84Mm5tcmY1OWRyeGJyIn0.BF9fta4v7R2zJzueFOxAUw`;
  }
}
