"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Bell, 
  MessageSquare, 
  Users, 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  Info,
  Filter,
  Trash2,
  Settings,
  ChevronDown
} from "lucide-react";
import { useState } from "react";

interface Notification {
  id: string;
  type: 'system' | 'message' | 'learning' | 'social' | 'reminder';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'learning',
      title: 'Nouveau cours disponible',
      message: 'Le cours "Introduction à React" est maintenant disponible dans votre espace d\'apprentissage.',
      timestamp: 'Il y a 2 heures',
      read: false,
      priority: 'high',
      actionUrl: '/courses/react-intro'
    },
    {
      id: '2',
      type: 'message',
      title: 'Nouveau message de Jean Dupont',
      message: 'Bonjour ! J\'ai une question concernant le projet que nous travaillons ensemble.',
      timestamp: 'Il y a 4 heures',
      read: false,
      priority: 'medium',
      actionUrl: '/messages'
    },
    {
      id: '3',
      type: 'social',
      title: 'Nouvelle connexion',
      message: 'Marie Martin souhaite se connecter avec vous sur LearnSup.',
      timestamp: 'Il y a 6 heures',
      read: true,
      priority: 'low',
      actionUrl: '/connections'
    },
    {
      id: '4',
      type: 'reminder',
      title: 'Rappel : Session de mentorat',
      message: 'Votre session de mentorat avec Pierre Durand est prévue dans 2 heures.',
      timestamp: 'Il y a 1 jour',
      read: true,
      priority: 'medium',
      actionUrl: '/calendar'
    },
    {
      id: '5',
      type: 'system',
      title: 'Maintenance planifiée',
      message: 'LearnSup sera en maintenance le 30 août de 2h à 4h du matin.',
      timestamp: 'Il y a 2 jours',
      read: true,
      priority: 'low'
    },
    {
      id: '6',
      type: 'learning',
      title: 'Certification obtenue',
      message: 'Félicitations ! Vous avez obtenu la certification "Développeur Frontend".',
      timestamp: 'Il y a 3 jours',
      read: true,
      priority: 'high',
      actionUrl: '/certifications'
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    newFollowers: true,
    newReviews: true
  });

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-5 w-5" />;
      case 'learning':
        return <BookOpen className="h-5 w-5" />;
      case 'social':
        return <Users className="h-5 w-5" />;
      case 'reminder':
        return <Calendar className="h-5 w-5" />;
      case 'system':
        return <Info className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return 'Message';
      case 'learning':
        return 'Apprentissage';
      case 'social':
        return 'Social';
      case 'reminder':
        return 'Rappel';
      case 'system':
        return 'Système';
      default:
        return 'Notification';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'high') return notif.priority === 'high';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const highPriorityCount = notifications.filter(n => n.priority === 'high').length;

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col space-y-6 mb-6">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">Notifications</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Restez informé de vos activités et mises à jour
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center justify-center gap-2 w-full sm:w-auto h-10 px-4"
              >
                <Settings className="h-4 w-4" />
                Paramètres
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showSettings ? 'rotate-180' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="w-full sm:w-auto h-10 px-4"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Tout marquer comme lu
              </Button>
            </div>
          </div>

          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Filtres :</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
                className="text-xs sm:text-sm h-9 px-3"
              >
                Toutes ({notifications.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
                className="text-xs sm:text-sm h-9 px-3"
              >
                Non lues ({unreadCount})
              </Button>
              <Button
                variant={filter === 'high' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('high')}
                className="text-xs sm:text-sm h-9 px-3"
              >
                Priorité haute ({highPriorityCount})
              </Button>
            </div>
          </div>
        </div>

        {/* Paramètres des notifications */}
        {showSettings && (
          <Card className="mb-6 shadow-sm">
            <CardHeader className="pb-4 px-4 sm:px-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Settings className="h-5 w-5" />
                Paramètres des notifications
              </CardTitle>
              <CardDescription className="text-sm">
                Configurez vos préférences de notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6 pb-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Notifications par email</p>
                    <p className="text-xs text-muted-foreground">Recevoir des notifications par email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.email}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, email: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Nouveaux followers</p>
                    <p className="text-xs text-muted-foreground">Quand quelqu'un vous suit</p>
                  </div>
                  <Switch
                    checked={notificationSettings.newFollowers}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, newFollowers: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Nouvelles évaluations</p>
                    <p className="text-xs text-muted-foreground">Quand vous recevez une évaluation</p>
                  </div>
                  <Switch
                    checked={notificationSettings.newReviews}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, newReviews: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Liste des notifications */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="text-center py-8 sm:py-12 px-4 sm:px-6">
                <Bell className="h-12 w-16 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-base sm:text-lg font-medium mb-2">Aucune notification</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {filter === 'unread' 
                    ? 'Toutes vos notifications ont été lues'
                    : filter === 'high'
                    ? 'Aucune notification de priorité haute'
                    : 'Vous n\'avez pas encore de notifications'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-all duration-200 shadow-sm ${
                  !notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''
                }`}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                      !notification.read ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col space-y-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-medium text-sm sm:text-base ${
                            !notification.read ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPriorityColor(notification.priority)}`}
                          >
                            {getPriorityLabel(notification.priority)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(notification.type)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-3">
                        <span className="text-xs text-muted-foreground">
                          {notification.timestamp}
                        </span>
                        
                        <div className="flex flex-wrap items-center gap-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs h-8 px-3"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Marquer comme lu
                            </Button>
                          )}
                          
                          {notification.actionUrl && (
                            <Button variant="outline" size="sm" asChild className="text-xs h-8 px-3">
                              <a href={notification.actionUrl}>
                                Voir
                              </a>
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="text-xs h-8 px-3"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function getPriorityLabel(priority: Notification['priority']) {
  switch (priority) {
    case 'high':
      return 'Haute';
    case 'medium':
      return 'Moyenne';
    case 'low':
      return 'Basse';
    default:
      return 'Normale';
  }
}
