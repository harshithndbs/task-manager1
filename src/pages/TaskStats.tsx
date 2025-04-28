// src/pages/TaskStats.tsx
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
  IonLoading,
  IonButton,
  IonRefresher,
  IonRefresherContent,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonProgressBar,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonText
} from '@ionic/react';
import { 
  pieChart, 
  barChart, 
  calendarOutline, 
  checkmarkCircleOutline, 
  timeOutline,
  flagOutline
} from 'ionicons/icons';
import { useTasks } from '../contexts/TasksContext';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO, isAfter, isBefore } from 'date-fns';
import './TaskStats.css';

// Type for chart data
interface ChartData {
  name: string;
  value: number;
  color: string;
}

const TaskStats: React.FC = () => {
  const { tasks, loading, error, refreshStats, stats } = useTasks();
  const [chartType, setChartType] = useState<'category' | 'priority'>('category');
  const [timeRange, setTimeRange] = useState<'all' | 'week' | 'month'>('all');
  const [chartView, setChartView] = useState<'pie' | 'bar'>('pie');
  
  useEffect(() => {
    refreshStats();
  }, [refreshStats]);
  
  const handleRefresh = async (event: CustomEvent) => {
    await refreshStats();
    event.detail.complete();
  };
  
  // Filter tasks based on time range
  const filteredTasks = tasks.filter(task => {
    const taskDate = parseISO(task.dueDate);
    
    if (timeRange === 'all') {
      return true;
    } else if (timeRange === 'week') {
      const now = new Date();
      const weekStart = startOfWeek(now);
      const weekEnd = endOfWeek(now);
      return isWithinInterval(taskDate, { start: weekStart, end: weekEnd });
    } else if (timeRange === 'month') {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return isWithinInterval(taskDate, { start: monthStart, end: monthEnd });
    }
    
    return false;
  });
  
  // Calculate completion rate
  const completionRate = filteredTasks.length > 0 
    ? (filteredTasks.filter(task => task.completed).length / filteredTasks.length) * 100 
    : 0;
  
  // Calculate tasks by due date status
  const now = new Date();
  const overdueTasks = filteredTasks.filter(task => 
    !task.completed && isBefore(parseISO(task.dueDate), now)
  );
  const dueTodayTasks = filteredTasks.filter(task => 
    !task.completed && 
    format(parseISO(task.dueDate), 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')
  );
  const upcomingTasks = filteredTasks.filter(task => 
    !task.completed && isAfter(parseISO(task.dueDate), now) &&
    format(parseISO(task.dueDate), 'yyyy-MM-dd') !== format(now, 'yyyy-MM-dd')
  );
  
  // Process chart data
  const getCategoryData = (): ChartData[] => {
    const categoryMap = new Map<string, number>();
    
    filteredTasks.forEach(task => {
      const currentCount = categoryMap.get(task.category) || 0;
      categoryMap.set(task.category, currentCount + 1);
    });
    
    // Colors for different categories
    const categoryColors: Record<string, string> = {
      'Personal': '#3880ff',
      'Work': '#3dc2ff',
      'School': '#5260ff',
      'Health': '#2dd36f',
      'Finance': '#ffc409',
      'Home': '#eb445a',
      'Errands': '#92949c',
      'Learning': '#6a64ff',
      'Other': '#747474'
    };
    
    return Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([category, count]) => ({
        name: category,
        value: count,
        color: categoryColors[category] || '#747474'
      }));
  };
  
  const getPriorityData = (): ChartData[] => {
    const priorityCount = {
      high: 0,
      medium: 0,
      low: 0
    };
    
    filteredTasks.forEach(task => {
      priorityCount[task.priority]++;
    });
    
    return [
      { name: 'High', value: priorityCount.high, color: '#eb445a' },
      { name: 'Medium', value: priorityCount.medium, color: '#ffc409' },
      { name: 'Low', value: priorityCount.low, color: '#2dd36f' }
    ].filter(item => item.value > 0);
  };
  
  const chartData = chartType === 'category' ? getCategoryData() : getPriorityData();
  
  // Total for calculating percentages
  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);
  
  // Get color for priority
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
          <IonTitle>Task Statistics</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>
        
        <IonLoading isOpen={loading} message="Loading statistics..." />
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <IonButton onClick={() => refreshStats()}>Retry</IonButton>
          </div>
        )}
        
        <IonGrid className="ion-padding">
          <IonRow>
            <IonCol>
              <IonSegment value={timeRange} onIonChange={e => setTimeRange(e.detail.value as any)}>
                <IonSegmentButton value="all">All</IonSegmentButton>
                <IonSegmentButton value="week">This Week</IonSegmentButton>
                <IonSegmentButton value="month">This Month</IonSegmentButton>
              </IonSegment>
            </IonCol>
          </IonRow>
          
          <IonRow>
            <IonCol size="12" sizeMd="6">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Task Completion</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div className="completion-stats">
                    <div className="stats-circle">
                      <div className="stats-circle-inner">
                        <h2>{Math.round(completionRate)}%</h2>
                        <p>Completed</p>
                      </div>
                    </div>
                    
                    <div className="stats-details">
                      <div className="stats-item">
                        <IonIcon icon={checkmarkCircleOutline} color="success" />
                        <span>Completed: {filteredTasks.filter(t => t.completed).length}</span>
                      </div>
                      <div className="stats-item">
                        <IonIcon icon={timeOutline} color="warning" />
                        <span>Pending: {filteredTasks.filter(t => !t.completed).length}</span>
                      </div>
                      <div className="stats-item">
                        <IonIcon icon={calendarOutline} color="medium" />
                        <span>Total: {filteredTasks.length}</span>
                      </div>
                    </div>
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>
            
            <IonCol size="12" sizeMd="6">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Task Status</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div className="task-status-container">
                    <div className="status-item">
                      <div className="status-icon overdue">
                        <span>{overdueTasks.length}</span>
                      </div>
                      <div className="status-text">
                        <h3>Overdue</h3>
                        <p>Tasks past due date</p>
                      </div>
                    </div>
                    
                    <div className="status-item">
                      <div className="status-icon today">
                        <span>{dueTodayTasks.length}</span>
                      </div>
                      <div className="status-text">
                        <h3>Due Today</h3>
                        <p>Tasks due today</p>
                      </div>
                    </div>
                    
                    <div className="status-item">
                      <div className="status-icon upcoming">
                        <span>{upcomingTasks.length}</span>
                      </div>
                      <div className="status-text">
                        <h3>Upcoming</h3>
                        <p>Future tasks</p>
                      </div>
                    </div>
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
          
          <IonRow>
            <IonCol>
              <IonCard>
                <IonCardHeader>
                  <div className="chart-header">
                    <IonCardTitle>Tasks by {chartType === 'category' ? 'Category' : 'Priority'}</IonCardTitle>
                    <div className="chart-controls">
                      <IonButton 
                        fill="clear" 
                        size="small" 
                        onClick={() => setChartType('category')}
                        color={chartType === 'category' ? 'primary' : 'medium'}
                      >
                        Category
                      </IonButton>
                      <IonButton 
                        fill="clear" 
                        size="small" 
                        onClick={() => setChartType('priority')}
                        color={chartType === 'priority' ? 'primary' : 'medium'}
                      >
                        Priority
                      </IonButton>
                      <IonButton 
                        fill="clear" 
                        size="small" 
                        onClick={() => setChartView(chartView === 'pie' ? 'bar' : 'pie')}
                      >
                        <IonIcon icon={chartView === 'pie' ? barChart : pieChart} />
                      </IonButton>
                    </div>
                  </div>
                </IonCardHeader>
                <IonCardContent>
                  {chartData.length > 0 ? (
                    <div className={`chart-container ${chartView === 'pie' ? 'pie-chart' : 'bar-chart'}`}>
                      {chartView === 'pie' ? (
                        <div className="pie-chart-visual">
                          <svg viewBox="0 0 100 100" className="pie-svg">
                            {renderPieChart(chartData)}
                          </svg>
                          <div className="chart-legend-center">
                            <span>{total}</span>
                            <span>Total</span>
                          </div>
                        </div>
                      ) : (
                        <div className="bar-chart-visual">
                          {chartData.map((item, index) => (
                            <div className="bar-item" key={index}>
                              <div className="bar-label">{item.name}</div>
                              <div className="bar-container">
                                <div 
                                  className="bar" 
                                  style={{ 
                                    width: `${(item.value / Math.max(...chartData.map(d => d.value))) * 100}%`,
                                    backgroundColor: item.color 
                                  }}
                                ></div>
                                <span className="bar-value">{item.value}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="chart-legend">
                        {chartData.map((item, index) => (
                          <div className="legend-item" key={index}>
                            <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                            <div className="legend-text">
                              <span className="legend-name">{item.name}</span>
                              <span className="legend-value">{item.value} ({Math.round((item.value / total) * 100)}%)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="empty-chart">
                      <p>No tasks available for the selected time range</p>
                    </div>
                  )}
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
          
          <IonRow>
            <IonCol>
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Task Details</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div className="task-details-list">
                    {filteredTasks.length > 0 ? (
                      <>
                        {filteredTasks
                          .slice(0, 5) // Show only 5 tasks
                          .map(task => (
                            <IonItem key={task.id} lines="full" button routerLink={`/tasks/${task.id}`}>
                              <IonIcon 
                                slot="start" 
                                icon={task.completed ? checkmarkCircleOutline : timeOutline}
                                color={task.completed ? 'success' : getPriorityColor(task.priority)}
                              />
                              <IonLabel>
                                <h2 className={task.completed ? 'completed-task' : ''}>
                                  {task.title}
                                </h2>
                                <p>
                                  {task.category} •{' '}
                                  <IonText color={getPriorityColor(task.priority)}>
                                    {task.priority} priority
                                  </IonText>
                                </p>
                              </IonLabel>
                              <IonLabel slot="end" className="due-date">
                                <IonIcon icon={calendarOutline} />
                                {format(parseISO(task.dueDate), 'MMM d')}
                              </IonLabel>
                            </IonItem>
                          ))}
                          
                        {filteredTasks.length > 5 && (
                          <IonItem button routerLink="/tasks" lines="none">
                            <IonLabel className="view-all">
                              View all {filteredTasks.length} tasks
                            </IonLabel>
                          </IonItem>
                        )}
                      </>
                    ) : (
                      <div className="empty-state">
                        <p>No tasks available for the selected time range</p>
                      </div>
                    )}
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

// Function to render pie chart
const renderPieChart = (data: ChartData[]) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let currentAngle = 0;
  
  return data.map((item, index) => {
    const startAngle = currentAngle;
    const sliceAngle = (item.value / total) * 360;
    currentAngle += sliceAngle;
    
    const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
    const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
    const x2 = 50 + 40 * Math.cos(((startAngle + sliceAngle) * Math.PI) / 180);
    const y2 = 50 + 40 * Math.sin(((startAngle + sliceAngle) * Math.PI) / 180);
    
    const largeArcFlag = sliceAngle > 180 ? 1 : 0;
    
    const pathData = [
      `M 50 50`,
      `L ${x1} ${y1}`,
      `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');
    
    return (
      <path
        key={index}
        d={pathData}
        fill={item.color}
        stroke="#fff"
        strokeWidth="0.5"
      />
    );
  });
};

export default TaskStats;