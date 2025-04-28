// src/pages/TaskDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
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
  IonAlert,
  IonBadge,
  IonToggle,
  IonActionSheet,
  IonToast,
  IonLoading,
  IonInput,
  IonTextarea,
  IonDatetime,
  IonSelect,
  IonSelectOption
} from '@ionic/react';
import { 
  checkmarkCircleOutline, 
  timeOutline, 
  calendarOutline, 
  alertCircleOutline,
  trashOutline,
  createOutline,
  ellipsisHorizontal,
  saveOutline,
  closeOutline
} from 'ionicons/icons';
import { format } from 'date-fns';
import { useTasks } from '../contexts/TasksContext';
import { Task } from '../data/mockTasks';

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { getTaskById, updateTask, deleteTask } = useTasks();
  
  const [task, setTask] = useState<Task | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Form state for editing
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editCategory, setEditCategory] = useState('');
  
  useEffect(() => {
    const currentTask = getTaskById(id);
    
    if (currentTask) {
      setTask(currentTask);
      // Initialize form fields with current task data
      setEditTitle(currentTask.title);
      setEditDescription(currentTask.description);
      setEditDueDate(currentTask.dueDate);
      setEditPriority(currentTask.priority);
      setEditCategory(currentTask.category);
    } else {
      // Handle case where task is not found
      console.log(`Task with id ${id} not found`);
    }
  }, [id, getTaskById]);
  
  const handleUpdateTask = async () => {
    if (!task) return;
    
    setLoading(true);
    
    try {
      const updatedData = {
        title: editTitle,
        description: editDescription,
        dueDate: editDueDate,
        priority: editPriority,
        category: editCategory
      };
      
      await updateTask(task.id, updatedData);
      
      // Update local state
      setTask(prev => {
        if (!prev) return undefined;
        return {
          ...prev,
          ...updatedData
        };
      });
      
      setToastMessage('Task updated successfully!');
      setShowToast(true);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
      setToastMessage('Failed to update task. Please try again.');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleComplete = async () => {
    if (!task) return;
    
    try {
      const updatedStatus = !task.completed;
      await updateTask(task.id, { completed: updatedStatus });
      
      setTask(prev => {
        if (!prev) return undefined;
        return {
          ...prev,
          completed: updatedStatus
        };
      });
      
      setToastMessage(`Task marked as ${updatedStatus ? 'completed' : 'pending'}`);
      setShowToast(true);
    } catch (error) {
      console.error('Error toggling task completion:', error);
      setToastMessage('Failed to update task status. Please try again.');
      setShowToast(true);
    }
  };
  
  const handleDelete = async () => {
    if (!task) return;
    
    setLoading(true);
    
    try {
      await deleteTask(task.id);
      setToastMessage('Task deleted successfully!');
      setShowToast(true);
      
      // Navigate back to tasks list after a short delay
      setTimeout(() => {
        history.push('/tasks');
      }, 1000);
    } catch (error) {
      console.error('Error deleting task:', error);
      setToastMessage('Failed to delete task. Please try again.');
      setShowToast(true);
    } finally {
      setLoading(false);
      setShowDeleteAlert(false);
    }
  };
  
  const handleCancelEdit = () => {
    // Reset form fields to original values
    if (task) {
      setEditTitle(task.title);
      setEditDescription(task.description);
      setEditDueDate(task.dueDate);
      setEditPriority(task.priority);
      setEditCategory(task.category);
    }
    setIsEditing(false);
  };
  
  // Handle case where task is not found
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
  
  // Get color based on priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'medium';
    }
  };
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tasks" />
          </IonButtons>
          <IonTitle>{isEditing ? 'Edit Task' : 'Task Details'}</IonTitle>
          {isEditing ? (
            <IonButtons slot="end">
              <IonButton onClick={handleCancelEdit}>
                <IonIcon slot="icon-only" icon={closeOutline} />
              </IonButton>
              <IonButton onClick={handleUpdateTask}>
                <IonIcon slot="icon-only" icon={saveOutline} />
              </IonButton>
            </IonButtons>
          ) : (
            <IonButtons slot="end">
              <IonButton onClick={() => setShowActionSheet(true)}>
                <IonIcon slot="icon-only" icon={ellipsisHorizontal} />
              </IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        <div className="task-status-indicator" style={{ 
          backgroundColor: task.completed ? 'var(--ion-color-success)' : 
            (task.priority === 'high' ? 'var(--ion-color-danger)' : 
            task.priority === 'medium' ? 'var(--ion-color-warning)' : 'var(--ion-color-primary)') 
        }}></div>
        
        {isEditing ? (
          <div className="ion-padding">
            <IonCard>
              <IonCardContent>
                <IonItem>
                  <IonLabel position="stacked">Title</IonLabel>
                  <IonInput 
                    value={editTitle} 
                    onIonChange={e => setEditTitle(e.detail.value || '')} 
                  />
                </IonItem>
                
                <IonItem>
                  <IonLabel position="stacked">Description</IonLabel>
                  <IonTextarea 
                    value={editDescription} 
                    onIonChange={e => setEditDescription(e.detail.value || '')} 
                    rows={4}
                  />
                </IonItem>
                
                <IonItem>
                  <IonLabel position="stacked">Due Date</IonLabel>
                  <IonDatetime 
                    value={editDueDate} 
                    onIonChange={(e: CustomEvent) => {
                      if (e.detail.value) {
                        setEditDueDate(e.detail.value as string);
                      }
                    }} 
                    presentation="date"
                  />
                </IonItem>
                
                <IonItem>
                  <IonLabel position="stacked">Priority</IonLabel>
                  <IonSelect 
                    value={editPriority} 
                    onIonChange={e => setEditPriority(e.detail.value)} 
                  >
                    <IonSelectOption value="low">Low</IonSelectOption>
                    <IonSelectOption value="medium">Medium</IonSelectOption>
                    <IonSelectOption value="high">High</IonSelectOption>
                  </IonSelect>
                </IonItem>
                
                <IonItem>
                  <IonLabel position="stacked">Category</IonLabel>
                  <IonSelect 
                    value={editCategory} 
                    onIonChange={e => setEditCategory(e.detail.value)} 
                  >
                    <IonSelectOption value="Personal">Personal</IonSelectOption>
                    <IonSelectOption value="Work">Work</IonSelectOption>
                    <IonSelectOption value="School">School</IonSelectOption>
                    <IonSelectOption value="Health">Health</IonSelectOption>
                    <IonSelectOption value="Finance">Finance</IonSelectOption>
                    <IonSelectOption value="Home">Home</IonSelectOption>
                    <IonSelectOption value="Other">Other</IonSelectOption>
                  </IonSelect>
                </IonItem>
                
                <IonItem>
                  <IonLabel>Completed</IonLabel>
                  <IonToggle
                    checked={task.completed}
                    onIonChange={toggleComplete}
                  />
                </IonItem>
              </IonCardContent>
            </IonCard>
          </div>
        ) : (
          <>
            <IonCard>
              <IonCardHeader>
                <div className="task-title-container">
                  <IonIcon 
                    icon={task.completed ? checkmarkCircleOutline : timeOutline} 
                    color={task.completed ? 'success' : getPriorityColor(task.priority)}
                    size="large"
                    className="task-status-icon"
                  />
                  <IonCardTitle className={task.completed ? 'completed-task' : ''}>
                    {task.title}
                  </IonCardTitle>
                </div>
                <div className="task-meta">
                  <IonChip color="tertiary">{task.category}</IonChip>
                  <IonBadge color={getPriorityColor(task.priority)}>
                    {task.priority} priority
                  </IonBadge>
                </div>
              </IonCardHeader>
              
              <IonCardContent>
                <div className="task-description">
                  <h2>Description</h2>
                  <p>{task.description || 'No description provided.'}</p>
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
        
        <IonLoading isOpen={loading} message="Please wait..." />
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="bottom"
          color={toastMessage.includes('Failed') ? 'danger' : 'success'}
        />
        
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
      
      <style>{`
        .task-status-indicator {
          height: 8px;
          width: 100%;
        }
        
        .task-title-container {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .task-status-icon {
          margin-right: 10px;
        }
        
        .completed-task {
          text-decoration: line-through;
          opacity: 0.7;
        }
        
        .task-meta {
          display: flex;
          align-items: center;
          margin-top: 10px;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .task-description {
          margin-bottom: 20px;
        }
        
        .task-description h2 {
          font-size: 18px;
          margin-bottom: 10px;
          color: var(--ion-color-primary);
        }
        
        .task-details {
          margin-bottom: 20px;
          border-bottom: 1px solid var(--ion-color-light);
          padding-bottom: 20px;
        }
        
        .task-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
      `}</style>
    </IonPage>
  );
};

export default TaskDetail;