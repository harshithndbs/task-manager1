// src/pages/TaskDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonIcon,
  IonButton,
  IonChip,
  IonDatetime,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonAlert,
  IonBadge,
  IonToggle,
  IonActionSheet,
} from '@ionic/react';
import { 
  checkmarkCircleOutline, 
  timeOutline, 
  calendarOutline, 
  alertCircleOutline,
  trashOutline,
  createOutline,
  saveOutline,
  closeOutline,
  ellipsisHorizontal
} from 'ionicons/icons';
import { format } from 'date-fns';
import { useTasks } from '../contexts/TasksContext';
import { Task } from '../data/mockTasks';
import './TaskDetail.css';

interface EditData {
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { getTaskById, updateTask, deleteTask } = useTasks();
  
  const [task, setTask] = useState<Task | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [editData, setEditData] = useState<EditData>({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    category: 'Personal',
  });
  
  useEffect(() => {
    const currentTask = getTaskById(id);
    setTask(currentTask);
    
    if (currentTask) {
      setEditData({
        title: currentTask.title,
        description: currentTask.description,
        dueDate: currentTask.dueDate,
        priority: currentTask.priority,
        category: currentTask.category,
      });
    }
  }, [id, getTaskById]);
  
  const handleChange = (e: CustomEvent) => {
    const input = e.target as HTMLInputElement;
    const { name, value } = input;
    setEditData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleSave = async () => {
    if (task) {
      await updateTask(task.id, editData);
      setTask(prev => {
        if (!prev) return undefined;
        return {
          ...prev,
          ...editData
        };
      });
      setIsEditing(false);
    }
  };
  
  const toggleComplete = async () => {
    if (task) {
      const updatedStatus = !task.completed;
      await updateTask(task.id, { completed: updatedStatus });
      setTask(prev => {
        if (!prev) return undefined;
        return {
          ...prev,
          completed: updatedStatus
        };
      });
    }
  };
  
  const handleDelete = async () => {
    if (task) {
      await deleteTask(task.id);
      history.goBack();
    }
  };
  
  if (!task) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/tasks" />
            </IonButtons>
            <IonTitle>Task Not Found</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="ion-padding">
            <h2>Task not found</h2>
            <p>The task you're looking for does not exist.</p>
            <IonButton routerLink="/tasks">Go Back to Tasks</IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tasks" />
          </IonButtons>
          <IonTitle>{isEditing ? 'Edit Task' : 'Task Details'}</IonTitle>
          <IonButtons slot="end">
            {isEditing ? (
              <>
                <IonButton onClick={() => setIsEditing(false)}>
                  <IonIcon slot="icon-only" icon={closeOutline} />
                </IonButton>
                <IonButton onClick={handleSave}>
                  <IonIcon slot="icon-only" icon={saveOutline} />
                </IonButton>
              </>
            ) : (
              <IonButton onClick={() => setShowActionSheet(true)}>
                <IonIcon slot="icon-only" icon={ellipsisHorizontal} />
              </IonButton>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        <div className="task-status-indicator" style={{ 
          backgroundColor: task.completed ? '#10dc60' : 
            (task.priority === 'high' ? '#f04141' : 
            task.priority === 'medium' ? '#ffce00' : '#0cd1e8') 
        }}></div>
        
        {isEditing ? (
          <div className="ion-padding">
            <IonItem>
              <IonLabel position="stacked">Title</IonLabel>
              <IonTextarea
                name="title"
                value={editData.title}
                onIonChange={handleChange}
              />
            </IonItem>
            
            <IonItem>
              <IonLabel position="stacked">Description</IonLabel>
              <IonTextarea
                name="description"
                value={editData.description}
                rows={6}
                onIonChange={handleChange}
              />
            </IonItem>
            
            <IonItem>
              <IonLabel position="stacked">Due Date</IonLabel>
              <IonDatetime
                name="dueDate"
                value={editData.dueDate}
                onIonChange={handleChange}
              />
            </IonItem>
            
            <IonItem>
              <IonLabel position="stacked">Priority</IonLabel>
              <IonSelect
                name="priority"
                value={editData.priority}
                onIonChange={handleChange}
              >
                <IonSelectOption value="low">Low</IonSelectOption>
                <IonSelectOption value="medium">Medium</IonSelectOption>
                <IonSelectOption value="high">High</IonSelectOption>
              </IonSelect>
            </IonItem>
            
            <IonItem>
              <IonLabel position="stacked">Category</IonLabel>
              <IonSelect
                name="category"
                value={editData.category}
                onIonChange={handleChange}
              >
                <IonSelectOption value="Personal">Personal</IonSelectOption>
                <IonSelectOption value="Work">Work</IonSelectOption>
                <IonSelectOption value="School">School</IonSelectOption>
                <IonSelectOption value="Health">Health</IonSelectOption>
                <IonSelectOption value="Shopping">Shopping</IonSelectOption>
                <IonSelectOption value="Other">Other</IonSelectOption>
              </IonSelect>
            </IonItem>
          </div>
        ) : (
          <>
            <IonCard>
              <IonCardHeader>
                <div className="task-title-container">
                  <IonIcon 
                    icon={task.completed ? checkmarkCircleOutline : timeOutline} 
                    color={task.completed ? 'success' : 
                      (task.priority === 'high' ? 'danger' : 
                       task.priority === 'medium' ? 'warning' : 'primary')}
                    size="large"
                    className="task-status-icon"
                  />
                  <IonCardTitle className={task.completed ? 'completed-task' : ''}>
                    {task.title}
                  </IonCardTitle>
                </div>
                <div className="task-meta">
                  <IonChip color="tertiary">{task.category}</IonChip>
                  <IonBadge color={
                    task.priority === 'high' ? 'danger' : 
                    task.priority === 'medium' ? 'warning' : 'primary'
                  }>
                    {task.priority} priority
                  </IonBadge>
                </div>
              </IonCardHeader>
              
              <IonCardContent>
                <div className="task-description">
                  <h2>Description</h2>
                  <p>{task.description}</p>
                </div>
                
                <div className="task-details">
                  <IonItem lines="none">
                    <IonIcon icon={calendarOutline} slot="start" />
                    <IonLabel>
                      <h3>Due Date</h3>
                      <p>{format(new Date(task.dueDate), 'EEEE, MMMM d, yyyy')}</p>
                    </IonLabel>
                  </IonItem>
                  
                  <IonItem lines="none">
                    <IonIcon icon={task.completed ? checkmarkCircleOutline : timeOutline} slot="start" />
                    <IonLabel>
                      <h3>Status</h3>
                      <p>{task.completed ? 'Completed' : 'Pending'}</p>
                    </IonLabel>
                    <IonToggle 
                      checked={task.completed} 
                      onIonChange={toggleComplete}
                    />
                  </IonItem>
                  
                  <IonItem lines="none">
                    <IonIcon icon={alertCircleOutline} slot="start" />
                    <IonLabel>
                      <h3>Created</h3>
                      <p>{format(new Date(task.createdAt), 'MMM d, yyyy')}</p>
                    </IonLabel>
                  </IonItem>
                </div>
                
                <div className="task-actions">
                  <IonButton expand="block" onClick={() => setIsEditing(true)}>
                    <IonIcon slot="start" icon={createOutline} />
                    Edit Task
                  </IonButton>
                  
                  <IonButton 
                    expand="block" 
                    color="danger" 
                    onClick={() => setShowDeleteAlert(true)}
                  >
                    <IonIcon slot="start" icon={trashOutline} />
                    Delete Task
                  </IonButton>
                </div>
              </IonCardContent>
            </IonCard>
          </>
        )}
        
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
            },
            {
              text: 'Delete',
              role: 'destructive',
              handler: handleDelete,
            },
          ]}
        />
        
        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          buttons={[
            {
              text: 'Mark as ' + (task.completed ? 'Incomplete' : 'Complete'),
              icon: task.completed ? timeOutline : checkmarkCircleOutline,
              handler: toggleComplete,
            },
            {
              text: 'Edit',
              icon: createOutline,
              handler: () => setIsEditing(true),
            },
            {
              text: 'Delete',
              role: 'destructive',
              icon: trashOutline,
              handler: () => setShowDeleteAlert(true),
            },
            {
              text: 'Cancel',
              role: 'cancel',
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default TaskDetail;