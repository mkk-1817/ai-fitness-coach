import { ExerciseItem } from '@/types/fitness';

export const EXERCISE_LIBRARY_DATA: ExerciseItem[] = [
  {
    id: 'ex-goblet-squat',
    name: 'Goblet Squat',
    slug: 'goblet-squat',
    category: 'Legs',
    targetMuscle: 'Quadriceps',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Core'],
    equipmentRequired: 'Dumbbells',
    difficulty: 'Beginner',
    instructions: [
      'Stand with feet shoulder-width apart, holding a dumbbell vertically against your chest with both hands cupping the upper plate.',
      'Keep your chest high, core braced, and shoulders retracted.',
      'Hinge at hips and bend your knees to squat down until your thighs are at least parallel to the floor.',
      'Keep your elbows tracking just inside your knees.',
      'Drive firmly through heels and midfoot to return to the starting standing position.'
    ],
    formTips: [
      'Keep your chest proud throughout the entire movement.',
      'Push your knees gently outward over your toes.',
      'Inhale deeply on the way down, exhale as you power up.'
    ],
    commonMistakes: [
      'Rounding the upper back and collapsing the chest.',
      'Allowing knees to cave inward (valgus collapse).',
      'Rising up onto your toes instead of keeping heels planted.'
    ],
    beginnerAlternative: 'Bodyweight Box Squat',
    advancedAlternative: 'Barbell Front Squat',
    videoUrl: 'https://www.youtube.com/watch?v=MeIiIdhvXT4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'ex-barbell-squat',
    name: 'Barbell Back Squat',
    slug: 'barbell-back-squat',
    category: 'Legs',
    targetMuscle: 'Quadriceps',
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Lower Back', 'Core'],
    equipmentRequired: 'Barbell & Plates',
    difficulty: 'Intermediate',
    instructions: [
      'Rest barbell across your upper traps or rear deltoids, hands gripping the bar securely.',
      'Step back from rack, feet slightly wider than shoulder-width with toes angled outward 15-30 degrees.',
      'Take a deep belly breath and brace your core tightly.',
      'Hinge at hips and knees simultaneously, sinking down until hips dip below knees.',
      'Drive powerfully through your midfoot, extending hips and knees in unison.'
    ],
    formTips: [
      'Keep a neutral spine and fix your eyes on a point forward.',
      'Ensure the barbell path moves strictly vertical over midfoot.',
      'Maintain continuous 360-degree intra-abdominal pressure.'
    ],
    commonMistakes: [
      'Hips rising much faster than the chest (good-morning squat).',
      'Cutting depth high above parallel.',
      'Heels lifting off the floor.'
    ],
    beginnerAlternative: 'Goblet Squat',
    advancedAlternative: 'Pause Barbell Squat',
    videoUrl: 'https://www.youtube.com/watch?v=bEv6CCg2BC8',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'ex-db-bench-press',
    name: 'Dumbbell Bench Press',
    slug: 'dumbbell-bench-press',
    category: 'Chest',
    targetMuscle: 'Pectorals',
    secondaryMuscles: ['Triceps', 'Anterior Deltoids'],
    equipmentRequired: 'Dumbbells',
    difficulty: 'Beginner',
    instructions: [
      'Sit on a flat bench with dumbbells resting vertically on your thighs.',
      'Lie back smoothly, kicking the weights up into position at chest height with palms forward.',
      'Plant both feet flat on the floor and pull your shoulder blades down and together.',
      'Press dumbbells upward until arms are extended but not locked out.',
      'Lower weights with control until dumbbells are level with chest.'
    ],
    formTips: [
      'Keep elbows at roughly 45-60 degrees to your body, not flared out at 90 degrees.',
      'Maintain your shoulder blades retracted into the bench throughout.'
    ],
    commonMistakes: [
      'Flaring elbows out perpendicular to torso.',
      'Bouncing dumbbells off chest or banging them together at top.',
      'Arching lower back off bench excessively.'
    ],
    beginnerAlternative: 'Push-ups',
    advancedAlternative: 'Incline Dumbbell Bench Press',
    videoUrl: 'https://www.youtube.com/watch?v=VmB1G1K7v94',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'ex-push-up',
    name: 'Standard Push-Up',
    slug: 'standard-push-up',
    category: 'Chest',
    targetMuscle: 'Pectorals',
    secondaryMuscles: ['Triceps', 'Shoulders', 'Core'],
    equipmentRequired: 'Bodyweight',
    difficulty: 'Beginner',
    instructions: [
      'Start in a high plank position with hands slightly wider than shoulder-width, fingers pointing forward.',
      'Engage glutes and core so body forms a rigid straight line from heels to crown.',
      'Lower chest toward the floor by bending elbows back at roughly 45 degrees.',
      'Descend until chest is about 1-2 inches above the floor.',
      'Press the floor away firmly to return to high plank.'
    ],
    formTips: [
      'Squeeze your glutes tightly to keep lower back protected.',
      'Gaze at a point on the floor 6 inches ahead of hands.',
      'Full range of motion is far more effective than fast half-reps.'
    ],
    commonMistakes: [
      'Hips sagging down or arching lower back.',
      'Piking hips into the air.',
      'Dropping neck down before chest touches.'
    ],
    beginnerAlternative: 'Incline Push-ups on Bench',
    advancedAlternative: 'Decline / Weighted Push-ups',
    videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'ex-db-row',
    name: 'Dumbbell Bent-Over Row',
    slug: 'dumbbell-bent-over-row',
    category: 'Back',
    targetMuscle: 'Latissimus Dorsi',
    secondaryMuscles: ['Rhomboids', 'Rear Deltoids', 'Biceps'],
    equipmentRequired: 'Dumbbells',
    difficulty: 'Beginner',
    instructions: [
      'Hold a dumbbell in each hand, palms facing each other, and hinge forward at the hips to 45 degrees.',
      'Keep back flat, chest proud, and knees slightly bent.',
      'Pull the dumbbells upward toward your hips, driving your elbows back.',
      'Squeeze shoulder blades firmly together at the top for one full second.',
      'Lower the weights under control back to full extension.'
    ],
    formTips: [
      'Think of pulling your elbows toward your back pockets.',
      'Maintain a neutral spine without rounding your lower back.'
    ],
    commonMistakes: [
      'Using torso momentum or swinging the body to heave weights.',
      'Rounding the lower back into spinal flexion.',
      'Shrugging shoulders upward to ears.'
    ],
    beginnerAlternative: 'Single-Arm Supported Row',
    advancedAlternative: 'Barbell Pendlay Row',
    videoUrl: 'https://www.youtube.com/watch?v=6TSP13BylM0',
    thumbnailUrl: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'ex-pull-up',
    name: 'Pull-Up',
    slug: 'pull-up',
    category: 'Back',
    targetMuscle: 'Latissimus Dorsi',
    secondaryMuscles: ['Biceps', 'Upper Back', 'Core'],
    equipmentRequired: 'Pull-up Bar',
    difficulty: 'Intermediate',
    instructions: [
      'Grip the overhead bar with palms facing forward, slightly wider than shoulder-width.',
      'Hang with arms fully extended (dead hang) and engage your core.',
      'Depress your shoulder blades down and back.',
      'Pull your chest toward the bar by driving your elbows down toward your hips.',
      'Continue until chin clears the bar, then lower with control to full extension.'
    ],
    formTips: [
      'Visualize pulling the bar down into your chest rather than dragging your chin up.',
      'Keep your legs steady without swinging or kicking.'
    ],
    commonMistakes: [
      'Kipping or flailing legs to generate momentum.',
      'Doing half-reps without full arm extension at bottom.',
      'Straining neck forward to touch chin over bar.'
    ],
    beginnerAlternative: 'Resistance Band Assisted Pull-up',
    advancedAlternative: 'Weighted Pull-up',
    videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'ex-overhead-press',
    name: 'Dumbbell Overhead Shoulder Press',
    slug: 'dumbbell-overhead-shoulder-press',
    category: 'Shoulders',
    targetMuscle: 'Anterior Deltoids',
    secondaryMuscles: ['Lateral Deltoids', 'Triceps', 'Upper Trapezius'],
    equipmentRequired: 'Dumbbells',
    difficulty: 'Beginner',
    instructions: [
      'Sit on an upright bench or stand tall with feet shoulder-width.',
      'Raise dumbbells to shoulder level with elbows angled at 45 degrees forward.',
      'Press dumbbells smoothly overhead until arms are extended overhead.',
      'Hold contraction briefly at the peak without banging weights.',
      'Lower weights with control over 2 seconds back to shoulder level.'
    ],
    formTips: [
      'Keep ribcage pulled down to prevent hyper-extending the lower back.',
      'Press in a slight natural arc over the crown of your head.'
    ],
    commonMistakes: [
      'Arching lower back excessively to compensate for tight shoulders.',
      'Pressing dumbbells outward in front rather than vertically overhead.'
    ],
    beginnerAlternative: 'Seated Dumbbell Press with Back Support',
    advancedAlternative: 'Standing Barbell Overhead Press',
    videoUrl: 'https://www.youtube.com/watch?v=qEwKCR5JCog',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'ex-rdl',
    name: 'Romanian Deadlift (RDL)',
    slug: 'romanian-deadlift',
    category: 'Legs',
    targetMuscle: 'Hamstrings',
    secondaryMuscles: ['Glutes', 'Lower Back', 'Core'],
    equipmentRequired: 'Dumbbells',
    difficulty: 'Intermediate',
    instructions: [
      'Stand holding dumbbells in front of thighs, feet hip-width apart.',
      'Unlock knees with a soft 15-degree bend that remains static.',
      'Push your hips backward as if reaching for a wall behind you.',
      'Lower weights along the front of your shins until you feel a deep hamstring stretch.',
      'Drive hips forward to return to standing, contracting glutes firmly at top.'
    ],
    formTips: [
      'Movement is a pure hip hinge, not a knee bend squat.',
      'Keep dumbbells skimming close to your shins throughout.'
    ],
    commonMistakes: [
      'Squatting down instead of pushing hips backward.',
      'Rounding the lower back as the weights go below knee level.'
    ],
    beginnerAlternative: 'Glute Bridge / Single Leg Bridge',
    advancedAlternative: 'Barbell Deficit RDL',
    videoUrl: 'https://www.youtube.com/watch?v=JCXUYuzwNrM',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'ex-bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    slug: 'bulgarian-split-squat',
    category: 'Legs',
    targetMuscle: 'Quadriceps',
    secondaryMuscles: ['Glutes', 'Adductors', 'Core'],
    equipmentRequired: 'Dumbbells',
    difficulty: 'Intermediate',
    instructions: [
      'Stand 2 to 3 feet in front of a flat bench or chair.',
      'Place the top of your rear foot onto the bench.',
      'Keep torso upright with slight forward tilt, holding dumbbells at sides.',
      'Lower down by bending front knee until front thigh is parallel to floor.',
      'Drive up through front heel and midfoot to return to top.'
    ],
    formTips: [
      'Place 85% of your weight on the front leg; rear leg is only for balance.',
      'Keep front knee tracking over your second toe.'
    ],
    commonMistakes: [
      'Positioning front foot too close to bench, raising front heel.',
      'Pushing through the rear toes instead of loading the front leg.'
    ],
    beginnerAlternative: 'Walking Bodyweight Lunges',
    advancedAlternative: 'Deficit Bulgarian Split Squat with Barbell',
    videoUrl: 'https://www.youtube.com/watch?v=2C-uNgKwPLE',
    thumbnailUrl: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'ex-plank',
    name: 'Forearm Plank',
    slug: 'forearm-plank',
    category: 'Core',
    targetMuscle: 'Rectus Abdominis',
    secondaryMuscles: ['Transverse Abdominis', 'Glutes', 'Shoulders'],
    equipmentRequired: 'Bodyweight',
    difficulty: 'Beginner',
    instructions: [
      'Place forearms on the floor with elbows directly under shoulders.',
      'Step legs back, resting on toes.',
      'Engage glutes and pull navel up and inward toward your spine.',
      'Keep body in a continuous straight line from head to heels.',
      'Hold for specified time with steady, rhythmic breathing.'
    ],
    formTips: [
      'Actively drag elbows toward toes to generate full abdominal tension.',
      'Keep gaze down between your hands to protect cervical spine.'
    ],
    commonMistakes: [
      'Letting hips sag down toward the floor.',
      'Piking hips up into an inverted V.',
      'Holding breath instead of continuous respiration.'
    ],
    beginnerAlternative: 'Knee Plank',
    advancedAlternative: 'Ab Wheel Rollout',
    videoUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw',
    thumbnailUrl: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'ex-bicep-curl',
    name: 'Dumbbell Bicep Curl',
    slug: 'dumbbell-bicep-curl',
    category: 'Arms',
    targetMuscle: 'Biceps Brachii',
    secondaryMuscles: ['Brachialis', 'Brachioradialis'],
    equipmentRequired: 'Dumbbells',
    difficulty: 'Beginner',
    instructions: [
      'Stand tall holding a dumbbell in each hand, arms extended down with palms facing thighs.',
      'Pin elbows firmly against the sides of your ribcage.',
      'Curl dumbbells upward while rotating wrists so palms face shoulders at top.',
      'Squeeze biceps forcefully for 1 count at maximum peak contraction.',
      'Lower weights smoothly over 2 seconds back to starting position.'
    ],
    formTips: [
      'Do not allow elbows to drift forward during the curl.',
      'Maintain wrists in neutral alignment rather than curling wrists inward.'
    ],
    commonMistakes: [
      'Swinging torso backward to heave the weight up.',
      'Letting weights drop rapidly without resisting the eccentric phase.'
    ],
    beginnerAlternative: 'Resistance Band Curl',
    advancedAlternative: 'Incline Bench Dumbbell Curl',
    videoUrl: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'ex-tricep-extension',
    name: 'Overhead Tricep Extension',
    slug: 'overhead-tricep-extension',
    category: 'Arms',
    targetMuscle: 'Triceps',
    secondaryMuscles: ['Forearms', 'Core'],
    equipmentRequired: 'Dumbbells',
    difficulty: 'Beginner',
    instructions: [
      'Sit or stand holding a single dumbbell overhead with both hands cupping the upper plate.',
      'Extend arms overhead, keeping upper arms close to ears.',
      'Lower the dumbbell behind your head by bending elbows while keeping upper arms fixed.',
      'Descend until forearms are past parallel with floor.',
      'Contract triceps to extend arms back to overhead lockout.'
    ],
    formTips: [
      'Keep elbows from flaring out excessively to the sides.',
      'Brace core to prevent arching your lower back.'
    ],
    commonMistakes: [
      'Flaring elbows out wide.',
      'Moving upper arms back and forth instead of isolating the elbow joint.'
    ],
    beginnerAlternative: 'Bench Tricep Dips',
    advancedAlternative: 'Cable Tricep Rope Pushdown',
    videoUrl: 'https://www.youtube.com/watch?v=-Vyt2QdsR7E',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'ex-lateral-raise',
    name: 'Lateral Dumbbell Raise',
    slug: 'lateral-dumbbell-raise',
    category: 'Shoulders',
    targetMuscle: 'Lateral Deltoids',
    secondaryMuscles: ['Upper Trapezius', 'Supraspinatus'],
    equipmentRequired: 'Dumbbells',
    difficulty: 'Beginner',
    instructions: [
      'Stand with feet hip-width apart, holding light dumbbells at your sides.',
      'Bend elbows slightly (10-15 degrees) and lean forward just a touch.',
      'Raise dumbbells out to your sides until elbows are level with shoulders.',
      'Lead with elbows, keeping hands level or slightly lower than elbows.',
      'Lower dumbbells slowly over 2 seconds with controlled tempo.'
    ],
    formTips: [
      'Raise weights in the scapular plane (about 30 degrees in front of true side).',
      'Use light weights and focus strictly on lateral delt contraction.'
    ],
    commonMistakes: [
      'Shrugging shoulders into ears with traps.',
      'Swinging hips back and forth to launch weights.',
      'Lifting hands much higher than elbows.'
    ],
    beginnerAlternative: 'Resistance Band Lateral Raise',
    advancedAlternative: 'Cable Lateral Raise',
    videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80'
  }
];
