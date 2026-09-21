import React, { Suspense } from 'react';
import { Dumbbell } from 'lucide-react';
import CommandBar from '@/components/CommandBar';
import WorkoutSidebar from './components/WorkoutSidebar';
import ExercisesView from './components/ExercisesView';
import PlansView from './components/PlansView';
import { ExercisesSkeleton, PlansOrWorkoutsSkeleton } from './components/Skeletons';

export default async function WorkoutPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const view = (resolvedSearchParams.view as string) || 'plans';
  const exerciseId = resolvedSearchParams.exerciseId as string | undefined;
  const variationId = resolvedSearchParams.variationId as string | undefined;
  const planId = resolvedSearchParams.planId as string | undefined;
  const action = resolvedSearchParams.action as string | undefined;

  let tableName = 'Exercise';
  let title = 'Active Exercises';
  let itemIcon = <Dumbbell size={20} strokeWidth={2} />;

  if (view === 'plans') {
    tableName = 'WorkoutPlan';
    title = 'Active Workout Plans';
  }

  return (
    <>
      <WorkoutSidebar view={view} />

      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] relative overflow-hidden">
        <CommandBar />
        <div className={`flex-1 flex flex-col min-h-0 overflow-hidden ${view === 'exercises' ? 'p-8' : 'py-6'}`}>
          {/* Header */}
          {view === 'exercises' && (
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
              <h1 className="text-[20px] font-semibold text-slate-800">{title}</h1>
            </div>
          )}

          <Suspense
            key={view}
            fallback={
              view === 'exercises' ? (
                <ExercisesSkeleton />
              ) : (
                <PlansOrWorkoutsSkeleton title={title} view={view} />
              )
            }
          >
            {view === 'exercises' ? (
              <ExercisesView
                tableName={tableName}
                itemIcon={itemIcon}
                selectedExerciseId={exerciseId}
                selectedVariationId={variationId}
                action={action}
              />
            ) : (
              <PlansView
                tableName={tableName}
                title={title}
                selectedPlanId={planId}
                view={view}
              />
            )}
          </Suspense>
        </div>
      </main>
    </>
  );
}
