// src/components/TaskForm.tsx
import React, { useState, useEffect } from 'react';
import {
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonToggle,
  IonChip,
  IonNote
} from '@ionic/react';
import { 
  saveOutline, 
  closeOutline, 
  calendarOutline, 
  flagOutline,
  listOutline,
  checkmarkOutline
} from 'ionicons/icons';
import { format } from 'date-fns';
import { Task } from '../data/mockTasks';
import './TaskForm.css';

interface TaskFormProps {
  initialData?: Partial<Task>;
  onSubmit: (taskData: Partial<Task>) => Promise<void>;
  onCancel: () => void;
  submitButtonText?: string;
  isEdit?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  submitButtonText = 'Save Task',
  isEdit = false
}) => {
  // Form state
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [dueDate, setDueDate] = useState(initialData.dueDate || format(new Date(), 'yyyy-MM-dd'));
  const [priority, setPriority] = useState(initialData.priority || 'medium');
  const [category, setCategory] = useState(initialData.category || 'Personal');
  const [completed, setCompleted] = useState(initialData.completed || false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Predefined categories
  const categories = [
    'Personal',
    'Work',
    'School',
    'Health',
    'Finance',
    'Home',
    'Errands',
    'Learning',
    'Other'
  ];

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const taskData: Partial<Task> = {
      title,
      description,
      dueDate,
      priority: priority as 'low' | 'medium' | 'high',
      category,
      completed
    };
    
    await onSubmit(taskData);
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return 'Select date';
    }
  };

  // Get color based on priority
  const getPriorityColor = (pri: string) => {
    switch (pri) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'medium';
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <IonGrid>
        <IonRow>
          <IonCol>
            <IonItem className={errors.title ? 'ion-invalid' : ''}>
              <IonLabel position="stacked">Title *</IonLabel>
              <IonInput
                value={title}
                onIonChange={e => setTitle(e.detail.value!)}
                placeholder="What needs to be done?"
                required
              />
              {errors.title && <IonNote slot="error">{errors.title}</IonNote>}
            </IonItem>
          </IonCol>
        </IonRow>
        
        <IonRow>
          <IonCol>
            <IonItem>
              <IonLabel position="stacked">Description</IonLabel>
              <IonTextarea
                value={description}
                onIonChange={e => setDescription(e.detail.value!)}
                placeholder="Add details about this task"
                rows={4}
                autoGrow={true}
              />
            </IonItem>
          </IonCol>
        </IonRow>
        
        <IonRow>
          <IonCol>
            <IonItem button onClick={() => setShowDatePicker(true)} className={errors.dueDate ? 'ion-invalid' : ''}>
              <IonIcon icon={calendarOutline} slot="start" color="primary" />
              <IonLabel>Due Date *</IonLabel>
              <div slot="end">{formatDate(dueDate)}</div>
              {errors.dueDate && <IonNote slot="error">{errors.dueDate}</IonNote>}
            </IonItem>
            
            {showDatePicker && (
              <IonDatetime
                value={dueDate}
                onIonChange={e => {
                  setDueDate(e.detail.value as string);
                  setShowDatePicker(false);
                }}
                onIonCancel={() => setShowDatePicker(false)}
                showDefaultButtons={true}
                presentation="date"
                className="date-picker-modal"
              />
            )}
          </IonCol>
        </IonRow>
        
        <IonRow>
          <IonCol>
            <IonItem>
              <IonIcon icon={flagOutline} slot="start" color={getPriorityColor(priority)} />
              <IonLabel>Priority</IonLabel>
              <IonSelect
                value={priority}
                onIonChange={e => setPriority(e.detail.value)}
                interface="popover"
              >
                <IonSelectOption value="low">Low</IonSelectOption>
                <IonSelectOption value="medium">Medium</IonSelectOption>
                <IonSelectOption value="high">High</IonSelectOption>
              </IonSelect>
            </IonItem>
          </IonCol>
        </IonRow>
        
        <IonRow>
          <IonCol>
            <IonItem>
              <IonIcon icon={listOutline} slot="start" color="tertiary" />
              <IonLabel>Category</IonLabel>
              <IonSelect
                value={category}
                onIonChange={e => setCategory(e.detail.value)}
                interface="popover"
              >
                {categories.map(cat => (
                  <IonSelectOption key={cat} value={cat}>{cat}</IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
          </IonCol>
        </IonRow>
        
        {isEdit && (
          <IonRow>
            <IonCol>
              <IonItem>
                <IonIcon icon={checkmarkOutline} slot="start" color={completed ? 'success' : 'medium'} />
                <IonLabel>Completed</IonLabel>
                <IonToggle
                  checked={completed}
                  onIonChange={e => setCompleted(e.detail.checked)}
                />
              </IonItem>
            </IonCol>
          </IonRow>
        )}
        
        <IonRow className="form-actions">
          <IonCol>
            <IonButton 
              expand="block"
              onClick={onCancel}
              fill="outline"
              color="medium"
            >
              <IonIcon slot="start" icon={closeOutline} />
              Cancel
            </IonButton>
          </IonCol>
          <IonCol>
            <IonButton 
              expand="block"
              type="submit"
              color="primary"
            >
              <IonIcon slot="start" icon={saveOutline} />
              {submitButtonText}
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    </form>
  );
};

export default TaskForm;