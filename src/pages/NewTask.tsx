// src/pages/NewTask.tsx
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonToast,
  IonLoading,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonTextarea,
  IonDatetime,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle
} from '@ionic/react';
import { useTasks } from '../contexts/TasksContext';
import { Task } from '../data/mockTasks';

const NewTask: React.FC = () => {
  const { createTask } = useTasks();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString());
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('Personal');
  
  // Validation state
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateTask = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      await createTask({
        title,
        description,
        dueDate,
        priority,
        category,
        completed: false
      });
      
      setToastMessage('Task created successfully!');
      setShowToast(true);
      
      // Navigate back to tasks list after a short delay
      setTimeout(() => {
        history.push('/tasks');
      }, 1000);
    } catch (error) {
      console.error('Error creating task:', error);
      setToastMessage('Failed to create task. Please try again.');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    history.push('/tasks'); // Use explicit path instead of goBack
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tasks" />
          </IonButtons>
          <IonTitle>New Task</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Create a New Task</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateTask(); }}>
              <IonItem className={errors.title ? 'ion-invalid' : ''}>
                <IonLabel position="floating">Title *</IonLabel>
                <IonInput 
                  value={title} 
                  onIonChange={(e) => setTitle(e.detail.value || '')} 
                  required
                />
                {errors.title && <div className="error-message">{errors.title}</div>}
              </IonItem>
              
              <IonItem>
                <IonLabel position="floating">Description</IonLabel>
                <IonTextarea 
                  value={description} 
                  onIonChange={(e) => setDescription(e.detail.value || '')} 
                  rows={4}
                />
              </IonItem>
              
              <IonItem className={errors.dueDate ? 'ion-invalid' : ''}>
                <IonLabel position="floating">Due Date *</IonLabel>
                <IonDatetime 
                  value={dueDate} 
                  onIonChange={(e: CustomEvent) => {
                    if (e.detail.value) {
                      setDueDate(e.detail.value as string);
                    } else {
                      setDueDate(new Date().toISOString());
                    }
                  }}
                  presentation="date"
                />
                {errors.dueDate && <div className="error-message">{errors.dueDate}</div>}
              </IonItem>
              
              <IonItem>
                <IonLabel position="floating">Priority</IonLabel>
                <IonSelect 
                  value={priority} 
                  onIonChange={(e) => setPriority(e.detail.value)} 
                >
                  <IonSelectOption value="low">Low</IonSelectOption>
                  <IonSelectOption value="medium">Medium</IonSelectOption>
                  <IonSelectOption value="high">High</IonSelectOption>
                </IonSelect>
              </IonItem>
              
              <IonItem>
                <IonLabel position="floating">Category</IonLabel>
                <IonSelect 
                  value={category} 
                  onIonChange={(e) => setCategory(e.detail.value)} 
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
              
              <div className="form-buttons">
                <IonButton onClick={handleCancel} fill="outline" color="medium">
                  Cancel
                </IonButton>
                <IonButton onClick={handleCreateTask} fill="solid" color="primary">
                  Create Task
                </IonButton>
              </div>
            </form>
          </IonCardContent>
        </IonCard>

        <IonLoading isOpen={loading} message="Creating task..." />
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="bottom"
          color={toastMessage.includes('Failed') ? 'danger' : 'success'}
        />
      </IonContent>
      
      <style>{`
        .form-buttons {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
          gap: 10px;
        }
        
        .error-message {
          color: var(--ion-color-danger);
          font-size: 0.8rem;
          margin-top: 5px;
          padding-left: 16px;
        }
        
        ion-item.ion-invalid {
          --border-color: var(--ion-color-danger);
        }
      `}</style>
    </IonPage>
  );
};

export default NewTask;