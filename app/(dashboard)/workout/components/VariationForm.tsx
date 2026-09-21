'use client';

import { saveVariation } from '../actions';
import { useState } from 'react';

export default function VariationForm({
  initialData,
  exerciseId,
}: {
  initialData: any;
  exerciseId?: string;
}) {
  return (
    <form action={saveVariation} className="w-full">
      {/* Hidden submits to trigger from CommandBar */}
      <button type="submit" id="hidden-save-btn" name="actionType" value="save" className="hidden" />
      <button type="submit" id="hidden-save-close-btn" name="actionType" value="saveClose" className="hidden" />
      {initialData?.id && (
        <button type="submit" id="hidden-delete-btn" name="actionType" value="delete" className="hidden" />
      )}
      
      <input type="hidden" name="id" value={initialData?.id || 'new'} />
      <input type="hidden" name="exercise" value={exerciseId || initialData?.exercise || ''} />

      <div className="grid grid-cols-2 gap-x-12 gap-y-8 flex-shrink-0 mb-8">
              {/* Row 1 */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Variation Name</label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={initialData?.name || ''} 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white font-semibold text-slate-800"
                  required
                  placeholder="e.g. Incline Bench Press"
                />
              </div>

              {/* Row 2 */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea 
                  name="description" 
                  defaultValue={initialData?.description || ''} 
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white text-slate-700 leading-relaxed"
                  placeholder="Provide instructions or description for this exercise variation..."
                />
              </div>

              {/* Row 3 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Image Storage Path / URL</label>
                <input 
                  type="text" 
                  name="image_storage" 
                  defaultValue={initialData?.image_storage || ''} 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white text-slate-600 font-mono text-xs"
                  placeholder="placeholder.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Video Storage Path / URL</label>
                <input 
                  type="text" 
                  name="video_storage" 
                  defaultValue={initialData?.video_storage || ''} 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white text-slate-600 font-mono text-xs"
                  placeholder="video.mp4 (optional)"
                />
              </div>
            </div>
    </form>
  );
}
