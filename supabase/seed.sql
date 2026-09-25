-- ==============================================================================
-- AI FITNESS COACH - SUPABASE SEED DATA
-- Reference exercises, equipment, and nutritional items
-- ==============================================================================

-- 1. Reference Equipment
INSERT INTO public.equipment (name, category, description) VALUES
('Bodyweight', 'no_equipment', 'Using one''s own bodyweight for resistance'),
('Yoga Mat', 'no_equipment', 'Non-slip padded floor mat'),
('Dumbbells', 'home', 'Adjustable or fixed pairs of dumbbells'),
('Resistance Bands', 'home', 'Elastic latex loop or handle bands'),
('Kettlebell', 'home', 'Cast-iron or steel ball weight with handle'),
('Pull-up Bar', 'home', 'Doorway or wall mounted pull up bar'),
('Adjustable Bench', 'home', 'Flat/incline workout bench'),
('Treadmill', 'cardio', 'Running or walking motorized treadmill'),
('Stationary Bike', 'cardio', 'Upright or spin cycle ergometer'),
('Barbell & Plates', 'gym', 'Standard Olympic barbell and weight plates'),
('Squat Rack / Power Cage', 'gym', 'Safety frame for barbell squats and presses'),
('Cable Machine / Functional Trainer', 'gym', 'Adjustable dual pulley cable apparatus'),
('Leg Press Machine', 'gym', '45 degree angled leg press sled'),
('Lat Pulldown Machine', 'gym', 'High cable pulldown station'),
('Rowing Machine', 'cardio', 'Indoor water or magnetic rowing ergometer')
ON CONFLICT (name) DO NOTHING;

-- 2. Comprehensive Exercise Library with Verified Video Demonstrations
INSERT INTO public.exercise_library (
    name, slug, category, target_muscle, secondary_muscles, equipment_required, difficulty,
    instructions, form_tips, common_mistakes, beginner_alternative, advanced_alternative, video_url, thumbnail_url
) VALUES
(
    'Goblet Squat',
    'goblet-squat',
    'Legs',
    'Quadriceps',
    ARRAY['Glutes', 'Hamstrings', 'Core'],
    'Dumbbells',
    'Beginner',
    ARRAY[
        'Stand with feet shoulder-width apart, holding a dumbbell vertically against your chest with both hands under the top plate.',
        'Keep your chest high, core braced, and shoulders back.',
        'Hinge at hips and bend your knees to squat down until thighs are at least parallel to floor.',
        'Keep elbows tracking inside knees.',
        'Drive firmly through heels and midfoot to return to standing.'
    ],
    ARRAY['Keep chest proud throughout movement', 'Push knees gently outwards over toes', 'Breathe in on way down, exhale as you push up'],
    ARRAY['Rounding upper back and caving chest inward', 'Knees collapsing inward (valgus collapse)', 'Rising onto toes rather than keeping whole foot planted'],
    'Bodyweight Box Squat',
    'Barbell Front Squat',
    'https://www.youtube.com/watch?v=MeIiIdhvXT4',
    'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80'
),
(
    'Barbell Back Squat',
    'barbell-back-squat',
    'Legs',
    'Quadriceps',
    ARRAY['Glutes', 'Hamstrings', 'Lower Back', 'Core'],
    'Barbell & Plates',
    'Intermediate',
    ARRAY[
        'Rest barbell on upper traps/rear delts, hands gripping bar firmly outside shoulders.',
        'Unrack bar, take 2 controlled steps back, set feet slightly wider than shoulder-width with toes flared 15-30 degrees.',
        'Take a deep belly breath and brace core (Valsalva maneuver).',
        'Break at hips and knees simultaneously, sinking down to parallel or below.',
        'Drive through midfoot, extending hips and knees in unison.'
    ],
    ARRAY['Keep neutral spine with gaze fixed forward', 'Ensure bar path stays vertical over midfoot', 'Maintain strong abdominal intra-abdominal pressure'],
    ARRAY['Good-morning squatting (hips rising faster than chest)', 'Shallow depth above parallel', 'Heels lifting off ground'],
    'Goblet Squat',
    'Pause Barbell Squat',
    'https://www.youtube.com/watch?v=bEv6CCg2BC8',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80'
),
(
    'Dumbbell Bench Press',
    'dumbbell-bench-press',
    'Chest',
    'Pectorals',
    ARRAY['Triceps', 'Anterior Deltoids'],
    'Dumbbells',
    'Beginner',
    ARRAY[
        'Sit on a flat bench with dumbbells resting on thighs.',
        'Kick weights back as you lie down, positioning dumbbells at chest level with palms facing forward.',
        'Plant feet firmly into the floor and retract shoulder blades.',
        'Press dumbbells upward until arms are extended but not locked out.',
        'Lower dumbbells with control until weights are level with chest.'
    ],
    ARRAY['Keep elbows at a 45-to-60 degree angle to your torso, avoiding flared 90 degree elbows', 'Maintain natural arch in lower back with glutes planted'],
    ARRAY['Flaring elbows excessively wide which strains the rotator cuff', 'Bouncing dumbbells off chest or clanking them together at top', 'Lifting hips off the bench'],
    'Push-ups (Knee or Incline)',
    'Incline Dumbbell Press',
    'https://www.youtube.com/watch?v=VmB1G1K7v94',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80'
),
(
    'Standard Push-Up',
    'standard-push-up',
    'Chest',
    'Pectorals',
    ARRAY['Triceps', 'Shoulders', 'Core'],
    'Bodyweight',
    'Beginner',
    ARRAY[
        'Start in a high plank position with hands slightly wider than shoulder-width, fingers pointing forward.',
        'Engage glutes and core so body forms a straight line from heels to crown.',
        'Lower chest toward the floor by bending elbows at roughly 45 degrees.',
        'Descend until chest is about 1-2 inches off floor.',
        'Push the floor away explosively to return to plank position.'
    ],
    ARRAY['Squeeze glutes to protect lower back', 'Keep neck neutral by looking at a spot on the floor 6 inches ahead', 'Full range of motion beats high rep count with half reps'],
    ARRAY['Sagging lower back / hips drooping', 'Piking hips upward', 'Head dropping forward toward floor before chest descends'],
    'Incline Push-ups on Bench',
    'Decline Push-ups / Weighted Push-ups',
    'https://www.youtube.com/watch?v=IODxDxX7oi4',
    'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=600&q=80'
),
(
    'Dumbbell Bent-Over Row',
    'dumbbell-bent-over-row',
    'Back',
    'Latissimus Dorsi',
    ARRAY['Rhomboids', 'Rear Deltoids', 'Biceps'],
    'Dumbbells',
    'Beginner',
    ARRAY[
        'Hold a dumbbell in each hand with palms facing each other, hinge at hips until torso is roughly 45 degrees to ground.',
        'Keep spine straight with slight bend in knees.',
        'Pull dumbbells towards your hips, keeping elbows tucked close to your ribs.',
        'Squeeze your shoulder blades firmly at the top for 1 count.',
        'Lower weights slowly under control to full stretch.'
    ],
    ARRAY['Think about driving your elbows back towards your pockets rather than pulling with your forearms', 'Maintain a locked neutral spine throughout'],
    ARRAY['Using torso momentum to yank the weight up', 'Rounding the lower back into lumbar flexion', 'Shrugging shoulders towards ears'],
    'Single-Arm Supported Dumbbell Row',
    'Chest-Supported Barbell Row',
    'https://www.youtube.com/watch?v=6TSP13BylM0',
    'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=600&q=80'
),
(
    'Pull-Up',
    'pull-up',
    'Back',
    'Latissimus Dorsi',
    ARRAY['Biceps', 'Upper Back', 'Core', 'Forearms'],
    'Pull-up Bar',
    'Intermediate',
    ARRAY[
        'Grip pull-up bar with overhand grip slightly wider than shoulder width.',
        'Hang freely with arms fully extended (dead hang) and core braced.',
        'Depress shoulder blades down and back.',
        'Pull your body upward until your chin clears the bar, driving elbows downward.',
        'Control the descent smoothly back to full hang.'
    ],
    ARRAY['Think about pulling the bar down into your chest', 'Keep feet still or slightly crossed without swinging'],
    ARRAY['Kicking or kipping with legs to gain momentum', 'Half reps without full elbow extension at bottom', 'Craning neck unnaturally over the bar'],
    'Resistance Band Assisted Pull-up',
    'Weighted Pull-up',
    'https://www.youtube.com/watch?v=eGo4IYlbE5g',
    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=600&q=80'
),
(
    'Dumbbell Overhead Shoulder Press',
    'dumbbell-overhead-shoulder-press',
    'Shoulders',
    'Anterior Deltoids',
    ARRAY['Lateral Deltoids', 'Triceps', 'Upper Trapezius'],
    'Dumbbells',
    'Beginner',
    ARRAY[
        'Sit on an upright bench or stand tall with feet hip-width.',
        'Bring dumbbells to shoulder height with elbows angled at 45 degrees.',
        'Press dumbbells vertically overhead until arms are extended above ears.',
        'Avoid banging dumbbells at the peak.',
        'Lower weights smoothly over 2 seconds back to shoulder level.'
    ],
    ARRAY['Keep ribcage tucked down to prevent excessive lumbar arching', 'Press in a slight natural arc'],
    ARRAY['Arching lower back excessively to compensate for shoulder mobility', 'Pressing forward in front of face rather than overhead'],
    'Seated Dumbbell Press',
    'Standing Barbell Overhead Press',
    'https://www.youtube.com/watch?v=qEwKCR5JCog',
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80'
),
(
    'Romanian Deadlift (RDL)',
    'romanian-deadlift',
    'Legs',
    'Hamstrings',
    ARRAY['Glutes', 'Erector Spinae', 'Core'],
    'Dumbbells',
    'Intermediate',
    ARRAY[
        'Stand tall holding dumbbells or barbell in front of thighs, feet hip-width apart.',
        'Unlock knees slightly, keeping soft bend constant throughout.',
        'Push hips straight backward as if tapping a wall behind you.',
        'Lower weights along the front of your shins until you feel a deep hamstring stretch.',
        'Drive hips forward to return to standing, contracting glutes at top.'
    ],
    ARRAY['Motion comes from hip hinge, not knee bend', 'Keep weights touching or grazing your legs throughout movement'],
    ARRAY['Squatting the weight rather than hinging hips', 'Rounding lower back as weights go below knees'],
    'Glute Bridge / Single Leg Bridge',
    'Barbell Deficit RDL',
    'https://www.youtube.com/watch?v=JCXUYuzwNrM',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80'
),
(
    'Bulgarian Split Squat',
    'bulgarian-split-squat',
    'Legs',
    'Quadriceps',
    ARRAY['Glutes', 'Adductors', 'Core'],
    'Dumbbells',
    'Intermediate',
    ARRAY[
        'Stand 2-3 feet in front of a sturdy bench or chair.',
        'Place the top of your rear foot flat onto the bench.',
        'Keep torso tall with slight forward lean, holding dumbbells at sides.',
        'Descend by bending front knee until front thigh is parallel to floor.',
        'Drive through front heel and midfoot to ascend back to starting position.'
    ],
    ARRAY['85% of your weight should be on the front leg', 'Front knee stays aligned with second toe'],
    ARRAY['Placing front foot too close causing extreme heel lift', 'Pushing off rear foot instead of loading front leg'],
    'Walking Bodyweight Lunges',
    'Deficit Bulgarian Split Squat with Barbell',
    'https://www.youtube.com/watch?v=2C-uNgKwPLE',
    'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=600&q=80'
),
(
    'Forearm Plank',
    'forearm-plank',
    'Core',
    'Rectus Abdominis',
    ARRAY['Transverse Abdominis', 'Glutes', 'Shoulders'],
    'Bodyweight',
    'Beginner',
    ARRAY[
        'Place forearms on the floor with elbows directly under shoulders.',
        'Extend legs straight behind you, balls of feet on floor.',
        'Squeeze glutes, brace abs as if bracing for a punch, and pull belly button inwards.',
        'Keep body in a rigid, straight plank line.',
        'Hold for specified duration while taking steady, calm breaths.'
    ],
    ARRAY['Actively pull elbows towards toes to create intense core tension', 'Keep neck neutral by looking down between wrists'],
    ARRAY['Hips sagging down straining lumbar spine', 'Piking hips into an inverted V shape', 'Holding breath'],
    'Knee Plank',
    'RKC Plank / Ab Wheel Rollout',
    'https://www.youtube.com/watch?v=pSHjTRCQxIw',
    'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?auto=format&fit=crop&w=600&q=80'
),
(
    'Dumbbell Bicep Curl',
    'dumbbell-bicep-curl',
    'Arms',
    'Biceps Brachii',
    ARRAY['Brachialis', 'Brachioradialis'],
    'Dumbbells',
    'Beginner',
    ARRAY[
        'Stand tall holding a dumbbell in each hand, arms hanging at sides with palms neutral.',
        'Keep elbows pinned securely against your ribs.',
        'Curl the weights upward while supinating wrists so palms face shoulders at top.',
        'Squeeze biceps forcefully for 1 second at full contraction.',
        'Lower weights back down smoothly over 2 full seconds.'
    ],
    ARRAY['Do not allow elbows to drift forward or backward', 'Keep wrists neutral rather than curling wrists inward'],
    ARRAY['Swinging torso back and forth for momentum', 'Dropping weights quickly without controlling eccentric phase'],
    'Resistance Band Curl',
    'Incline Bench Dumbbell Curl',
    'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80'
),
(
    'Overhead Tricep Extension',
    'overhead-tricep-extension',
    'Arms',
    'Triceps',
    ARRAY['Forearms', 'Core'],
    'Dumbbells',
    'Beginner',
    ARRAY[
        'Sit or stand holding a single dumbbell with both hands cupped under the top weight plate.',
        'Raise the dumbbell overhead until arms are extended vertically.',
        'Keeping upper arms close to ears and elbows pointing forward, lower the weight behind head.',
        'Descend until forearms are just past parallel with floor.',
        'Contract triceps to extend arms back to overhead position.'
    ],
    ARRAY['Keep elbows from flaring out wide to the sides', 'Engage core to prevent hyper-extending the lower back'],
    ARRAY['Flaring elbows outward excessively', 'Moving upper arms forward and back instead of hinging strictly at elbow joint'],
    'Bench Tricep Dips',
    'Cable Tricep Rope Pushdown',
    'https://www.youtube.com/watch?v=-Vyt2QdsR7E',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80'
),
(
    'Lateral Dumbbell Raise',
    'lateral-dumbbell-raise',
    'Shoulders',
    'Lateral Deltoids',
    ARRAY['Upper Trapezius', 'Supraspinatus'],
    'Dumbbells',
    'Beginner',
    ARRAY[
        'Stand with feet hip-width, holding dumbbells at your sides with palms facing each other.',
        'Slight bend in knees and hips, arms slightly bent at elbows (10-15 degrees).',
        'Raise dumbbells outward to the sides in the scapular plane (slightly in front of body).',
        'Lift until elbows are level with shoulders.',
        'Pause briefly, then lower dumbbells with full control over 2 seconds.'
    ],
    ARRAY['Lead with your elbows, like pouring water from two pitchers at the top', 'Use lighter weight with strict form rather than swinging heavy weights'],
    ARRAY['Shrugging traps up to the ears', 'Using hip swing to heave dumbbells up', 'Lifting hands higher than elbows'],
    'Resistance Band Lateral Raise',
    'Cable Lateral Raise',
    'https://www.youtube.com/watch?v=3VcKaXpzqRo',
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600&q=80'
)
ON CONFLICT (name) DO UPDATE SET
    instructions = EXCLUDED.instructions,
    form_tips = EXCLUDED.form_tips,
    common_mistakes = EXCLUDED.common_mistakes,
    video_url = EXCLUDED.video_url;
