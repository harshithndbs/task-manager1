// src/app/services/camera.service.ts

import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Storage } from '@capacitor/storage';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  private PHOTO_STORAGE = 'photos';
  private photos: Photo[] = [];

  constructor() { }

  public async addNewPhoto() {
    // Take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    const savedImageFile = await this.saveImage(capturedPhoto);
    this.photos.unshift(savedImageFile);

    // Cache the photos array
    Storage.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos)
    });

    return savedImageFile;
  }

  private async saveImage(photo: Photo) {
    // Convert photo to base64 format
    const base64Data = await this.readAsBase64(photo);

    // Create filename
    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Data
    });

    return {
      filepath: fileName,
      webviewPath: photo.webPath
    };
  }

  private async readAsBase64(photo: Photo) {
    // Fetch the photo, read as a blob, then convert to base64 format
    const response = await fetch(photo.webPath!);
    const blob = await response.blob();

    return await this.convertBlobToBase64(blob) as string;
  }

  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  public async loadSaved() {
    // Retrieve cached photo array data
    const photoList = await Storage.get({ key: this.PHOTO_STORAGE });
    this.photos = photoList.value ? JSON.parse(photoList.value) : [];

    // Display the photo by reading into base64 format
    for (let photo of this.photos) {
      // Read each saved photo's data from the Filesystem
      const readFile = await Filesystem.readFile({
        path: photo.filepath,
        directory: Directory.Data
      });

      photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
    }

    return this.photos;
  }

  public async deletePhoto(photo: Photo) {
    // Remove this photo from the Photos array
    const index = this.photos.findIndex(p => p.filepath === photo.filepath);
    if (index > -1) {
      this.photos.splice(index, 1);
    }

    // Delete photo file from filesystem
    await Filesystem.deleteFile({
      path: photo.filepath,
      directory: Directory.Data
    });

    // Update cached photos array
    Storage.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos)
    });
  }
}
