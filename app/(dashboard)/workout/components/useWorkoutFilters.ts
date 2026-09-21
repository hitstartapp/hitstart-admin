import { useState, useMemo, useEffect } from 'react';

interface UseWorkoutFiltersProps {
  items: any[];
  view: string;
  isWorkouts: boolean;
  exerciseMap: Record<string, string>;
}

export function useWorkoutFilters({ items, view, isWorkouts, exerciseMap }: UseWorkoutFiltersProps) {
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedFitnessLevel, setSelectedFitnessLevel] = useState('All');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const [sortConfig, setSortConfig] = useState<Record<string, 'asc' | 'desc' | null>>({
    level: null,
    week: null,
    day: null,
    name: null,
    title: null,
  });

  // Load initial filters and expansion state from URL or localStorage on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const urlGender = params.get('gender');
    const savedGender = urlGender || localStorage.getItem('hitstart-filter-gender') || 'All';
    setSelectedGender(savedGender);

    const urlFitness = params.get('fitnessLevel');
    const savedFitness = urlFitness || localStorage.getItem('hitstart-filter-fitness-level') || 'All';
    setSelectedFitnessLevel(savedFitness);

    const savedExpanded = localStorage.getItem('hitstart-filters-expanded') === 'true';
    setIsFiltersExpanded(savedExpanded);

    const savedSort = localStorage.getItem('hitstart-table-sort');
    if (savedSort) {
      try {
        setSortConfig(JSON.parse(savedSort));
      } catch (e) {
        console.error('Error loading saved sorting config:', e);
      }
    }
  }, []);

  const genders = useMemo(() => {
    const set = new Set<string>();
    items.forEach(item => {
      if (item.gender) {
        const g = item.gender.trim();
        if (g) set.add(g.charAt(0).toUpperCase() + g.slice(1).toLowerCase());
      }
    });
    return ['All', ...Array.from(set)];
  }, [items]);

  const fitnessLevels = useMemo(() => {
    const set = new Set<string>();
    items.forEach(item => {
      if (item.fitness_level) {
        const f = item.fitness_level.trim();
        if (f) set.add(f.charAt(0).toUpperCase() + f.slice(1).toLowerCase());
      }
    });
    return ['All', ...Array.from(set)];
  }, [items]);

  const filteredItems = useMemo(() => {
    const result = items.filter(item => {
      if (String(item.id).startsWith('temp-')) {
        return true;
      }
      if (view === 'plans') {
        if (selectedGender !== 'All') {
          const itemGender = (item.gender || '').trim().toLowerCase();
          if (itemGender !== selectedGender.toLowerCase()) {
            return false;
          }
        }
        if (selectedFitnessLevel !== 'All') {
          const itemFitnessLevel = (item.fitness_level || '').trim().toLowerCase();
          if (itemFitnessLevel !== selectedFitnessLevel.toLowerCase()) {
            return false;
          }
        }
      }
      return true;
    });

    const activeSorts = Object.entries(sortConfig)
      .filter(([_, dir]) => dir !== null) as [string, 'asc' | 'desc'][];

    if (activeSorts.length > 0) {
      const priorityOrder = ['level', 'week', 'day', 'name', 'title'];
      activeSorts.sort((a, b) => {
        return priorityOrder.indexOf(a[0]) - priorityOrder.indexOf(b[0]);
      });

      result.sort((a, b) => {
        for (const [col, dir] of activeSorts) {
          let valA = a[col];
          let valB = b[col];

          if (col === 'name' || col === 'title') {
            valA = isWorkouts
              ? (a.title || exerciseMap[a.exercise] || '')
              : (a.name || '');
            valB = isWorkouts
              ? (b.title || exerciseMap[b.exercise] || '')
              : (b.name || '');
          }

          if (valA === valB) continue;

          if (valA === null || valA === undefined) return dir === 'asc' ? 1 : -1;
          if (valB === null || valB === undefined) return dir === 'asc' ? -1 : 1;

          const numA = Number(valA);
          const numB = Number(valB);
          if (!isNaN(numA) && !isNaN(numB)) {
            if (numA !== numB) {
              return dir === 'asc' ? numA - numB : numB - numA;
            }
            continue;
          }

          const strA = String(valA).toLowerCase();
          const strB = String(valB).toLowerCase();
          if (strA < strB) return dir === 'asc' ? -1 : 1;
          if (strA > strB) return dir === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [items, selectedGender, selectedFitnessLevel, sortConfig, isWorkouts, exerciseMap, view]);

  const handleGenderChange = (gender: string) => {
    setSelectedGender(gender);
    localStorage.setItem('hitstart-filter-gender', gender);

    const params = new URLSearchParams(window.location.search);
    if (gender && gender !== 'All') {
      params.set('gender', gender);
    } else {
      params.delete('gender');
    }
    const newUrl = `/workout?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  };

  const handleFitnessLevelChange = (level: string) => {
    setSelectedFitnessLevel(level);
    localStorage.setItem('hitstart-filter-fitness-level', level);

    const params = new URLSearchParams(window.location.search);
    if (level && level !== 'All') {
      params.set('fitnessLevel', level);
    } else {
      params.delete('fitnessLevel');
    }
    const newUrl = `/workout?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  };

  const handleSort = (field: string) => {
    const sortableFields = ['name', 'title', 'level', 'week', 'day'];
    if (!sortableFields.includes(field)) return;

    setSortConfig(prev => {
      const currentDir = prev[field];
      let nextDir: 'asc' | 'desc' | null = null;
      if (currentDir === null) nextDir = 'asc';
      else if (currentDir === 'asc') nextDir = 'desc';

      const nextConfig = { ...prev, [field]: nextDir };
      localStorage.setItem('hitstart-table-sort', JSON.stringify(nextConfig));
      return nextConfig;
    });
  };

  const handleToggleFilters = () => {
    const toggle = () => {
      setIsFiltersExpanded(prev => {
        const next = !prev;
        localStorage.setItem('hitstart-filters-expanded', String(next));
        return next;
      });
    };

    if (typeof document !== 'undefined' && document.startViewTransition) {
      document.startViewTransition(toggle);
    } else {
      toggle();
    }
  };

  return {
    genders,
    fitnessLevels,
    filteredItems,
    selectedGender,
    selectedFitnessLevel,
    isFiltersExpanded,
    sortConfig,
    handleGenderChange,
    handleFitnessLevelChange,
    handleToggleFilters,
    handleSort
  };
}
