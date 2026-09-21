import { ListTree, Apple } from 'lucide-react';
import React from 'react';

export type TableConfig = {
  id: string;
  name: string;
  description: string;
  dbName: string;
  fields: {
    name: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'textarea' | 'boolean';
    required?: boolean;
    readOnlyOnEdit?: boolean;
    isPrimaryKey?: boolean;
    hidden?: boolean;
    options?: { label: string; value: any }[] | string;
  }[];
};

export const TABLES: TableConfig[] = [
  {
    id: 'mealplan',
    name: 'Meal Plan',
    description: 'Manage root meal plans and their metadata.',
    dbName: 'MealPlan',
    fields: [
      { name: 'id', label: 'ID', type: 'text', isPrimaryKey: true, hidden: true },
      { name: 'name', label: 'Plan Name', type: 'text', required: true },
      {
        name: 'dietary_preference', label: 'Dietary Pref', type: 'select', options: [
          { label: 'Vegetarian', value: 'Vegetarian' },
          { label: 'Eggetarian', value: 'Eggetarian' },
          { label: 'Non-Vegetarian', value: 'Non-Vegetarian' }
        ]
      },
      {
        name: 'fitness_goal', label: 'Fitness Goal', type: 'select', options: [
          { label: 'Weight Loss', value: 'Weight Loss' },
          { label: 'Muscle Gain', value: 'Muscle Gain' },
          { label: 'Maintenance', value: 'Maintenance' }
        ]
      },
      {
        name: 'gender', label: 'Gender', type: 'select', options: [
          { label: 'Male', value: 'Male' },
          { label: 'Female', value: 'Female' },
          { label: 'Any', value: 'Any' }
        ]
      },
      { name: 'weight_range_from', label: 'Weight From', type: 'number' },
      { name: 'weight_range_to', label: 'Weight To', type: 'number' },
      { name: 'is_paid', label: 'Is Paid', type: 'boolean' },
      { name: 'price', label: 'Price (₹)', type: 'number' },
      { name: 'package_id', label: 'Package ID', type: 'text' },
      { name: 'note', label: 'Note', type: 'textarea' }
    ]
  },
  {
    id: 'food',
    name: 'Food',
    description: 'Manage food items, their nutritional values, and dietary attributes.',
    dbName: 'Food',
    fields: [
      { name: 'id', label: 'ID', type: 'number', isPrimaryKey: true, hidden: true },
      { name: 'name', label: 'Food Name', type: 'text', required: true }
    ]
  }
];
