// src/pages/Settings.tsx
import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonItemDivider,
  IonAvatar,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonInput,
  IonAlert,
  IonLoading,
} from '@ionic/react';
import { 
  moonOutline, 
  languageOutline, 
  notificationsOutline, 
  logOutOutline,
  personOutline,
  listOutline,
  trashOutline,
} from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { useTasks } from '../contexts/TasksContext';
import './Settings.css';

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const { settings, updateSettings } = useSettings();
  const { stats, refreshStats } = useTasks();
  
  const [name, setName] = useState('');
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showClearAlert, setShowClearAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Initialize form values from user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
    }
  }, [user]);
  
  // Refresh stats when component mounts
  useEffect(() => {
    refreshStats();
  }, [refreshStats]);
  
  // Handle profile update
  const handleProfileUpdate = async () => {
    if (!user || !name.trim()) return;
    
    setLoading(true);
    
    try {
      // In a real app, this would call an API
      // For this demo, we'll simulate success
      setTimeout(() => {
        setLoading(false);
        // Show success alert
        alert('Profile updated successfully!');
      }, 1000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setLoading(false);
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    await logout();
  };
  
  // Handle clearing all tasks
  const handleClearTasks = () => {
    // In a real app, this would call an API to delete all tasks
    // For this demo, we'll just simulate success
    alert('This would clear all your tasks in a real app');
    setShowClearAlert(false);
  };
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        {user && (
          <IonCard className="profile-card">
            <IonCardHeader>
              <IonAvatar className="profile-avatar">
                <img src="/assets/avatar-placeholder.png" alt="Profile" />
              </IonAvatar>
              <h2>{user.name || 'User'}</h2>
              <p>{user.email}</p>
            </IonCardHeader>
            
            <IonCardContent>
              <IonItem>
                <IonLabel position="floating">Name</IonLabel>
                <IonInput 
                  value={name}
                  onIonChange={e => setName(e.detail.value!)}
                />
              </IonItem>
              
              <IonButton 
                expand="block" 
                onClick={handleProfileUpdate}
                className="update-profile-button"
              >
                Update Profile
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}
        
        <IonList>
          <IonItemDivider>Appearance</IonItemDivider>
          
          <IonItem>
            <IonIcon icon={moonOutline} slot="start" />
            <IonLabel>Dark Mode</IonLabel>
            <IonToggle 
              checked={settings.darkMode}
              onIonChange={e => updateSettings({ darkMode: e.detail.checked })}
            />
          </IonItem>
          
          <IonItem>
            <IonIcon icon={languageOutline} slot="start" />
            <IonLabel>Language</IonLabel>
            <IonSelect 
              value={settings.language}
              onIonChange={e => updateSettings({ language: e.detail.value })}
            >
              <IonSelectOption value="en">English</IonSelectOption>
              <IonSelectOption value="es">Spanish</IonSelectOption>
              <IonSelectOption value="fr">French</IonSelectOption>
            </IonSelect>
          </IonItem>
          
          <IonItemDivider>Notifications</IonItemDivider>
          
          <IonItem>
            <IonIcon icon={notificationsOutline} slot="start" />
            <IonLabel>Enable Notifications</IonLabel>
            <IonToggle 
              checked={settings.notificationsEnabled}
              onIonChange={e => updateSettings({ notificationsEnabled: e.detail.checked })}
            />
          </IonItem>
          
          <IonItemDivider>Task Settings</IonItemDivider>
          
          <IonItem>
            <IonIcon icon={listOutline} slot="start" />
            <IonLabel>Default View</IonLabel>
            <IonSelect 
              value={settings.defaultView}
              onIonChange={e => updateSettings({ defaultView: e.detail.value })}
            >
              <IonSelectOption value="all">All Tasks</IonSelectOption>
              <IonSelectOption value="pending">Pending Only</IonSelectOption>
              <IonSelectOption value="completed">Completed Only</IonSelectOption>
            </IonSelect>
          </IonItem>
          
          <IonItem button onClick={() => setShowClearAlert(true)}>
            <IonIcon icon={trashOutline} slot="start" color="danger" />
            <IonLabel color="danger">Clear All Tasks</IonLabel>
          </IonItem>
          
          <IonItemDivider>Account</IonItemDivider>
          
          <IonItem button onClick={() => setShowLogoutAlert(true)}>
            <IonIcon icon={logOutOutline} slot="start" />
            <IonLabel>Logout</IonLabel>
          </IonItem>
          
          {stats && (
            <>
              <IonItemDivider>Statistics</IonItemDivider>
              
              <IonItem>
                <IonLabel>Total Tasks</IonLabel>
                <IonLabel slot="end">{stats.total}</IonLabel>
              </IonItem>
              
              <IonItem>
                <IonLabel>Completed Tasks</IonLabel>
                <IonLabel slot="end">{stats.completed}</IonLabel>
              </IonItem>
              
              <IonItem>
                <IonLabel>Pending Tasks</IonLabel>
                <IonLabel slot="end">{stats.pending}</IonLabel>
              </IonItem>
              
              <IonItem>
                <IonLabel>Completion Rate</IonLabel>
                <IonLabel slot="end">
                  {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                </IonLabel>
              </IonItem>
            </>
          )}
        </IonList>
        
        <IonLoading isOpen={loading} message="Updating profile..." />
        
        <IonAlert
          isOpen={showLogoutAlert}
          onDidDismiss={() => setShowLogoutAlert(false)}
          header="Logout"
          message="Are you sure you want to logout?"
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
            },
            {
              text: 'Logout',
              handler: handleLogout,
            },
          ]}
        />
        
        <IonAlert
          isOpen={showClearAlert}
          onDidDismiss={() => setShowClearAlert(false)}
          header="Clear All Tasks"
          message="Are you sure you want to delete all your tasks? This action cannot be undone."
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
            },
            {
              text: 'Clear',
              handler: handleClearTasks,
              cssClass: 'danger',
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Settings;