export type TableConfig = {
  id: string;
  name: string;
  description: string;
  dbName: string;
  fields: {
    name: string;
    label: string;
    type: 'text' | 'number' | 'json' | 'select' | 'textarea' | 'boolean';
    required?: boolean;
    readOnlyOnEdit?: boolean;
    isPrimaryKey?: boolean;
    hidden?: boolean;
    options?: { label: string; value: any }[] | string;
  }[];
};

export const TABLES: TableConfig[] = [
  {
    id: 'levelmapping',
    name: 'Level Mapping',
    description: 'Manage user workout schedule mapping tables, fitness levels, and detailed JSON mapping files.',
    dbName: 'LevelMapping',
    fields: [
      { name: 'id', label: 'ID', type: 'number', isPrimaryKey: true, hidden: true },
      { name: 'level', label: 'Level', type: 'number', required: true },
      {
        name: 'fitness_level',
        label: 'Fitness Level',
        type: 'select',
        options: [
          { label: 'Beginner', value: 'Beginner' },
          { label: 'Intermediate', value: 'Intermediate' },
          { label: 'Advanced', value: 'Advanced' }
        ]
      },
      { name: 'map', label: 'Map', type: 'json' },
      { name: 'map_string', label: 'Map Text', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' }
    ]
  },
  {
    id: 'levelstructure',
    name: 'Level Structure',
    description: 'Define exercise game structure, coins/XP reward parameters, and weekly bonuses.',
    dbName: 'LevelStructure',
    fields: [
      { name: 'id', label: 'ID', type: 'number', isPrimaryKey: true, readOnlyOnEdit: true, hidden: true },
      { name: 'level', label: 'Level', type: 'number', required: true },
      { name: 'week', label: 'Week', type: 'number', required: true },
      { name: 'day', label: 'Day', type: 'number', required: true },
      { name: 'next_stage', label: 'Next Stage (Level ID)', type: 'number' },
      {
        name: 'fitness_level',
        label: 'Fitness Level',
        type: 'select',
        options: [
          { label: 'Beginner', value: 'Beginner' },
          { label: 'Intermediate', value: 'Intermediate' },
          { label: 'Advanced', value: 'Advanced' }
        ]
      },
      { name: 'coins_per_day', label: 'Coins Per Day', type: 'number' },
      { name: 'xp_per_day', label: 'XP Per Day', type: 'number' },
      { name: 'weekly_bonus_coins', label: 'Weekly Bonus Coins', type: 'number' },
      { name: 'weekly_bonus_xp', label: 'Weekly Bonus XP', type: 'number' },
      { name: 'level_bonus_coins', label: 'Level Bonus Coins', type: 'number' },
      { name: 'badge', label: 'Unlocked Badge', type: 'select', options: 'badges' }
    ]
  },
  {
    id: 'rank',
    name: 'Rank',
    description: 'Manage XP ranges and basic rank nomenclature.',
    dbName: 'Rank',
    fields: [
      { name: 'id', label: 'ID', type: 'number', isPrimaryKey: true, hidden: true },
      { name: 'name', label: 'Rank Name', type: 'text', required: true },
      { name: 'xp_range_from', label: 'XP Range From', type: 'number', required: true },
      { name: 'xp_range_to', label: 'XP Range To', type: 'number', required: true }
    ]
  },
  {
    id: 'badge',
    name: 'Badge',
    description: 'Manage reward badges, Level & Fitness Level thresholds, and badge graphics storage paths.',
    dbName: 'Badge',
    fields: [
      { name: 'id', label: 'ID', type: 'number', isPrimaryKey: true, hidden: true },
      { name: 'name', label: 'Badge Name', type: 'text', required: true },
      { name: 'level', label: 'Level', type: 'number' },
      {
        name: 'fitness_level',
        label: 'Fitness Level',
        type: 'select',
        options: [
          { label: 'Beginner', value: 'Beginner' },
          { label: 'Intermediate', value: 'Intermediate' },
          { label: 'Advanced', value: 'Advanced' }
        ]
      },
      { name: 'image_storage', label: 'Image', type: 'text' }
    ]
  }
];
