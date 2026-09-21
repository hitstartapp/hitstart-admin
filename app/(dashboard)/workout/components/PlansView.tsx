import React from 'react';
import InteractiveWorkoutTable from './InteractiveWorkoutTable';
import { fetchTableData, fetchPackageEnumValues } from '../actions';
import { WORKOUT_PLAN_FIELDS } from '../models';

interface PlansViewProps {
  tableName: string;
  title: string;
  selectedPlanId?: string;
  view: string;
}

export default async function PlansView({
  tableName,
  title,
  selectedPlanId,
  view,
}: PlansViewProps) {
  const items = await fetchTableData(tableName);
  const packages = await fetchPackageEnumValues();

  return (
    <InteractiveWorkoutTable
      initialItems={items}
      tableName={tableName}
      title={title}
      initialSelectedId={selectedPlanId}
      view={view}
      fields={WORKOUT_PLAN_FIELDS}
      exerciseMap={{}}
      planMap={{}}
      packages={packages}
    />
  );
}
