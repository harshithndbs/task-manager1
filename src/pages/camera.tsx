import React, { useEffect, useRef } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonButton,
  IonIcon,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonAlert,
  IonModal,
  IonSpinner,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonImg,
  IonCardHeader,
  IonCardSubtitle,
  useIonToast,
} from '@ionic/react';
import { Camera, CameraResultType, CameraSource, CameraDirection } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { camera, trash } from 'ionicons/icons';

const CameraPage: React.FC = () => {
  const [error, setError] = React.useState<string | null>(null);
  const [showCamera, setShowCamera] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [photos, setPhotos] = React.useState<any[]>([]);
  const [presentToast] = useIonToast();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      requestCameraPermission();
    }
    const savedPhotos = JSON.parse(localStorage.getItem('photos') || '[]');
    setPhotos(savedPhotos);
  }, []);

  useEffect(() => {
    if (showCamera) {
      const timeout = setTimeout(() => {
        startWebCamera();
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [showCamera]);

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const requestCameraPermission = async () => {
    try {
      if (!Capacitor.isNativePlatform()) {
        const result = await navigator.mediaDevices.getUserMedia({ video: true });
        result.getTracks().forEach(track => track.stop());
      } else {
        const permission = await Camera.checkPermissions();
        if (permission.camera !== 'granted') {
          await Camera.requestPermissions();
        }
      }
    } catch (err) {
      console.error('Permission error:', err);
      setError('Camera permission is required to take photos.');
    }
  };

  const startWebCamera = async () => {
    setIsLoading(true);
    setError(null);
    try {
      stopCameraStream();

      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (!videoRef.current) return;

      videoRef.current.setAttribute('autoplay', '');
      videoRef.current.setAttribute('playsinline', '');
      videoRef.current.setAttribute('muted', '');
      videoRef.current.muted = true;

      videoRef.current.srcObject = stream;
      streamRef.current = stream;

      setShowCamera(true);

      await new Promise<void>((resolve, reject) => {
        if (!videoRef.current) return;
        const timeout = setTimeout(() => {
          reject(new Error('Video loading timed out'));
        }, 10000);

        videoRef.current.onloadedmetadata = () => {
          clearTimeout(timeout);
          videoRef.current?.play();
          setIsLoading(false);
          resolve();
        };
      });

    } catch (error) {
      console.error('Web camera error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const captureWebPhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const newPhoto = {
          id: Date.now(),
          dataUrl,
          timestamp: new Date().toISOString(),
          userId: currentUser.id || 'guest'
        };

        const existingPhotos = JSON.parse(localStorage.getItem('photos') || '[]');
        const updatedPhotos = [newPhoto, ...existingPhotos];
        localStorage.setItem('photos', JSON.stringify(updatedPhotos));
        setPhotos(updatedPhotos);
        stopCameraStream();
        setShowCamera(false);
      }
    }
  };

  const deletePhoto = (id: number) => {
    const updatedPhotos = photos.filter(photo => photo.id !== id);
    localStorage.setItem('photos', JSON.stringify(updatedPhotos));
    setPhotos(updatedPhotos);
    presentToast({
      message: 'Photo deleted successfully',
      duration: 1500,
      color: 'danger'
    });
  };

  const handlePhotoCapture = async (source: CameraSource) => {
    try {
      if (Capacitor.getPlatform() === 'web') {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
      } else {
        const permissions = await Camera.checkPermissions();
        if (permissions.camera !== 'granted') {
          const result = await Camera.requestPermissions();
          if (result.camera !== 'granted') {
            throw new Error('Camera permission not granted');
          }
        }
      }

      setShowCamera(true);
    } catch (err) {
      console.error('Permission error:', err);
      setError('Camera permission is required to take photos.');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Camera</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <IonButton expand="block" onClick={() => handlePhotoCapture(CameraSource.Camera)}>
                <IonIcon icon={camera} slot="start" />
                Take Photo
              </IonButton>
            </IonCol>
          </IonRow>

          {/* Photo Grid */}
          <IonRow>
            {photos.map(photo => (
              <IonCol key={photo.id} size="6" sizeMd="4" sizeLg="3">
                <IonCard>
                  <IonImg src={photo.dataUrl} />
                  <IonCardHeader>
                    <IonCardSubtitle>{new Date(photo.timestamp).toLocaleString()}</IonCardSubtitle>
                  </IonCardHeader>
                  <IonCardContent className="ion-text-center">
                    <IonButton color="danger" onClick={() => deletePhoto(photo.id)}>
                      <IonIcon icon={trash} slot="start" />
                      Delete
                    </IonButton>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>

        {/* Camera Modal */}
        <IonModal isOpen={showCamera} onDidDismiss={() => {
          setShowCamera(false);
          stopCameraStream();
        }}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Take Photo</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => {
                  setShowCamera(false);
                  stopCameraStream();
                }}>
                  Close
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              backgroundColor: '#000',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              {isLoading && (
                <div style={{
                  position: 'absolute',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <IonSpinner name="crescent" />
                  <div style={{ color: 'white' }}>Initializing camera...</div>
                </div>
              )}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: isLoading ? 'none' : 'block'
                }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              {!isLoading && (
                <IonButton
                  onClick={captureWebPhoto}
                  style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  Capture
                </IonButton>
              )}
            </div>
          </IonContent>
        </IonModal>

        <IonAlert
          isOpen={!!error}
          onDidDismiss={() => setError(null)}
          header="Error"
          message={error || ''}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default CameraPage;