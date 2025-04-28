// src/pages/Tasks.tsx
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
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
  IonChip,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonAlert,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButtons
} from '@ionic/react';
import { 
  addOutline, 
  checkmarkCircleOutline, 
  timeOutline, 
  calendarOutline,
  trashOutline,
  createOutline,
  filterOutline
} from 'ionicons/icons';
import { useTasks } from '../contexts/TasksContext';
import { format } from 'date-fns';
import './Tasks.css';

const Tasks: React.FC = () => {
  const { tasks, loading, error, fetchTasks, updateTask, deleteTask } = useTasks();
  const [searchText, setSearchText] = useState('');
  const [segment, setSegment] = useState<'all' | 'pending' | 'completed'>('all');
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'category'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  
  // Add history for programmatic navigation
  const history = useHistory();

  // Extract unique categories from tasks
  const categories = [...new Set(tasks.map(task => task.category))];
  
  // Handle refresh
  const handleRefresh = async (event: CustomEvent) => {
    await fetchTasks();
    event.detail.complete();
  };

  // Navigate to new task page
  const goToNewTask = () => {
    // Use /create-task instead of /tasks/new to avoid route conflicts
    history.push('/create-task');
  };

  // Toggle task completion
  const toggleTaskCompletion = async (id: string, currentStatus: boolean) => {
    await updateTask(id, { completed: !currentStatus });
  };

  // Confirm task deletion
  const confirmDeleteTask = (id: string) => {
    setTaskToDelete(id);
    setShowDeleteAlert(true);
  };

  // Delete task
  const handleDeleteTask = async () => {
    if (taskToDelete) {
      await deleteTask(taskToDelete);
      setTaskToDelete(null);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilterCategory(null);
    setFilterPriority(null);
    setShowFilters(false);
  };

  // Filter and sort tasks
  const processedTasks = tasks
    .filter(task => {
      // Search text filter
      const matchesSearch = task.title.toLowerCase().includes(searchText.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchText.toLowerCase());
      
      // Segment filter (all, pending, completed)
      const matchesStatus = 
        segment === 'all' || 
        (segment === 'completed' && task.completed) || 
        (segment === 'pending' && !task.completed);
      
      // Category filter
      const matchesCategory = !filterCategory || task.category === filterCategory;
      
      // Priority filter
      const matchesPriority = !filterPriority || task.priority === filterPriority;
      
      return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
    })
    .sort((a, b) => {
      // Sort by selected criterion
      if (sortBy === 'dueDate') {
        return sortOrder === 'asc' 
          ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      } else if (sortBy === 'priority') {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        return sortOrder === 'asc'
          ? priorityWeight[a.priority as keyof typeof priorityWeight] - priorityWeight[b.priority as keyof typeof priorityWeight]
          : priorityWeight[b.priority as keyof typeof priorityWeight] - priorityWeight[a.priority as keyof typeof priorityWeight];
      } else { // category
        return sortOrder === 'asc'
          ? a.category.localeCompare(b.category)
          : b.category.localeCompare(a.category);
      }
    });

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
          <IonTitle>Tasks</IonTitle>
          <IonButtons slot="end">
            <IonButton slot="end" fill="clear" onClick={() => setShowFilters(!showFilters)}>
              <IonIcon icon={filterOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar 
            value={searchText} 
            onIonChange={e => setSearchText(e.detail.value || '')} 
            placeholder="Search tasks..."
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

        {showFilters && (
          <IonToolbar>
            <IonGrid>
              <IonRow>
                <IonCol size="6">
                  <IonSelect 
                    placeholder="Category" 
                    value={filterCategory}
                    onIonChange={e => setFilterCategory(e.detail.value)}
                  >
                    {categories.map(category => (
                      <IonSelectOption key={category} value={category}>{category}</IonSelectOption>
                    ))}
                  </IonSelect>
                </IonCol>
                <IonCol size="6">
                  <IonSelect 
                    placeholder="Priority" 
                    value={filterPriority}
                    onIonChange={e => setFilterPriority(e.detail.value)}
                  >
                    <IonSelectOption value="high">High</IonSelectOption>
                    <IonSelectOption value="medium">Medium</IonSelectOption>
                    <IonSelectOption value="low">Low</IonSelectOption>
                  </IonSelect>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol size="6">
                  <IonSelect 
                    placeholder="Sort by" 
                    value={sortBy}
                    onIonChange={e => setSortBy(e.detail.value)}
                  >
                    <IonSelectOption value="dueDate">Due Date</IonSelectOption>
                    <IonSelectOption value="priority">Priority</IonSelectOption>
                    <IonSelectOption value="category">Category</IonSelectOption>
                  </IonSelect>
                </IonCol>
                <IonCol size="6">
                  <IonSelect 
                    placeholder="Order" 
                    value={sortOrder}
                    onIonChange={e => setSortOrder(e.detail.value)}
                  >
                    <IonSelectOption value="asc">Ascending</IonSelectOption>
                    <IonSelectOption value="desc">Descending</IonSelectOption>
                  </IonSelect>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <IonButton expand="block" size="small" onClick={resetFilters}>
                    Reset Filters
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonToolbar>
        )}
      </IonHeader>

      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <IonLoading isOpen={loading} message="Loading tasks..." />

        {/* New Task Button Card - Using onClick with new path */}
        <IonCard className="add-task-card">
          <IonCardContent>
            <div className="add-task-container">
              <div>
                <h2>Manage Your Tasks</h2>
                <p>Create a new task to track your work</p>
              </div>
              <IonButton onClick={goToNewTask} fill="solid" color="primary">
                <IonIcon slot="start" icon={addOutline} />
                Add New Task
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <IonButton onClick={() => fetchTasks()}>Retry</IonButton>
          </div>
        )}

        {!loading && processedTasks.length === 0 && (
          <div className="empty-state">
            <h3>No tasks found</h3>
            <p>
              {searchText || filterCategory || filterPriority ? 
                'Try changing your search or filters' : 
                'Add some tasks to get started!'}
            </p>
            <IonButton onClick={goToNewTask}>
              <IonIcon slot="start" icon={addOutline} />
              Add New Task
            </IonButton>
          </div>
        )}

        <IonList>
          {processedTasks.map(task => (
            <IonItemSliding key={task.id}>
              <IonItem 
                className="task-item"
                detail={true} 
                onClick={() => history.push(`/tasks/${task.id}`)}
              >
                <IonIcon 
                  icon={task.completed ? checkmarkCircleOutline : timeOutline} 
                  slot="start"
                  color={task.completed ? 'success' : getPriorityColor(task.priority)}
                  className="task-status-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTaskCompletion(task.id, task.completed);
                  }}
                />
                <div className="task-content">
                  <h2 className={`task-title ${task.completed ? 'completed-task' : ''}`}>
                    {task.title}
                  </h2>
                  <p className="task-description">{task.description}</p>
                  <div className="task-meta">
                    <IonChip className="task-category" color="tertiary" outline>
                      {task.category}
                    </IonChip>
                    <IonBadge color={getPriorityColor(task.priority)}>
                      {task.priority}
                    </IonBadge>
                    <span className="due-date">
                      <IonIcon icon={calendarOutline} />
                      {format(new Date(task.dueDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </IonItem>

              <IonItemOptions side="end">
                <IonItemOption 
                  color={task.completed ? 'warning' : 'success'}
                  onClick={() => toggleTaskCompletion(task.id, task.completed)}
                >
                  <IonIcon slot="icon-only" icon={task.completed ? timeOutline : checkmarkCircleOutline} />
                </IonItemOption>
                <IonItemOption color="primary" onClick={() => history.push(`/tasks/${task.id}`)}>
                  <IonIcon slot="icon-only" icon={createOutline} />
                </IonItemOption>
                <IonItemOption 
                  color="danger"
                  onClick={() => confirmDeleteTask(task.id)}
                >
                  <IonIcon slot="icon-only" icon={trashOutline} />
                </IonItemOption>
              </IonItemOptions>
            </IonItemSliding>
          ))}
        </IonList>

        {/* Keep the FAB as well for quick access */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={goToNewTask}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Delete Task"
          message="Are you sure you want to delete this task?"
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
            },
            {
              text: 'Delete',
              role: 'destructive',
              handler: handleDeleteTask,
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Tasks;