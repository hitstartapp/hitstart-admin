import React from 'react';
import Link from 'next/link';
import { Dumbbell } from 'lucide-react';
import InteractiveExerciseList from './InteractiveExerciseList';
import CommandBar from '@/components/CommandBar';
import ImagePreview from '@/components/ImagePreview';
import VideoPreview from '@/components/VideoPreview';
import VariationForm from './VariationForm';
import { fetchTableData, fetchVariationsForExercise, fetchSingleVariation, fetchConfiguration } from '../actions';

interface ExercisesViewProps {
  tableName: string;
  itemIcon: React.ReactNode;
  selectedExerciseId?: string;
  selectedVariationId?: string;
  action?: string;
}

export default async function ExercisesView({
  tableName,
  itemIcon,
  selectedExerciseId,
  selectedVariationId,
  action,
}: ExercisesViewProps) {
  const items = await fetchTableData(tableName);

  let activeExerciseId = selectedExerciseId;
  if (items.length > 0 && !activeExerciseId) {
    activeExerciseId = items[0].id;
  }

  const selectedExercise = items.find((item: any) => item.id === activeExerciseId) || items[0];
  const selectedExerciseName = selectedExercise ? (selectedExercise.name || 'Untitled') : 'None Selected';

  let variations: any[] = [];
  if (selectedExercise?.id) {
    variations = await fetchVariationsForExercise(selectedExercise.id);
  }

  let editVariationData = null;
  if ((action === 'edit' || action === 'new') && selectedVariationId) {
    editVariationData = await fetchSingleVariation(selectedVariationId);
  }

  const configData = await fetchConfiguration();
  const imageBaseUrl = configData.find((c: any) => c.configuration === 'image_storage_base_url')?.value || '';
  const videoBaseUrl = configData.find((c: any) => c.configuration === 'video_storage_base_url')?.value || '';

  return (
    <div className="flex-1 flex gap-6 overflow-hidden w-full h-full min-h-0 bg-transparent">
      {/* LEFT: Exercises Table (Responsive Width to Fit Columns) */}
      <div className="w-[320px] lg:w-[460px] flex flex-col min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-shrink-0">
        <div className="flex items-center bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex-shrink-0 h-9">
          <div className="flex-1 px-4 border-r border-slate-200 h-7 flex items-center">Exercise Name</div>
          <div className="w-28 px-4 h-7 flex items-center justify-end">Category</div>
        </div>

        <InteractiveExerciseList
          initialItems={items}
          selectedExerciseId={selectedExercise?.id}
          itemIcon={itemIcon}
        />
      </div>

      <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header containing name of selected exercise */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-[12px] font-bold text-slate-800">
              Variations for: <span className="text-indigo-600 font-extrabold">{selectedExerciseName}</span>
            </h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">
            {variations.length} {variations.length === 1 ? 'variation' : 'variations'}
          </span>
        </div>

        <CommandBar scope="variation" />

        {/* Variations List/Table (Always Rendered) */}
        <div className="flex flex-col divide-y divide-slate-100 flex-1 overflow-y-auto bg-white">
          {variations.length > 0 ? (
            variations.map((v: any, index: number) => {
              const isSelected = v.id === selectedVariationId;
              return (
                <Link
                  key={v.id || index}
                  href={`/workout?view=exercises&exerciseId=${selectedExercise?.id}&variationId=${v.id}`}
                  className={`p-6 hover:bg-slate-50/50 transition-all flex gap-5 items-start cursor-pointer border-l-4 ${isSelected ? 'bg-indigo-50/40 border-indigo-600 shadow-sm' : 'border-transparent'
                    }`}
                >

                  {/* Variation details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[16px] text-slate-800 mb-1">{v.name}</h3>
                    <p className="text-slate-500 text-[14px] leading-relaxed">
                      {v.description || 'No description available for this variation.'}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      {v.image_storage && (
                        <ImagePreview imageName={v.image_storage} baseUrl={imageBaseUrl} />
                      )}
                      {v.video_storage && (
                        <VideoPreview videoName={v.video_storage} baseUrl={videoBaseUrl} />
                      )}
                    </div>
                  </div>

                </Link>
              );
            })
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center px-6">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4">
                <Dumbbell size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">No variations found</h3>
              <p className="text-slate-500 text-sm max-w-sm">
                There are no variation records configured for this exercise in the database.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sliding Side Panel for Exercise Variation Form */}
      <div
        className={`fixed inset-y-0 right-0 z-50 bg-[#F8FAFC] border-l border-slate-200 shadow-2xl transition-transform duration-300 ease-in-out transform w-[600px] ${(action === 'new' || action === 'edit') ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full w-full">
          {/* Header */}
          <div className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between flex-shrink-0">
            <h2 className="text-lg font-semibold text-slate-800">
              {action === 'new' ? 'New Variation' : 'Edit Variation'}
            </h2>
          </div>

          <CommandBar scope="variation" />

          {/* Form */}
          <div className="flex-grow p-6 overflow-y-auto bg-[#F8FAFC] flex flex-col items-center justify-start min-h-0 w-full">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-8 w-full">
              {(action === 'new' || action === 'edit') && (
                <VariationForm
                  initialData={editVariationData}
                  exerciseId={selectedExercise?.id}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
