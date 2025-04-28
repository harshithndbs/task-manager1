import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonAlert,
  IonLoading,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
} from '@ionic/react';
import { 
  personOutline, 
  mailOutline, 
  lockClosedOutline, 
  logInOutline, 
  personAddOutline 
} from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  const { login, register, loading, error, clearError, isAuthenticated } = useAuth();
  const history = useHistory();
  
  // Using useEffect for redirection after authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      history.push('/tasks'); // Redirect after successful login
    }
  }, [isAuthenticated, history]); // Dependency on isAuthenticated to ensure it runs when it changes

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setAlertMessage('Please enter both email and password');
      setShowAlert(true);
      return;
    }
    
    await login(email, password);
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      setAlertMessage('Please fill in all fields');
      setShowAlert(true);
      return;
    }
    
    if (password.length < 6) {
      setAlertMessage('Password should be at least 6 characters');
      setShowAlert(true);
      return;
    }
    
    await register(name, email, password);
  };
  
  const handleModeChange = (value: 'login' | 'register') => {
    clearError();
    setMode(value);
  };
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{mode === 'login' ? 'Login' : 'Create Account'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        <div className="auth-container">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</IonCardTitle>
            </IonCardHeader>
            
            <IonCardContent>
              <IonSegment 
                value={mode}
                onIonChange={e => {
                  if (e.detail.value) {
                    handleModeChange(e.detail.value as 'login' | 'register');
                  }
                }}
              >
                <IonSegmentButton value="login">
                  <IonIcon icon={logInOutline} />
                  <IonLabel>Login</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="register">
                  <IonIcon icon={personAddOutline} />
                  <IonLabel>Register</IonLabel>
                </IonSegmentButton>
              </IonSegment>
              
              <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
                {mode === 'register' && (
                  <IonItem>
                    <IonIcon icon={personOutline} slot="start" />
                    <IonLabel position="floating">Name</IonLabel>
                    <IonInput
                      value={name}
                      onIonChange={e => setName(e.detail.value!)}
                      required
                    />
                  </IonItem>
                )}
                
                <IonItem>
                  <IonIcon icon={mailOutline} slot="start" />
                  <IonLabel position="floating">Email</IonLabel>
                  <IonInput
                    type="email"
                    value={email}
                    onIonChange={e => setEmail(e.detail.value!)}
                    required
                  />
                </IonItem>
                
                <IonItem>
                  <IonIcon icon={lockClosedOutline} slot="start" />
                  <IonLabel position="floating">Password</IonLabel>
                  <IonInput
                    type="password"
                    value={password}
                    onIonChange={e => setPassword(e.detail.value!)}
                    required
                  />
                </IonItem>
                
                {error && <div className="error-message">{error}</div>}
                
                <div className="auth-button-container">
                  <IonButton expand="block" type="submit">
                    {mode === 'login' ? 'Login' : 'Create Account'}
                  </IonButton>
                </div>
              </form>
            </IonCardContent>
          </IonCard>
        </div>
        
        <IonLoading isOpen={loading} message="Please wait..." />
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Notice"
          message={alertMessage}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;