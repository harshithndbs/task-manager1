// src/pages/Home.tsx
import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonCardSubtitle,
  IonProgressBar,
  IonItem,
  IonLabel,
} from '@ionic/react';
import { 
  checkmarkCircleOutline, 
  timeOutline, 
  alertCircleOutline, 
  arrowForward 
} from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../contexts/TasksContext';
import './Home.css';

const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { tasks, stats, refreshStats } = useTasks();
  const [recentTasks, setRecentTasks] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshStats();
      
      // Get most recent tasks
      const sorted = [...tasks].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRecentTasks(sorted.slice(0, 3));
    }
  }, [isAuthenticated, tasks, refreshStats]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Task Manager</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="welcome-container">
          <h1>Welcome to Task Manager</h1>
          <p>Organize your tasks and boost your productivity</p>
          
          {!isAuthenticated && (
            <IonButton routerLink="/login" expand="block">
              Get Started
            </IonButton>
          )}
        </div>
        
        {isAuthenticated && stats && (
          <>
            <div className="stats-overview">
              <h2>Hello, {user?.name}</h2>
              <p>Here's your task overview</p>
              
              <IonProgressBar 
                value={stats.total > 0 ? stats.completed / stats.total : 0} 
                color="primary"
              ></IonProgressBar>
              
              <div className="progress-label">
                <span>Progress: {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</span>
                <span>{stats.completed}/{stats.total} tasks</span>
              </div>
            </div>
            
            <IonGrid>
              <IonRow>
                <IonCol size="6">
                  <IonCard className="stat-card completed-card">
                    <IonCardHeader>
                      <IonIcon icon={checkmarkCircleOutline} className="stat-icon" />
                      <IonCardTitle>{stats.completed}</IonCardTitle>
                      <IonCardSubtitle>Completed</IonCardSubtitle>
                    </IonCardHeader>
                  </IonCard>
                </IonCol>
                
                <IonCol size="6">
                  <IonCard className="stat-card pending-card">
                    <IonCardHeader>
                      <IonIcon icon={timeOutline} className="stat-icon" />
                      <IonCardTitle>{stats.pending}</IonCardTitle>
                      <IonCardSubtitle>Pending</IonCardSubtitle>
                    </IonCardHeader>
                  </IonCard>
                </IonCol>
              </IonRow>
              
              <IonRow>
                <IonCol>
                  <IonCard>
                    <IonCardHeader>
                      <IonCardTitle>Recent Tasks</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      {recentTasks.length > 0 ? (
                        recentTasks.map(task => (
                          <IonItem key={task.id} routerLink={`/tasks/${task.id}`}>
                            <IonIcon 
                              icon={task.completed ? checkmarkCircleOutline : timeOutline} 
                              slot="start"
                              color={task.completed ? 'success' : 
                                (task.priority === 'high' ? 'danger' : 'warning')}
                            />
                            <IonLabel>
                              <h2>{task.title}</h2>
                              <p>{task.category}</p>
                            </IonLabel>
                            <IonIcon icon={arrowForward} slot="end" />
                          </IonItem>
                        ))
                      ) : (
                        <p>No tasks yet. Add some tasks to get started!</p>
                      )}
                      
                      <IonButton expand="block" routerLink="/tasks" fill="clear">
                        View All Tasks
                      </IonButton>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
              
              {stats.total > 0 && (
                <IonRow>
                  <IonCol>
                    <IonCard>
                      <IonCardHeader>
                        <IonCardTitle>Tasks by Category</IonCardTitle>
                      </IonCardHeader>
                      <IonCardContent>
                        {Object.entries(stats.byCategory).map(([category, count]) => (
                          <div key={category} className="category-stat">
                            <span>{category}</span>
                            <span className="category-count">{count}</span>
                            <IonProgressBar 
                              value={count / stats.total} 
                              color="tertiary"
                            ></IonProgressBar>
                          </div>
                        ))}
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                </IonRow>
              )}
            </IonGrid>
          </>
        )}
        
        {!isAuthenticated && (
          <IonGrid>
            <IonRow>
              <IonCol>
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Organize Tasks</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    Create, categorize, and prioritize your tasks to stay organized.
                  </IonCardContent>
                </IonCard>
              </IonCol>
              
              <IonCol>
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Track Progress</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    Monitor your progress and see statistics about your completed tasks.
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
            
            <IonRow>
              <IonCol>
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Set Priorities</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    Set priorities for your tasks to focus on what matters most.
                  </IonCardContent>
                </IonCard>
              </IonCol>
              
              <IonCol>
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Stay Productive</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    Boost your productivity by organizing your work efficiently.
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        )}
      </IonContent>
    </IonPage>

     // src/app/home/home.page.ts
      )

    }
export default Home;