export const tableFields = [
  'user_name',
  'email',
  'phone',
  'gender',
  'birth_date',
  'dietary_preference',
  'has_health_concerns'
];

export const getColClass = (field: string) => {
  switch (field) {
    case 'user_name': return 'w-[320px] flex-shrink-0';
    case 'email': return 'flex-1 min-w-[280px]';
    case 'phone': return 'w-[220px] flex-shrink-0';
    case 'gender': return 'w-[90px] flex-shrink-0';
    case 'birth_date': return 'w-[130px] flex-shrink-0';
    case 'dietary_preference': return 'w-[180px] flex-shrink-0';
    case 'has_health_concerns': return 'w-[180px] flex-shrink-0';
    default: return 'w-[150px] flex-shrink-0';
  }
};
