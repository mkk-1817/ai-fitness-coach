import { EXERCISE_LIBRARY_DATA } from '@/lib/data/exercise-data';
import { ExerciseCategory, ExerciseItem } from '@/types/fitness';

// ==============================================================================
// EXERCISE MEDIA ENRICHMENT
// The curated exercise library is only a source of verified demo videos and
// coaching notes. AI plans may prescribe any exercise or activity; when a name
// matches a library entry we attach its media, otherwise we link to a YouTube
// search instead of trusting a model-invented video URL.
// ==============================================================================

const normalize = (name: string) =>
  name.toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

export function findLibraryExercise(name: string): ExerciseItem | undefined {
  const target = normalize(name);
  if (!target) return undefined;
  return EXERCISE_LIBRARY_DATA.find(e => normalize(e.name) === target);
}

export function youtubeSearchUrl(name: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${name} proper form tutorial`)}`;
}

export function resolveExerciseMedia(name: string): { exerciseId?: string; videoUrl: string } {
  const entry = findLibraryExercise(name);
  if (entry?.videoUrl) return { exerciseId: entry.id, videoUrl: entry.videoUrl };
  return { videoUrl: youtubeSearchUrl(name) };
}

const CATEGORY_LABELS: Record<ExerciseCategory, ExerciseItem['category']> = {
  strength: 'Strength',
  cardio: 'Cardio',
  sports: 'Sports',
  hiit: 'HIIT',
  mobility: 'Mobility',
};

/**
 * Builds the detail view for an AI-prescribed exercise, merging curated
 * library coaching notes when available.
 */
export function buildExerciseDetails(ex: {
  exerciseName: string;
  category?: ExerciseCategory;
  targetMuscle?: string;
  equipment?: string;
  formNotes?: string;
  instructions?: string[];
  alternatives?: string[];
  videoUrl?: string;
}): ExerciseItem {
  const entry = findLibraryExercise(ex.exerciseName);
  const aiInstructions = (ex.instructions || []).filter(Boolean);
  return {
    id: entry?.id || `ai-${normalize(ex.exerciseName).replace(/ /g, '-')}`,
    name: ex.exerciseName,
    slug: entry?.slug || normalize(ex.exerciseName).replace(/ /g, '-'),
    category: entry?.category || CATEGORY_LABELS[ex.category || 'strength'],
    targetMuscle: ex.targetMuscle || entry?.targetMuscle || 'Full Body',
    secondaryMuscles: entry?.secondaryMuscles || [],
    equipmentRequired: ex.equipment || entry?.equipmentRequired || 'Bodyweight',
    difficulty: entry?.difficulty || 'Beginner',
    instructions: aiInstructions.length > 0 ? aiInstructions : entry?.instructions || [],
    formTips: [ex.formNotes, ...(entry?.formTips || [])].filter((t): t is string => Boolean(t)),
    commonMistakes: entry?.commonMistakes || [],
    beginnerAlternative: entry?.beginnerAlternative || ex.alternatives?.[0],
    advancedAlternative: entry?.advancedAlternative || ex.alternatives?.[1],
    videoUrl: entry?.videoUrl || ex.videoUrl || youtubeSearchUrl(ex.exerciseName),
    thumbnailUrl: entry?.thumbnailUrl,
  };
}
