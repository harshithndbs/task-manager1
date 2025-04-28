// src/App.tsx
import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { home, list, person, settings, analytics } from 'ionicons/icons';

// Import pages
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import NewTask from './pages/NewTask';
import Login from './pages/Login';
import Settings from './pages/Settings';
import TaskStats from './pages/TaskStats';

// Import context providers
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TasksProvider } from './contexts/TasksContext';
import { SettingsProvider } from './contexts/SettingsContext';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

// Protected Route component
const ProtectedRoute: React.FC<{
  component: React.ComponentType<any>;
  path: string;
  exact?: boolean;
}> = ({ component: Component, ...rest }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <Route
      {...rest}
      render={props =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
        )
      }
    />
  );
};

const AppTabs: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Switch>
          {/* Home route */}
          <Route path="/home" component={Home} exact />
          
          {/* Specific route for creating new task - MUST be before the dynamic route */}
          <ProtectedRoute path="/create-task" component={NewTask} exact />
          
          {/* Tasks routes */}
          <ProtectedRoute path="/tasks/:id" component={TaskDetail} exact />
          <ProtectedRoute path="/tasks" component={Tasks} exact />
          
          <ProtectedRoute path="/stats" component={TaskStats} exact />
          <Route path="/login" component={Login} exact />
          <ProtectedRoute path="/settings" component={Settings} exact />
          
          {/* Default redirect */}
          <Route exact path="/">
            <Redirect to="/home" />
          </Route>
        </Switch>
      </IonRouterOutlet>
      
      <IonTabBar slot="bottom">
        <IonTabButton tab="home" href="/home">
          <IonIcon icon={home} />
          <IonLabel>Home</IonLabel>
        </IonTabButton>
        
        <IonTabButton tab="tasks" href="/tasks">
          <IonIcon icon={list} />
          <IonLabel>Tasks</IonLabel>
        </IonTabButton>
        
        {isAuthenticated && (
          <IonTabButton tab="stats" href="/stats">
            <IonIcon icon={analytics} />
            <IonLabel>Stats</IonLabel>
          </IonTabButton>
        )}
        
        {isAuthenticated ? (
          <IonTabButton tab="settings" href="/settings">
            <IonIcon icon={settings} />
            <IonLabel>Settings</IonLabel>
          </IonTabButton>
        ) : (
          <IonTabButton tab="login" href="/login">
            <IonIcon icon={person} />
            <IonLabel>Login</IonLabel>
          </IonTabButton>
        )}
      </IonTabBar>
    </IonTabs>
  );
};

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <TasksProvider>
        <SettingsProvider>
          <IonReactRouter>
            <AppTabs />
          </IonReactRouter>
        </SettingsProvider>
      </TasksProvider>
    </AuthProvider>
  </IonApp>
);

export default App;