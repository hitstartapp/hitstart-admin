import React from 'react';
import { Settings, MessageSquare } from 'lucide-react';

export type TableConfig = {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  dbName: string;
  fields: {
    name: string;
    label: string;
    type: 'text' | 'number' | 'json' | 'select' | 'textarea';
    required?: boolean;
    readOnlyOnEdit?: boolean;
    isPrimaryKey?: boolean;
    options?: { label: string; value: any }[];
  }[];
};

export const TABLES: TableConfig[] = [
  {
    id: 'configuration',
    name: 'Configuration',
    description: 'Edit global variables, configuration constants, and dynamic storage base URLs.',
    icon: Settings,
    dbName: 'Configuration',
    fields: [
      { name: 'configuration', label: 'Configuration Key', type: 'text', required: true },
      { name: 'value', label: 'Configuration Value', type: 'textarea', required: true }
    ]
  },
  {
    id: 'message',
    name: 'Message',
    description: 'Manage motivation quotes, system warnings, and push notification messages.',
    icon: MessageSquare,
    dbName: 'Message',
    fields: [
      {
        name: 'message_type',
        label: 'Message Type',
        type: 'select',
        options: [
          { label: 'Motivation', value: 'Motivation' },
          { label: 'Push', value: 'Push' }
        ],
        required: true
      },
      { name: 'message', label: 'Message Text', type: 'textarea', required: true }
    ]
  }
];

export const getColClass = (tableName: string, field: string) => {
  switch (tableName) {
    case 'Configuration':
      if (field === 'configuration') return 'w-[320px] flex-shrink-0';
      if (field === 'value') return 'flex-1 min-w-[350px]';
      break;
    case 'Message':
      if (field === 'message_type') return 'w-[150px] flex-shrink-0';
      if (field === 'message') return 'flex-1 min-w-[350px]';
      break;
  }
  return 'w-[150px] flex-shrink-0';
};