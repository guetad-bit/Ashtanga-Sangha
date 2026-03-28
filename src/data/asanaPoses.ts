// src/data/asanaPoses.ts
// Asana of the Day data — maps Primary Series poses to their cropped images
// Images are 800x800 PNG silhouettes on white backgrounds

import { ImageSourcePropType } from 'react-native';

export interface AsanaPose {
  id: string;
  sanskrit: string;
  english: string;
  series: 'Opening' | 'Standing' | 'Primary Seated' | 'Finishing';
  benefits: string[];
  tips: string;
  breaths: number | string;
  sides: 'Both' | 'Center' | 'N/A';
  difficulty: 'Beg.' | 'Int.' | 'Adv.';
  image: ImageSourcePropType;
}

// Static require map — React Native needs these at compile time
export const images: Record<string, ImageSourcePropType> = {
  samasthitih: require('@/../assets/asana_poses/samasthitih.png'),
  ekam_arms_up: require('@/../assets/asana_poses/ekam_arms_up.png'),
  uttanasana: require('@/../assets/asana_poses/uttanasana.png'),
  chaturanga_dandasana: require('@/../assets/asana_poses/chaturanga_dandasana.png'),
  urdhva_mukha_svanasana: require('@/../assets/asana_poses/urdhva_mukha_svanasana.png'),
  adho_mukha_svanasana: require('@/../assets/asana_poses/adho_mukha_svanasana.png'),
  ardha_uttanasana: require('@/../assets/asana_poses/ardha_uttanasana.png'),
  padangusthasana: require('@/../assets/asana_poses/padangusthasana.png'),
  padahastasana: require('@/../assets/asana_poses/padahastasana.png'),
  utthita_trikonasana: require('@/../assets/asana_poses/utthita_trikonasana.png'),
  parivrtta_trikonasana: require('@/../assets/asana_poses/parivrtta_trikonasana.png'),
  utthita_parsvakonasana: require('@/../assets/asana_poses/utthita_parsvakonasana.png'),
  parivrtta_parsvakonasana: require('@/../assets/asana_poses/parivrtta_parsvakonasana.png'),
  prasarita_padottanasana_a: require('@/../assets/asana_poses/prasarita_padottanasana_a.png'),
  prasarita_padottanasana_b: require('@/../assets/asana_poses/prasarita_padottanasana_b.png'),
  prasarita_padottanasana_c: require('@/../assets/asana_poses/prasarita_padottanasana_c.png'),
  prasarita_padottanasana_d: require('@/../assets/asana_poses/prasarita_padottanasana_d.png'),
  parsvottanasana: require('@/../assets/asana_poses/parsvottanasana.png'),
  utthita_hasta_padangusthasana_a: require('@/../assets/asana_poses/utthita_hasta_padangusthasana_a.png'),
  utthita_hasta_padangusthasana_b: require('@/../assets/asana_poses/utthita_hasta_padangusthasana_b.png'),
  utthita_hasta_padangusthasana_c: require('@/../assets/asana_poses/utthita_hasta_padangusthasana_c.png'),
  ardha_baddha_padmottanasana: require('@/../assets/asana_poses/ardha_baddha_padmottanasana.png'),
  utkatasana: require('@/../assets/asana_poses/utkatasana.png'),
  virabhadrasana_a: require('@/../assets/asana_poses/virabhadrasana_a.png'),
  virabhadrasana_b: require('@/../assets/asana_poses/virabhadrasana_b.png'),
  dandasana: require('@/../assets/asana_poses/dandasana.png'),
  paschimottanasana_a: require('@/../assets/asana_poses/paschimottanasana_a.png'),
  paschimottanasana_b: require('@/../assets/asana_poses/paschimottanasana_b.png'),
  purvottanasana: require('@/../assets/asana_poses/purvottanasana.png'),
  ardha_baddha_padma_paschimottanasana: require('@/../assets/asana_poses/ardha_baddha_padma_paschimottanasana.png'),
  triang_mukhaikapada_paschimottanasana: require('@/../assets/asana_poses/triang_mukhaikapada_paschimottanasana.png'),
  janu_sirsasana_a: require('@/../assets/asana_poses/janu_sirsasana_a.png'),
  janu_sirsasana_b: require('@/../assets/asana_poses/janu_sirsasana_b.png'),
  janu_sirsasana_c: require('@/../assets/asana_poses/janu_sirsasana_c.png'),
  marichyasana_a: require('@/../assets/asana_poses/marichyasana_a.png'),
  marichyasana_b: require('@/../assets/asana_poses/marichyasana_b.png'),
  marichyasana_c: require('@/../assets/asana_poses/marichyasana_c.png'),
  marichyasana_d: require('@/../assets/asana_poses/marichyasana_d.png'),
  navasana: require('@/../assets/asana_poses/navasana.png'),
  bhujapidasana: require('@/../assets/asana_poses/bhujapidasana.png'),
  kurmasana: require('@/../assets/asana_poses/kurmasana.png'),
  supta_kurmasana: require('@/../assets/asana_poses/supta_kurmasana.png'),
  garbha_pindasana: require('@/../assets/asana_poses/garbha_pindasana.png'),
  kukkutasana: require('@/../assets/asana_poses/kukkutasana.png'),
  baddha_konasana_a: require('@/../assets/asana_poses/baddha_konasana_a.png'),
  baddha_konasana_b: require('@/../assets/asana_poses/baddha_konasana_b.png'),
  upavistha_konasana_a: require('@/../assets/asana_poses/upavistha_konasana_a.png'),
  upavistha_konasana_b: require('@/../assets/asana_poses/upavistha_konasana_b.png'),
  supta_konasana: require('@/../assets/asana_poses/supta_konasana.png'),
  supta_padangusthasana: require('@/../assets/asana_poses/supta_padangusthasana.png'),
  ubhaya_padangusthasana_a: require('@/../assets/asana_poses/ubhaya_padangusthasana_a.png'),
  ubhaya_padangusthasana_b: require('@/../assets/asana_poses/ubhaya_padangusthasana_b.png'),
  urdhva_mukha_paschimottanasana: require('@/../assets/asana_poses/urdhva_mukha_paschimottanasana.png'),
  setu_bandhasana: require('@/../assets/asana_poses/setu_bandhasana.png'),
  urdhva_dhanurasana: require('@/../assets/asana_poses/urdhva_dhanurasana.png'),
  dropback_a: require('@/../assets/asana_poses/dropback_a.png'),
  dropback_b: require('@/../assets/asana_poses/dropback_b.png'),
  dropback_c: require('@/../assets/asana_poses/dropback_c.png'),
  dropback_d: require('@/../assets/asana_poses/dropback_d.png'),
  sarvangasana: require('@/../assets/asana_poses/sarvangasana.png'),
  halasana: require('@/../assets/asana_poses/halasana.png'),
  karnapidasana: require('@/../assets/asana_poses/karnapidasana.png'),
  urdhva_padmasana: require('@/../assets/asana_poses/urdhva_padmasana.png'),
  pindasana: require('@/../assets/asana_poses/pindasana.png'),
  matsyasana: require('@/../assets/asana_poses/matsyasana.png'),
  uttana_padasana: require('@/../assets/asana_poses/uttana_padasana.png'),
  sirsasana_a: require('@/../assets/asana_poses/sirsasana_a.png'),
  sirsasana_b: require('@/../assets/asana_poses/sirsasana_b.png'),
  sirsasana_c: require('@/../assets/asana_poses/sirsasana_c.png'),
  baddha_padmasana: require('@/../assets/asana_poses/baddha_padmasana.png'),
  yoga_mudra: require('@/../assets/asana_poses/yoga_mudra.png'),
  padmasana: require('@/../assets/asana_poses/padmasana.png'),
  utpluthih: require('@/../assets/asana_poses/utpluthih.png'),
};

// ── Primary Series poses in sequence order ──────────────────────────────────

export const PRIMARY_POSE_SEQUENCE: AsanaPose[] = [
  // ── Opening ──
  { id: 'samasthitih', sanskrit: 'Samasthitiḥ', english: 'Equal Standing', series: 'Opening', benefits: ['Grounding', 'Alignment', 'Focus'], tips: 'Stand tall with feet together. Distribute weight evenly. Engage bandhas and set your drishti.', breaths: 5, sides: 'Center', difficulty: 'Beg.', image: images.samasthitih },
  { id: 'ekam_arms_up', sanskrit: 'Ūrdhva Vṛkṣāsana', english: 'Upward Tree (Ekam)', series: 'Opening', benefits: ['Stretch', 'Breath link', 'Warm-up'], tips: 'Inhale arms up, gaze to thumbs. Keep shoulders relaxed away from ears.', breaths: 1, sides: 'Center', difficulty: 'Beg.', image: images.ekam_arms_up },
  { id: 'uttanasana', sanskrit: 'Uttānāsana', english: 'Standing Forward Fold', series: 'Opening', benefits: ['Hamstrings', 'Spine', 'Calming'], tips: 'Fold from the hips, not the waist. Let the head hang heavy. Micro-bend knees if needed.', breaths: 5, sides: 'Center', difficulty: 'Beg.', image: images.uttanasana },
  { id: 'chaturanga_dandasana', sanskrit: 'Chaturāṅga Daṇḍāsana', english: 'Four-Limbed Staff', series: 'Opening', benefits: ['Core strength', 'Arm strength', 'Control'], tips: 'Lower halfway with elbows hugging ribs. Keep the body in one line like a plank.', breaths: 1, sides: 'Center', difficulty: 'Int.', image: images.chaturanga_dandasana },
  { id: 'urdhva_mukha_svanasana', sanskrit: 'Ūrdhva Mukha Śvānāsana', english: 'Upward Facing Dog', series: 'Opening', benefits: ['Chest opening', 'Spine extension', 'Strength'], tips: 'Press through hands, lift thighs off the floor. Roll shoulders back and open the chest.', breaths: 1, sides: 'Center', difficulty: 'Beg.', image: images.urdhva_mukha_svanasana },
  { id: 'adho_mukha_svanasana', sanskrit: 'Adho Mukha Śvānāsana', english: 'Downward Facing Dog', series: 'Opening', benefits: ['Full body stretch', 'Inversion', 'Calming'], tips: 'Press hands wide, send hips up and back. Pedal the heels. Five breaths.', breaths: 5, sides: 'Center', difficulty: 'Beg.', image: images.adho_mukha_svanasana },

  // ── Standing ──
  { id: 'padangusthasana', sanskrit: 'Pādāṅguṣṭhāsana', english: 'Big Toe Pose', series: 'Standing', benefits: ['Hamstrings', 'Calming', 'Digestion'], tips: 'Grip big toes with first two fingers. Straighten the legs, draw head toward shins.', breaths: 5, sides: 'Center', difficulty: 'Beg.', image: images.padangusthasana },
  { id: 'padahastasana', sanskrit: 'Pādahastāsana', english: 'Hand Under Foot', series: 'Standing', benefits: ['Hamstrings', 'Wrists', 'Digestion'], tips: 'Slide hands under feet, palms up. Toes at wrist creases. Fold deeply.', breaths: 5, sides: 'Center', difficulty: 'Beg.', image: images.padahastasana },
  { id: 'utthita_trikonasana', sanskrit: 'Utthita Trikoṇāsana', english: 'Extended Triangle', series: 'Standing', benefits: ['Hips', 'Balance', 'Core strength', 'Spine'], tips: 'Extend torso over front leg. Keep both sides long. Gaze to upper hand.', breaths: 5, sides: 'Both', difficulty: 'Beg.', image: images.utthita_trikonasana },
  { id: 'parivrtta_trikonasana', sanskrit: 'Parivṛtta Trikoṇāsana', english: 'Revolved Triangle', series: 'Standing', benefits: ['Spinal twist', 'Balance', 'Digestion'], tips: 'Square hips forward, then twist. Opposite hand to floor outside front foot.', breaths: 5, sides: 'Both', difficulty: 'Int.', image: images.parivrtta_trikonasana },
  { id: 'utthita_parsvakonasana', sanskrit: 'Utthita Pārśvakoṇāsana', english: 'Extended Side Angle', series: 'Standing', benefits: ['Groin opening', 'Stamina', 'Legs'], tips: 'Deep lunge. Create one line from back foot through fingertips. Gaze to upper hand.', breaths: 5, sides: 'Both', difficulty: 'Beg.', image: images.utthita_parsvakonasana },
  { id: 'parivrtta_parsvakonasana', sanskrit: 'Parivṛtta Pārśvakoṇāsana', english: 'Revolved Side Angle', series: 'Standing', benefits: ['Deep twist', 'Legs', 'Detox'], tips: 'Opposite elbow outside front knee. Press palms together and twist on exhale.', breaths: 5, sides: 'Both', difficulty: 'Int.', image: images.parivrtta_parsvakonasana },
  { id: 'prasarita_padottanasana_a', sanskrit: 'Prasārita Pādottānāsana A', english: 'Wide-Leg Forward Fold A', series: 'Standing', benefits: ['Inner legs', 'Calming', 'Ankles'], tips: 'Feet parallel, hands to floor between feet. Crown of head toward the floor.', breaths: 5, sides: 'Center', difficulty: 'Beg.', image: images.prasarita_padottanasana_a },
  { id: 'prasarita_padottanasana_b', sanskrit: 'Prasārita Pādottānāsana B', english: 'Wide-Leg Forward Fold B', series: 'Standing', benefits: ['Inner legs', 'Core', 'Balance'], tips: 'Hands on waist, fold forward keeping spine long. Hold with control.', breaths: 5, sides: 'Center', difficulty: 'Beg.', image: images.prasarita_padottanasana_b },
  { id: 'prasarita_padottanasana_c', sanskrit: 'Prasārita Pādottānāsana C', english: 'Wide-Leg Forward Fold C', series: 'Standing', benefits: ['Shoulders', 'Inner legs', 'Balance'], tips: 'Clasp hands behind back, fold forward, arms reaching overhead toward the floor.', breaths: 5, sides: 'Center', difficulty: 'Int.', image: images.prasarita_padottanasana_c },
  { id: 'prasarita_padottanasana_d', sanskrit: 'Prasārita Pādottānāsana D', english: 'Wide-Leg Forward Fold D', series: 'Standing', benefits: ['Hamstrings', 'Inner legs', 'Grip'], tips: 'Grip big toes, fold deeply. Similar to Padangusthasana but with wide legs.', breaths: 5, sides: 'Center', difficulty: 'Beg.', image: images.prasarita_padottanasana_d },
  { id: 'parsvottanasana', sanskrit: 'Pārśvottānāsana', english: 'Intense Side Stretch', series: 'Standing', benefits: ['Hamstrings', 'Shoulders', 'Balance'], tips: 'Reverse prayer hands. Square hips, fold over front leg. Keep both legs straight.', breaths: 5, sides: 'Both', difficulty: 'Int.', image: images.parsvottanasana },
  { id: 'utthita_hasta_padangusthasana_a', sanskrit: 'Utthita Hasta Pādāṅguṣṭhāsana A', english: 'Hand-to-Toe A', series: 'Standing', benefits: ['Balance', 'Hamstrings', 'Focus'], tips: 'Catch big toe, extend leg forward. Stand tall, gaze to toes.', breaths: 5, sides: 'Both', difficulty: 'Int.', image: images.utthita_hasta_padangusthasana_a },
  { id: 'utthita_hasta_padangusthasana_b', sanskrit: 'Utthita Hasta Pādāṅguṣṭhāsana B', english: 'Hand-to-Toe B', series: 'Standing', benefits: ['Balance', 'Hip opening', 'Focus'], tips: 'Open leg to the side. Keep standing hip level. Gaze opposite direction.', breaths: 5, sides: 'Both', difficulty: 'Int.', image: images.utthita_hasta_padangusthasana_b },
  { id: 'utthita_hasta_padangusthasana_c', sanskrit: 'Utthita Hasta Pādāṅguṣṭhāsana C', english: 'Hand-to-Toe C', series: 'Standing', benefits: ['Balance', 'Core', 'Hamstrings'], tips: 'Bring leg back to center, fold chin to shin. Hold with concentration.', breaths: 5, sides: 'Both', difficulty: 'Int.', image: images.utthita_hasta_padangusthasana_c },
  { id: 'ardha_baddha_padmottanasana', sanskrit: 'Ardha Baddha Padmottānāsana', english: 'Half Bound Lotus Fold', series: 'Standing', benefits: ['Hips', 'Shoulders', 'Balance'], tips: 'Half lotus standing. Bind arm behind to catch the foot, then fold forward.', breaths: 5, sides: 'Both', difficulty: 'Int.', image: images.ardha_baddha_padmottanasana },
  { id: 'utkatasana', sanskrit: 'Utkaṭāsana', english: 'Chair Pose', series: 'Standing', benefits: ['Legs', 'Stamina', 'Heat'], tips: 'Sit deeply, knees bent. Arms overhead, spine long. Build heat and determination.', breaths: 5, sides: 'Center', difficulty: 'Beg.', image: images.utkatasana },
  { id: 'virabhadrasana_a', sanskrit: 'Vīrabhadrāsana A', english: 'Warrior I', series: 'Standing', benefits: ['Legs', 'Chest opening', 'Focus'], tips: 'Deep lunge, back foot angled. Arms reach overhead. Square hips forward.', breaths: 5, sides: 'Both', difficulty: 'Beg.', image: images.virabhadrasana_a },
  { id: 'virabhadrasana_b', sanskrit: 'Vīrabhadrāsana B', english: 'Warrior II', series: 'Standing', benefits: ['Legs', 'Stamina', 'Hips'], tips: 'Arms parallel to floor. Gaze over front hand. Sink into the front knee.', breaths: 5, sides: 'Both', difficulty: 'Beg.', image: images.virabhadrasana_b },

  // ── Primary Seated ──
  { id: 'dandasana', sanskrit: 'Daṇḍāsana', english: 'Staff Pose', series: 'Primary Seated', benefits: ['Posture', 'Core', 'Foundation'], tips: 'Press hands beside hips. Legs extended, flex feet. Spine tall like a staff.', breaths: 5, sides: 'Center', difficulty: 'Beg.', image: images.dandasana },
  { id: 'paschimottanasana_a', sanskrit: 'Paścimottānāsana A', english: 'Seated Forward Fold A', series: 'Primary Seated', benefits: ['Hamstrings', 'Spine', 'Calming'], tips: 'Catch the sides of the feet. Lengthen on inhale, fold on exhale.', breaths: 5, sides: 'Center', difficulty: 'Beg.', image: images.paschimottanasana_a },
  { id: 'paschimottanasana_b', sanskrit: 'Paścimottānāsana B', english: 'Seated Forward Fold B', series: 'Primary Seated', benefits: ['Hamstrings', 'Spine', 'Calming'], tips: 'Catch around the soles of the feet. Deepen the fold with each exhale.', breaths: 5, sides: 'Center', difficulty: 'Beg.', image: images.paschimottanasana_b },
  { id: 'purvottanasana', sanskrit: 'Pūrvottānāsana', english: 'Upward Plank', series: 'Primary Seated', benefits: ['Chest opening', 'Arms', 'Wrists'], tips: 'Hands behind, fingers toward feet. Press hips high. Open chest to sky.', breaths: 5, sides: 'Center', difficulty: 'Beg.', image: images.purvottanasana },
  { id: 'ardha_baddha_padma_paschimottanasana', sanskrit: 'Ardha Baddha Padma Paścimottānāsana', english: 'Half Bound Lotus Forward Fold', series: 'Primary Seated', benefits: ['Hips', 'Digestion', 'Calming'], tips: 'Half lotus, bind behind to catch the foot. Fold over extended leg.', breaths: 5, sides: 'Both', difficulty: 'Int.', image: images.ardha_baddha_padma_paschimottanasana },
  { id: 'triang_mukhaikapada_paschimottanasana', sanskrit: 'Triaṅg Mukhaikapāda Paścimottānāsana', english: 'Three-Limbed Forward Fold', series: 'Primary Seated', benefits: ['Hamstrings', 'Quadriceps', 'Digestion'], tips: 'One leg hero pose, other extended. Keep both sit bones grounded. Fold forward.', breaths: 5, sides: 'Both', difficulty: 'Int.', image: images.triang_mukhaikapada_paschimottanasana },
  { id: 'janu_sirsasana_a', sanskrit: 'Jānu Śīrṣāsana A', english: 'Head-to-Knee A', series: 'Primary Seated', benefits: ['Hamstrings', 'Hips', 'Kidneys'], tips: 'Bent knee at 90 degrees. Fold over extended leg. Draw chin toward shin.', breaths: 5, sides: 'Both', difficulty: 'Beg.', image: images.janu_sirsasana_a },
  { id: 'janu_sirsasana_b', sanskrit: 'Jānu Śīrṣāsana B', english: 'Head-to-Knee B', series: 'Primary Seated', benefits: ['Hips', 'Perineum', 'Digestion'], tips: 'Sit on the heel of bent leg. Fold forward over extended leg.', breaths: 5, sides: 'Both', difficulty: 'Int.', image: images.janu_sirsasana_b },
  { id: 'janu_sirsasana_c', sanskrit: 'Jānu Śīrṣāsana C', english: 'Head-to-Knee C', series: 'Primary Seated', benefits: ['Hips', 'Ankle', 'Digestion'], tips: 'Ball of bent foot on floor, toes point down. Fold over extended leg.', breaths: 5, sides: 'Both', difficulty: 'Int.', image: images.janu_sirsasana_c },
  { id: 'marichyasana_a', sanskrit: 'Marīcyāsana A', english: 'Sage Marichi A', series: 'Primary Seated', benefits: ['Shoulders', 'Digestion', 'Calming'], tips: 'Bind arm around bent knee, catch wrist behind. Fold forward.', breaths: 5, sides: 'Both', difficulty: 'Int.', image: images.marichyasana_a },
  { id: 'marichyasana_b', sanskrit: 'Marīcyāsana B', english: 'Sage Marichi B', series: 'Primary Seated', benefits: ['Hips', 'Shoulders', 'Organs'], tips: 'Half lotus + bent knee. Bind and fold. One of the deeper binds.', breaths: 5, sides: 'Both', difficulty: 'Adv.', image: images.marichyasana_b },
  { id: 'marichyasana_c', sanskrit: 'Marīcyāsana C', english: 'Sage Marichi C', series: 'Primary Seated', benefits: ['Spinal twist', 'Detox', 'Shoulders'], tips: 'Twist toward bent knee. Opposite arm wraps around. Use exhale to deepen.', breaths: 5, sides: 'Both', difficulty: 'Int.', image: images.marichyasana_c },
  { id: 'marichyasana_d', sanskrit: 'Marīcyāsana D', english: 'Sage Marichi D', series: 'Primary Seated', benefits: ['Deep twist', 'Hips', 'Patience'], tips: 'Half lotus + twist + bind. The gateway pose. Practice with patience.', breaths: 5, sides: 'Both', difficulty: 'Adv.', image: images.marichyasana_d },
  { id: 'navasana', sanskrit: 'Nāvāsana', english: 'Boat Pose', series: 'Primary Seated', benefits: ['Core', 'Hip flexors', 'Bandhas'], tips: 'Balance on sit bones. Legs and arms extended. Repeat 5 times with lift-ups.', breaths: 5, sides: 'Center', difficulty: 'Int.', image: images.navasana },
  { id: 'bhujapidasana', sanskrit: 'Bhujapīḍāsana', english: 'Shoulder Pressing', series: 'Primary Seated', benefits: ['Arms', 'Core', 'Confidence'], tips: 'Wrap legs around upper arms. Cross feet, lower head. Jump back.', breaths: 5, sides: 'Center', difficulty: 'Adv.', image: images.bhujapidasana },
  { id: 'kurmasana', sanskrit: 'Kūrmāsana', english: 'Tortoise Pose', series: 'Primary Seated', benefits: ['Hips', 'Shoulders', 'Introspection'], tips: 'Thread arms under legs, extend outward. Chest presses toward floor.', breaths: 5, sides: 'Center', difficulty: 'Adv.', image: images.kurmasana },
  { id: 'supta_kurmasana', sanskrit: 'Supta Kūrmāsana', english: 'Sleeping Tortoise', series: 'Primary Seated', benefits: ['Pratyahara', 'Flexibility', 'Patience'], tips: 'Cross feet behind head. Hands bind behind back. Surrender into the fold.', breaths: 5, sides: 'Center', difficulty: 'Adv.', image: images.supta_kurmasana },
  { id: 'garbha_pindasana', sanskrit: 'Garbha Piṇḍāsana', english: 'Embryo in the Womb', series: 'Primary Seated', benefits: ['Organs', 'Hips', 'Playfulness'], tips: 'Thread arms through lotus legs. Hands to face. Roll in a circle 9 times.', breaths: 5, sides: 'Center', difficulty: 'Adv.', image: images.garbha_pindasana },
  { id: 'kukkutasana', sanskrit: 'Kukkuṭāsana', english: 'Rooster Pose', series: 'Primary Seated', benefits: ['Arms', 'Core', 'Confidence'], tips: 'From Garbha Pindasana, press hands down and lift entire body.', breaths: 5, sides: 'Center', difficulty: 'Adv.', image: images.kukkutasana },
  { id: 'baddha_konasana_a', sanskrit: 'Baddha Koṇāsana A', english: 'Bound Angle A', series: 'Primary Seated', benefits: ['Inner thighs', 'Groins', 'Calming'], tips: 'Soles together, knees wide. Fold chin toward the floor.', breaths: 5, sides: 'Center', difficulty: 'Beg.', image: images.baddha_konasana_a },
  { id: 'baddha_konasana_b', sanskrit: 'Baddha Koṇāsana B', english: 'Bound Angle B', series: 'Primary Seated', benefits: ['Inner thighs', 'Spine', 'Groins'], tips: 'Round the back, forehead toward feet. Different energy than A.', breaths: 5, sides: 'Center', difficulty: 'Int.', image: images.baddha_konasana_b },
  { id: 'upavistha_konasana_a', sanskrit: 'Upaviṣṭha Koṇāsana A', english: 'Seated Wide Angle A', series: 'Primary Seated', benefits: ['Inner legs', 'Hamstrings', 'Spine'], tips: 'Legs wide, fold forward. Chin toward the floor. Keep spine long.', breaths: 5, sides: 'Center', difficulty: 'Int.', image: images.upavistha_konasana_a },
  { id: 'upavistha_konasana_b', sanskrit: 'Upaviṣṭha Koṇāsana B', english: 'Seated Wide Angle B', series: 'Primary Seated', benefits: ['Balance', 'Core', 'Inner legs'], tips: 'Grab toes, balance lifting legs upward. Gaze up.', breaths: 5, sides: 'Center', difficulty: 'Int.', image: images.upavistha_konasana_b },
  { id: 'supta_konasana', sanskrit: 'Supta Koṇāsana', english: 'Reclining Angle', series: 'Primary Seated', benefits: ['Hamstrings', 'Core', 'Proprioception'], tips: 'Roll back with wide legs overhead, catch toes. Roll up to balance.', breaths: 5, sides: 'Center', difficulty: 'Int.', image: images.supta_konasana },
  { id: 'supta_padangusthasana', sanskrit: 'Supta Pādāṅguṣṭhāsana', english: 'Reclining Hand-to-Toe', series: 'Primary Seated', benefits: ['Hamstrings', 'Hips', 'Back relief'], tips: 'Lying down, catch big toe. Extend forward, then to the side.', breaths: 5, sides: 'Both', difficulty: 'Beg.', image: images.supta_padangusthasana },
  { id: 'ubhaya_padangusthasana_a', sanskrit: 'Ubhaya Pādāṅguṣṭhāsana', english: 'Both Big Toes A', series: 'Primary Seated', benefits: ['Core', 'Balance', 'Hamstrings'], tips: 'Roll up catching both big toes. Balance on sit bones, legs extended.', breaths: 5, sides: 'Center', difficulty: 'Int.', image: images.ubhaya_padangusthasana_a },
  { id: 'urdhva_mukha_paschimottanasana', sanskrit: 'Ūrdhva Mukha Paścimottānāsana', english: 'Upward Forward Fold', series: 'Primary Seated', benefits: ['Core', 'Hamstrings', 'Hip flexors'], tips: 'Hold soles of feet, legs close to face while balancing.', breaths: 5, sides: 'Center', difficulty: 'Int.', image: images.urdhva_mukha_paschimottanasana },
  { id: 'setu_bandhasana', sanskrit: 'Setu Bandhāsana', english: 'Bridge Pose', series: 'Primary Seated', benefits: ['Neck', 'Legs', 'Chest opening'], tips: 'Cross arms, press feet and crown of head down, lift hips. Often skipped.', breaths: 5, sides: 'Center', difficulty: 'Int.', image: images.setu_bandhasana },

  // ── Finishing ──
  { id: 'urdhva_dhanurasana', sanskrit: 'Ūrdhva Dhanurāsana', english: 'Upward Bow', series: 'Finishing', benefits: ['Full front body', 'Arms', 'Energy'], tips: 'Press up to full wheel. Arms and legs straight. Three times, five breaths each.', breaths: '3×5', sides: 'Center', difficulty: 'Int.', image: images.urdhva_dhanurasana },
  { id: 'sarvangasana', sanskrit: 'Sālamba Sarvāṅgāsana', english: 'Shoulderstand', series: 'Finishing', benefits: ['Nervous system', 'Thyroid', 'Inversion'], tips: 'The queen of asanas. Support on shoulders, chin to chest. Hold 25 breaths.', breaths: 25, sides: 'Center', difficulty: 'Int.', image: images.sarvangasana },
  { id: 'halasana', sanskrit: 'Halāsana', english: 'Plow Pose', series: 'Finishing', benefits: ['Spine', 'Calming', 'Thyroid'], tips: 'From shoulderstand, lower feet overhead to the floor. Legs straight.', breaths: 8, sides: 'Center', difficulty: 'Int.', image: images.halasana },
  { id: 'karnapidasana', sanskrit: 'Karṇapīḍāsana', english: 'Ear Pressure Pose', series: 'Finishing', benefits: ['Pratyahara', 'Spine', 'Calming'], tips: 'From Halasana, bend knees to the ears. Knees press against ears.', breaths: 8, sides: 'Center', difficulty: 'Int.', image: images.karnapidasana },
  { id: 'urdhva_padmasana', sanskrit: 'Ūrdhva Padmāsana', english: 'Upward Lotus', series: 'Finishing', benefits: ['Balance', 'Hips', 'Focus'], tips: 'Take lotus in shoulderstand. Support knees with hands.', breaths: 8, sides: 'Center', difficulty: 'Adv.', image: images.urdhva_padmasana },
  { id: 'pindasana', sanskrit: 'Piṇḍāsana', english: 'Embryo Pose', series: 'Finishing', benefits: ['Organs', 'Pratyahara', 'Surrender'], tips: 'From Urdhva Padmasana, fold lotus toward face. Arms wrap around.', breaths: 8, sides: 'Center', difficulty: 'Adv.', image: images.pindasana },
  { id: 'matsyasana', sanskrit: 'Matsyāsana', english: 'Fish Pose', series: 'Finishing', benefits: ['Chest opening', 'Throat', 'Counterpose'], tips: 'In lotus, arch back. Crown of head on floor. Counter to shoulderstand.', breaths: 8, sides: 'Center', difficulty: 'Int.', image: images.matsyasana },
  { id: 'uttana_padasana', sanskrit: 'Uttāna Pādāsana', english: 'Extended Leg Pose', series: 'Finishing', benefits: ['Core', 'Hip flexors', 'Fire'], tips: 'Legs and arms lift at 45 degrees. Palms together. Intense core hold.', breaths: 8, sides: 'Center', difficulty: 'Int.', image: images.uttana_padasana },
  { id: 'sirsasana_a', sanskrit: 'Śīrṣāsana A', english: 'Headstand', series: 'Finishing', benefits: ['Focus', 'Core', 'Inversion'], tips: 'The king of asanas. Foundation in forearms. Hold 25 breaths.', breaths: 25, sides: 'Center', difficulty: 'Adv.', image: images.sirsasana_a },
  { id: 'baddha_padmasana', sanskrit: 'Baddha Padmāsana', english: 'Bound Lotus', series: 'Finishing', benefits: ['Shoulders', 'Ankles', 'Calming'], tips: 'Lotus with arms crossed behind, catching opposite feet. Fold forward.', breaths: 8, sides: 'Center', difficulty: 'Adv.', image: images.baddha_padmasana },
  { id: 'yoga_mudra', sanskrit: 'Yoga Mudrā', english: 'Yoga Seal', series: 'Finishing', benefits: ['Surrender', 'Hips', 'Calming'], tips: 'In bound lotus, fold forward to the floor. Seal the practice.', breaths: 8, sides: 'Center', difficulty: 'Adv.', image: images.yoga_mudra },
  { id: 'padmasana', sanskrit: 'Padmāsana', english: 'Lotus Pose', series: 'Finishing', benefits: ['Meditation', 'Hips', 'Calming'], tips: 'The classical meditation seat. Sit tall, hands in chin mudra. 10 breaths.', breaths: 10, sides: 'Center', difficulty: 'Int.', image: images.padmasana },
  { id: 'utpluthih', sanskrit: 'Utplutiḥ', english: 'Sprung Up', series: 'Finishing', benefits: ['Arms', 'Bandhas', 'Focus'], tips: 'In lotus, press hands down and lift everything off the floor. 25 breaths. Done!', breaths: 25, sides: 'Center', difficulty: 'Adv.', image: images.utpluthih },
];

// ── Helper: get today's asana ────────────────────────────────────────────────

export function getAsanaOfTheDay(): AsanaPose {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return PRIMARY_POSE_SEQUENCE[dayOfYear % PRIMARY_POSE_SEQUENCE.length];
}

// Series badge color helper
export function getSeriesColor(series: AsanaPose['series']) {
  switch (series) {
    case 'Opening': return { bg: '#E8EEFF', text: '#405DE6' };
    case 'Standing': return { bg: '#E0FFF0', text: '#34D399' };
    case 'Primary Seated': return { bg: '#FFF5EC', text: '#C4956A' };
    case 'Finishing': return { bg: '#FFF0F0', text: '#FF6B6B' };
  }
}
