import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface Action {
  id: number;
  title: string;
  description: string;
  priority: 'critical' | 'important' | 'recommended';
  completed: boolean;
}

interface RecommendedActionsProps {
  actions: Action[];
  onToggleAction: (id: number) => void;
}

const RecommendedActions = ({ actions, onToggleAction }: RecommendedActionsProps) => {
  const priorityConfig = {
    critical: {
      bgColor: 'bg-error/10',
      textColor: 'text-error',
      borderColor: 'border-error',
      label: 'Critical',
    },
    important: {
      bgColor: 'bg-warning/10',
      textColor: 'text-warning',
      borderColor: 'border-warning',
      label: 'Important',
    },
    recommended: {
      bgColor: 'bg-trust-blue/10',
      textColor: 'text-trust-blue',
      borderColor: 'border-trust-blue',
      label: 'Recommended',
    },
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-brand">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="ClipboardDocumentCheckIcon" size={24} variant="solid" className="text-primary" />
        <h3 className="text-xl font-headline font-bold text-foreground">Recommended Actions</h3>
      </div>
      <div className="space-y-3">
        {actions.map((action) => {
          const config = priorityConfig[action.priority];
          return (
            <div
              key={action.id}
              className={`border ${config.borderColor} rounded-md p-4 transition-all duration-300 hover:shadow-subtle ${
                action.completed ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => onToggleAction(action.id)}
                  className="mt-1 flex-shrink-0"
                  aria-label={action.completed ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  <Icon
                    name="CheckCircleIcon"
                    size={20}
                    variant={action.completed ? 'solid' : 'outline'}
                    className={action.completed ? 'text-success-green' : 'text-muted-foreground/40'}
                  />
                </button>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`font-headline font-semibold text-sm text-foreground ${
                        action.completed ? 'line-through' : ''
                      }`}
                    >
                      {action.title}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${config.textColor} ${config.bgColor}`}
                    >
                      {config.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendedActions;