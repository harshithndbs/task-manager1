import React, { useState, useEffect } from 'react';
import { 
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonFab,
  IonFabButton,
  IonLoading,
  IonRefresher,
  IonRefresherContent,
  IonBadge,
  IonChip
} from '@ionic/react';
import { addOutline, checkmarkCircleOutline, timeOutline } from 'ionicons/icons';
import { useTasks } from '../contexts/TasksContext';
import './Tasks.css';

const Tasks: React.FC = () => {
  const { tasks, loading, error, fetchTasks } = useTasks();
  const [searchText, setSearchText] = useState('');
  const [segment, setSegment] = useState<'all' | 'pending' | 'completed'>('all');

  const handleRefresh = async (event: CustomEvent) => {
    await fetchTasks();
    event.detail.complete();
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = 
      segment === 'all' || 
      (segment === 'completed' && task.completed) || 
      (segment === 'pending' && !task.completed);
    return matchesSearch && matchesStatus;
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tasks</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar 
            value={searchText} 
            onIonChange={e => setSearchText(e.detail.value || '')} 
          />
        </IonToolbar>
        <IonToolbar>
          <IonSegment 
            value={segment} 
            onIonChange={e => setSegment(e.detail.value as any)}
          >
            <IonSegmentButton value="all">All</IonSegmentButton>
            <IonSegmentButton value="pending">Pending</IonSegmentButton>
            <IonSegmentButton value="completed">Completed</IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <IonLoading isOpen={loading} message="Loading tasks..." />

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <IonButton onClick={() => fetchTasks()}>Retry</IonButton>
          </div>
        )}

        {!loading && filteredTasks.length === 0 && (
          <div className="empty-state">
            <p>No tasks found</p>
          </div>
        )}

        <IonList>
          {filteredTasks.map(task => (
            <IonItem key={task.id} routerLink={`/tasks/${task.id}`}>
              <IonIcon 
                icon={task.completed ? checkmarkCircleOutline : timeOutline} 
                slot="start"
                color={task.completed ? 'success' : 'warning'}
              />
              <IonLabel>
                <h2>{task.title}</h2>
                <p>{task.description}</p>
              </IonLabel>
              <IonChip color="medium">{task.category}</IonChip>
            </IonItem>
          ))}
        </IonList>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton routerLink="/tasks/new">
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Tasks;