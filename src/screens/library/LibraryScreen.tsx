// src/screens/library/LibraryScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, Modal, Pressable, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadows } from '@/styles/tokens';
import { useTranslation } from 'react-i18next';
import AppHeader from '@/components/AppHeader';
import { images as poseImages } from '@/data/asanaPoses';
import { ImageSourcePropType } from 'react-native';

// ── Explicit image map: Library asana english name → pose image ──────────────
// Uses the already-resolved images from asanaPoses.ts (single source of truth)
const ASANA_IMAGE_MAP: Record<string, ImageSourcePropType> = {
  // Opening
  'Sun Salutation A': poseImages.ekam_arms_up,
  'Sun Salutation B': poseImages.virabhadrasana_a,
  // Standing
  'Big Toe Pose': poseImages.padangusthasana,
  'Hand Under Foot Pose': poseImages.padahastasana,
  'Extended Triangle': poseImages.utthita_trikonasana,
  'Revolved Triangle': poseImages.parivrtta_trikonasana,
  'Extended Side Angle': poseImages.utthita_parsvakonasana,
  'Revolved Side Angle': poseImages.parivrtta_parsvakonasana,
  'Wide-Legged Forward Fold': poseImages.prasarita_padottanasana_a,
  'Intense Side Stretch': poseImages.parsvottanasana,
  'Hand-to-Big-Toe Pose': poseImages.utthita_hasta_padangusthasana_a,
  'Half Bound Lotus Forward Fold': poseImages.ardha_baddha_padmottanasana,
  'Chair Pose': poseImages.utkatasana,
  'Warrior I & II': poseImages.virabhadrasana_b,
  // Primary Seated
  'Staff Pose': poseImages.dandasana,
  'Western Intense Stretch': poseImages.paschimottanasana_a,
  'Eastern Intense Stretch': poseImages.purvottanasana,
  'Three-Limbed Forward Fold': poseImages.triang_mukhaikapada_paschimottanasana,
  'Head-to-Knee Pose': poseImages.janu_sirsasana_a,
  "Sage Marichi's Pose A": poseImages.marichyasana_a,
  "Sage Marichi's Pose B": poseImages.marichyasana_b,
  "Sage Marichi's Twist C": poseImages.marichyasana_c,
  "Sage Marichi's Twist D": poseImages.marichyasana_d,
  'Boat Pose': poseImages.navasana,
  'Shoulder Pressing Pose': poseImages.bhujapidasana,
  'Tortoise Pose': poseImages.kurmasana,
  'Sleeping Tortoise': poseImages.supta_kurmasana,
  'Embryo in the Womb': poseImages.garbha_pindasana,
  'Rooster Pose': poseImages.kukkutasana,
  'Bound Angle Pose': poseImages.baddha_konasana_a,
  'Seated Wide Angle': poseImages.upavistha_konasana_a,
  'Reclining Angle Pose': poseImages.supta_konasana,
  'Reclining Hand-to-Big-Toe': poseImages.supta_padangusthasana,
  'Both Big Toes Pose': poseImages.ubhaya_padangusthasana_a,
  'Upward Facing Forward Fold': poseImages.urdhva_mukha_paschimottanasana,
  'Bridge Pose': poseImages.setu_bandhasana,
  // Finishing
  'Upward Bow / Wheel': poseImages.urdhva_dhanurasana,
  'Seated Forward Fold (closing)': poseImages.paschimottanasana_b,
  'Shoulderstand': poseImages.sarvangasana,
  'Plow Pose': poseImages.halasana,
  'Ear Pressure Pose': poseImages.karnapidasana,
  'Upward Lotus': poseImages.urdhva_padmasana,
  'Embryo Pose': poseImages.pindasana,
  'Embryo Pose (inverted)': poseImages.pindasana,
  'Scale Pose': poseImages.utpluthih,
  'Fish Pose': poseImages.matsyasana,
  'Extended Leg Pose': poseImages.uttana_padasana,
  'Headstand': poseImages.sirsasana_b,
  'Bound Lotus': poseImages.baddha_padmasana,
  'Yoga Seal': poseImages.yoga_mudra,
  'Lotus Pose': poseImages.padmasana,
  'Sprung Up': poseImages.utpluthih,
};

// Also map by Sanskrit name for duplicates (e.g. two "Half Bound Lotus Forward Fold")
const ASANA_IMAGE_MAP_SANSKRIT: Record<string, ImageSourcePropType> = {
  'Ardha Baddha Padma Paschimottanasana': poseImages.ardha_baddha_padma_paschimottanasana,
};

function findPoseImage(sanskrit: string, english: string): ImageSourcePropType | null {
  return ASANA_IMAGE_MAP[english] ?? ASANA_IMAGE_MAP_SANSKRIT[sanskrit] ?? null;
}

// ── Types ────────────────────────────────────────────────────────────────────

interface Asana {
  sanskrit: string;
  english: string;
  description: string;
  benefits: string;
  drishti: string;
  vinyasaCount: number;
  series: string;
  imageUrl?: string;
}

interface MantraEntry {
  sanskrit: string;
  transliteration: string;
  english: string;
  context: string;
}

interface CountingEntry {
  number: number;
  sanskrit: string;
  pronunciation: string;
}

// ── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: 'asanas', label: 'Asanas', icon: 'body-outline' },
  { key: 'sequences', label: 'Sequences', icon: 'list-outline' },
  { key: 'philosophy', label: 'Philosophy', icon: 'leaf-outline' },
  { key: 'mantras', label: 'Mantras', icon: 'musical-note-outline' },
  { key: 'counting', label: 'Sanskrit Count', icon: 'language-outline' },
  { key: 'breathing', label: 'Pranayama', icon: 'water-outline' },
  { key: 'anatomy', label: 'Anatomy', icon: 'fitness-outline' },
  { key: 'history', label: 'History', icon: 'book-outline' },
];

// ── PRIMARY SERIES ASANAS ────────────────────────────────────────────────────

const PRIMARY_ASANAS: Asana[] = [
  // Sun Salutations
  { sanskrit: 'Surya Namaskara A', english: 'Sun Salutation A', description: 'The foundational warming sequence. 9 vinyasas linking breath to movement through forward fold, plank, upward dog, and downward dog.', benefits: 'Full body warm-up, builds internal heat (tapas), synchronizes breath and movement', drishti: 'Various — nasagrai (nose), angusta ma dyai (thumbs), nabi chakra (navel)', vinyasaCount: 9, series: 'Opening' },
  { sanskrit: 'Surya Namaskara B', english: 'Sun Salutation B', description: 'Extended sun salutation adding Utkatasana (chair pose) and Virabhadrasana A (warrior I). 17 vinyasas building greater heat.', benefits: 'Deeper warming, strengthens legs and shoulders, builds stamina', drishti: 'Various — angusta ma dyai, nasagrai', vinyasaCount: 17, series: 'Opening' },

  // Standing
  { sanskrit: 'Padangusthasana', english: 'Big Toe Pose', description: 'Standing forward fold gripping the big toes with the first two fingers. Head draws toward shins with straight legs.', benefits: 'Stretches hamstrings, calms the mind, stimulates liver and kidneys', drishti: 'Nasagrai (nose tip)', vinyasaCount: 3, series: 'Standing' },
  { sanskrit: 'Padahastasana', english: 'Hand Under Foot Pose', description: 'Hands slide under feet with palms facing up, toes at the wrist creases. Deep forward fold with straight legs.', benefits: 'Intense hamstring stretch, strengthens wrists, improves digestion', drishti: 'Nasagrai (nose tip)', vinyasaCount: 3, series: 'Standing' },
  { sanskrit: 'Utthita Trikonasana', english: 'Extended Triangle', description: 'Wide stance, front foot turned out. Torso extends over the front leg, bottom hand to shin or floor, top arm reaches skyward.', benefits: 'Opens hips and shoulders, strengthens legs, improves balance', drishti: 'Hastagrai (hand)', vinyasaCount: 5, series: 'Standing' },
  { sanskrit: 'Parivrtta Trikonasana', english: 'Revolved Triangle', description: 'Twisted variation — opposite hand reaches to the floor outside the front foot while the other arm extends upward.', benefits: 'Deep spinal twist, improves digestion, strengthens legs', drishti: 'Hastagrai (hand)', vinyasaCount: 5, series: 'Standing' },
  { sanskrit: 'Utthita Parsvakonasana', english: 'Extended Side Angle', description: 'Deep lunge with forearm on front thigh or hand to floor. Top arm extends overhead creating a line from back foot to fingertips.', benefits: 'Opens groins and chest, strengthens legs, builds stamina', drishti: 'Hastagrai (hand)', vinyasaCount: 5, series: 'Standing' },
  { sanskrit: 'Parivrtta Parsvakonasana', english: 'Revolved Side Angle', description: 'Deep lunge with a twist — opposite elbow outside the front knee, hands in prayer or arm extended. Back heel grounded.', benefits: 'Intense spinal twist, strengthens legs, detoxifying', drishti: 'Hastagrai (hand)', vinyasaCount: 5, series: 'Standing' },
  { sanskrit: 'Prasarita Padottanasana A–D', english: 'Wide-Legged Forward Fold', description: 'Four variations of wide-legged forward fold: A (hands on floor), B (hands on waist), C (hands clasped behind), D (big toe grab).', benefits: 'Stretches inner legs, calms mind, strengthens feet and ankles', drishti: 'Nasagrai (nose tip)', vinyasaCount: 5, series: 'Standing' },
  { sanskrit: 'Parsvottanasana', english: 'Intense Side Stretch', description: 'Feet hip-width in a short stance, hands in reverse prayer behind the back. Fold over the front leg.', benefits: 'Stretches hamstrings and shoulders, calms the brain', drishti: 'Padayoragrai (toes)', vinyasaCount: 5, series: 'Standing' },
  { sanskrit: 'Utthita Hasta Padangusthasana', english: 'Hand-to-Big-Toe Pose', description: 'Standing on one leg, catch the big toe of the raised leg. Extend forward, then to the side, then fold the chin to the shin.', benefits: 'Develops balance and concentration, stretches legs', drishti: 'Padayoragrai (toes) / Parsva (side)', vinyasaCount: 14, series: 'Standing' },
  { sanskrit: 'Ardha Baddha Padmottanasana', english: 'Half Bound Lotus Forward Fold', description: 'Standing half lotus with one foot on the opposite thigh. Bind the arm behind the back to catch the foot, then fold forward.', benefits: 'Opens hips, stretches shoulders, improves balance and concentration', drishti: 'Nasagrai (nose tip)', vinyasaCount: 9, series: 'Standing' },
  { sanskrit: 'Utkatasana', english: 'Chair Pose', description: 'Fierce pose — knees deeply bent, arms overhead, spine long. Hold for 5 breaths.', benefits: 'Strengthens ankles, thighs, and spine. Builds heat and determination.', drishti: 'Angusta ma dyai (thumbs)', vinyasaCount: 7, series: 'Standing' },
  { sanskrit: 'Virabhadrasana A & B', english: 'Warrior I & II', description: 'Warrior A: lunge with arms overhead, back foot angled. Warrior B: arms parallel to floor, gaze over front hand.', benefits: 'Builds leg strength, opens hips and chest, cultivates focus', drishti: 'Angusta ma dyai (A) / Hastagrai (B)', vinyasaCount: 7, series: 'Standing' },

  // Primary Seated
  { sanskrit: 'Dandasana', english: 'Staff Pose', description: 'Seated with legs extended, spine erect, hands pressing beside hips. The foundation for all seated postures.', benefits: 'Strengthens back muscles, improves posture, calms the mind', drishti: 'Nasagrai (nose tip)', vinyasaCount: 7, series: 'Primary Seated' },
  { sanskrit: 'Paschimottanasana', english: 'Western Intense Stretch', description: 'Seated forward fold, hands catching feet or beyond. Spine lengthens on inhale, deepens fold on exhale. Three variations (A, B, C).', benefits: 'Stretches entire back body, calms nervous system, massages organs', drishti: 'Padayoragrai (toes)', vinyasaCount: 16, series: 'Primary Seated' },
  { sanskrit: 'Purvottanasana', english: 'Eastern Intense Stretch', description: 'Reverse plank — hands behind, feet press down, hips lift high. Chest opens toward the sky.', benefits: 'Strengthens wrists and arms, opens chest and shoulders, counterpose to forward fold', drishti: 'Broomadhya (third eye)', vinyasaCount: 15, series: 'Primary Seated' },
  { sanskrit: 'Ardha Baddha Padma Paschimottanasana', english: 'Half Bound Lotus Forward Fold', description: 'One leg in half lotus, bind behind the back to catch the foot. Forward fold over the extended leg.', benefits: 'Opens hips, massages abdominal organs, calms the mind', drishti: 'Padayoragrai (toes)', vinyasaCount: 22, series: 'Primary Seated' },
  { sanskrit: 'Triang Mukhaikapada Paschimottanasana', english: 'Three-Limbed Forward Fold', description: 'One leg extended, the other in virasana (hero\'s pose) with foot beside the hip. Forward fold over the extended leg.', benefits: 'Stretches hamstrings and quadriceps, improves digestion', drishti: 'Padayoragrai (toes)', vinyasaCount: 22, series: 'Primary Seated' },
  { sanskrit: 'Janu Sirsasana A, B, C', english: 'Head-to-Knee Pose', description: 'Three variations with the bent knee at different angles. A: knee at 90°, B: sit on heel, C: ball of foot on floor.', benefits: 'Stretches hamstrings, opens hips, calms the mind, stimulates kidneys', drishti: 'Padayoragrai (toes)', vinyasaCount: 22, series: 'Primary Seated' },
  { sanskrit: 'Marichyasana A', english: 'Sage Marichi\'s Pose A', description: 'One knee bent with foot flat, bind the arm around the knee and catch the wrist behind the back. Fold forward.', benefits: 'Massages abdominal organs, stretches shoulders, calms the mind', drishti: 'Padayoragrai (toes)', vinyasaCount: 22, series: 'Primary Seated' },
  { sanskrit: 'Marichyasana B', english: 'Sage Marichi\'s Pose B', description: 'One leg in half lotus, the other bent. Bind around the bent knee. Forward fold.', benefits: 'Deep hip opening, massages organs, builds shoulder flexibility', drishti: 'Nasagrai (nose tip)', vinyasaCount: 22, series: 'Primary Seated' },
  { sanskrit: 'Marichyasana C', english: 'Sage Marichi\'s Twist C', description: 'Seated twist with one knee bent. Opposite arm wraps around the knee with a bind behind the back. Deep spinal rotation.', benefits: 'Detoxifying twist, improves spinal mobility, massages organs', drishti: 'Parsva (far side)', vinyasaCount: 18, series: 'Primary Seated' },
  { sanskrit: 'Marichyasana D', english: 'Sage Marichi\'s Twist D', description: 'The most challenging Marichyasana — half lotus combined with a deep twist and bind. Often considered a "gateway" posture.', benefits: 'Deep hip opening and spinal twist, tests patience and dedication', drishti: 'Parsva (far side)', vinyasaCount: 18, series: 'Primary Seated' },
  { sanskrit: 'Navasana', english: 'Boat Pose', description: 'Balance on the sit bones with legs and torso lifted, arms reaching forward. Hold 5 breaths, repeat 5 times with lift-ups between.', benefits: 'Core strength, hip flexor strength, builds bandha awareness', drishti: 'Padayoragrai (toes)', vinyasaCount: 13, series: 'Primary Seated' },
  { sanskrit: 'Bhujapidasana', english: 'Shoulder Pressing Pose', description: 'Arm balance with legs wrapped around upper arms. Feet cross in front, lower head toward the floor, then jump back.', benefits: 'Arm and core strength, builds confidence in arm balances', drishti: 'Nasagrai (nose tip)', vinyasaCount: 15, series: 'Primary Seated' },
  { sanskrit: 'Kurmasana', english: 'Tortoise Pose', description: 'Seated with legs wide, arms thread under the legs and extend outward. Chest presses toward the floor. Leads into Supta Kurmasana.', benefits: 'Deep hip and shoulder opening, calms the nervous system, introspection', drishti: 'Broomadhya (third eye)', vinyasaCount: 16, series: 'Primary Seated' },
  { sanskrit: 'Supta Kurmasana', english: 'Sleeping Tortoise', description: 'From Kurmasana, feet cross behind the head and hands bind behind the back. A deep pratyahara (withdrawal of senses) posture.', benefits: 'Ultimate forward fold, calms the mind profoundly, builds patience', drishti: 'Broomadhya (third eye)', vinyasaCount: 16, series: 'Primary Seated' },
  { sanskrit: 'Garbha Pindasana', english: 'Embryo in the Womb', description: 'In lotus, thread the arms through the legs, hands to the face. Rock in a circle (9 rolls) representing the months in the womb.', benefits: 'Massages internal organs, hip opening, playful and humbling', drishti: 'Nasagrai (nose tip)', vinyasaCount: 15, series: 'Primary Seated' },
  { sanskrit: 'Kukkutasana', english: 'Rooster Pose', description: 'From Garbha Pindasana, press hands into the floor and lift the entire body. An arm balance in full lotus.', benefits: 'Arm and core strength, builds confidence', drishti: 'Nasagrai (nose tip)', vinyasaCount: 15, series: 'Primary Seated' },
  { sanskrit: 'Baddha Konasana', english: 'Bound Angle Pose', description: 'Soles of feet together, knees wide. Two variations: A (fold chin to floor) and B (fold forehead to feet, round the back).', benefits: 'Opens inner thighs and groins, stimulates reproductive organs, calms mind', drishti: 'Nasagrai (nose tip)', vinyasaCount: 15, series: 'Primary Seated' },
  { sanskrit: 'Upavishtha Konasana', english: 'Seated Wide Angle', description: 'Legs wide apart, fold forward with chin to the floor (A), then balance lifting legs and gazing upward (B).', benefits: 'Stretches inner legs and hamstrings, strengthens spine', drishti: 'Broomadhya (third eye) / Urdhva (upward)', vinyasaCount: 15, series: 'Primary Seated' },
  { sanskrit: 'Supta Konasana', english: 'Reclining Angle Pose', description: 'Roll back with legs overhead in wide angle, catch the toes. Roll up to balance briefly.', benefits: 'Stretches hamstrings, strengthens core, develops proprioception', drishti: 'Broomadhya (third eye)', vinyasaCount: 15, series: 'Primary Seated' },
  { sanskrit: 'Supta Padangusthasana', english: 'Reclining Hand-to-Big-Toe', description: 'Lying down, catch the big toe of the raised leg. Extend forward, then to the side. Three variations.', benefits: 'Stretches hamstrings and hips, calms the brain, relieves backache', drishti: 'Padayoragrai (toes) / Parsva (side)', vinyasaCount: 26, series: 'Primary Seated' },
  { sanskrit: 'Ubhaya Padangusthasana', english: 'Both Big Toes Pose', description: 'Roll up from lying to balance on sit bones, catching both big toes with legs extended.', benefits: 'Core strength, balance, stretches hamstrings', drishti: 'Padayoragrai (toes)', vinyasaCount: 15, series: 'Primary Seated' },
  { sanskrit: 'Urdhva Mukha Paschimottanasana', english: 'Upward Facing Forward Fold', description: 'From rolling up, hold the soles of the feet and balance with legs close to the face.', benefits: 'Core and hip flexor strength, deep hamstring stretch', drishti: 'Padayoragrai (toes)', vinyasaCount: 16, series: 'Primary Seated' },
  { sanskrit: 'Setu Bandhasana', english: 'Bridge Pose', description: 'From lying, cross arms over chest, press feet and crown of head into floor, lift hips high. An often-skipped posture.', benefits: 'Strengthens neck and legs, opens chest, prepares for backbends', drishti: 'Nasagrai (nose tip)', vinyasaCount: 15, series: 'Primary Seated' },

  // Finishing
  { sanskrit: 'Urdhva Dhanurasana', english: 'Upward Bow / Wheel', description: 'Full backbend — press up from lying, arms and legs straight. Typically done 3 times for 5 breaths. In some traditions, followed by drop-backs.', benefits: 'Opens entire front body, strengthens arms and legs, energizing', drishti: 'Nasagrai (nose tip)', vinyasaCount: 15, series: 'Finishing' },
  { sanskrit: 'Paschimottanasana', english: 'Seated Forward Fold (closing)', description: 'Counter-pose after backbends. 10 breaths minimum. Allow the spine to release and the nervous system to calm.', benefits: 'Counter-pose to backbends, calms the nervous system', drishti: 'Padayoragrai (toes)', vinyasaCount: 15, series: 'Finishing' },
  { sanskrit: 'Salamba Sarvangasana', english: 'Shoulderstand', description: 'Supported shoulderstand held for 25 breaths. The "queen of asanas." Chin locks into the chest (jalandhara bandha).', benefits: 'Calms the nervous system, regulates thyroid, reverses blood flow', drishti: 'Nasagrai (nose tip)', vinyasaCount: 13, series: 'Finishing' },
  { sanskrit: 'Halasana', english: 'Plow Pose', description: 'From shoulderstand, lower the feet overhead to the floor behind. Toes touch down, legs straight. Hold for 8 breaths.', benefits: 'Stretches the spine, calms the brain, stimulates thyroid', drishti: 'Nasagrai (nose tip)', vinyasaCount: 13, series: 'Finishing' },
  { sanskrit: 'Karnapidasana', english: 'Ear Pressure Pose', description: 'From Halasana, bend the knees to the floor beside the ears. Knees press against the ears creating pratyahara.', benefits: 'Withdrawal of senses, deep spinal stretch, calming', drishti: 'Nasagrai (nose tip)', vinyasaCount: 13, series: 'Finishing' },
  { sanskrit: 'Urdhva Padmasana', english: 'Upward Lotus', description: 'From shoulderstand, take lotus with the legs and hold. Hands may support the knees.', benefits: 'Balance in inversion, hip opening, concentration', drishti: 'Nasagrai (nose tip)', vinyasaCount: 13, series: 'Finishing' },
  { sanskrit: 'Pindasana', english: 'Embryo Pose (inverted)', description: 'From Urdhva Padmasana, fold the lotus toward the face. Hands wrap around the legs.', benefits: 'Deep folding, massages organs, pratyahara', drishti: 'Nasagrai (nose tip)', vinyasaCount: 13, series: 'Finishing' },
  { sanskrit: 'Matsyasana', english: 'Fish Pose', description: 'In lotus, lie back and arch the spine, crown of head resting on the floor. Opens the chest as a counter to shoulderstand.', benefits: 'Opens chest and throat, counter-pose to shoulderstand', drishti: 'Broomadhya (third eye)', vinyasaCount: 13, series: 'Finishing' },
  { sanskrit: 'Uttana Padasana', english: 'Extended Leg Pose', description: 'From lying, legs and arms lift at 45 degrees, palms together. An intense core hold.', benefits: 'Core strength, builds fire, strengthens hip flexors', drishti: 'Broomadhya (third eye)', vinyasaCount: 13, series: 'Finishing' },
  { sanskrit: 'Sirsasana', english: 'Headstand', description: 'The "king of asanas." Forearm balance on the crown of the head. Hold for 25 breaths. The foundation is in the forearms.', benefits: 'Reverses blood flow, builds focus, strengthens core and shoulders', drishti: 'Nasagrai (nose tip)', vinyasaCount: 13, series: 'Finishing' },
  { sanskrit: 'Baddha Padmasana', english: 'Bound Lotus', description: 'Seated lotus with arms crossed behind, each hand catching the opposite foot. Fold forward.', benefits: 'Opens shoulders, stretches ankles, calms the mind', drishti: 'Nasagrai (nose tip)', vinyasaCount: 8, series: 'Finishing' },
  { sanskrit: 'Padmasana', english: 'Lotus Pose', description: 'The classical meditation posture. Sit for 10 breaths with hands in chin mudra after the final forward fold.', benefits: 'Calms the mind, prepares for meditation, opens hips', drishti: 'Nasagrai (nose tip)', vinyasaCount: 8, series: 'Finishing' },
  { sanskrit: 'Utpluthih', english: 'Sprung Up', description: 'In lotus, press hands into the floor and lift the entire body off the ground. Hold for 10–25 breaths. The final posture of the practice — a test of strength, bandhas, and determination.', benefits: 'Arm and core strength, builds bandha awareness, concentration', drishti: 'Nasagrai (nose tip)', vinyasaCount: 8, series: 'Finishing' },
];

// ── INTERMEDIATE SERIES (NADI SHODHANA) ASANAS ───────────────────────────────

const INTERMEDIATE_ASANAS: Asana[] = [
  // Pashasana Group
  { sanskrit: 'Pashasana', english: 'Noose Pose', description: 'The first posture of Nadi Shodhana. A deep squat with a full spinal twist, arms binding behind the back. The heels must press flat on the floor — this alone can take years.', benefits: 'Opens shoulders, deep spinal twist, improves digestion', drishti: 'Parsva (far side)', vinyasaCount: 16, series: 'Pashasana Group' },
  { sanskrit: 'Krounchasana', english: 'Heron Pose', description: 'One leg in virasana (hero\'s pose), the other extended vertically. Fold the chest toward the extended leg, drawing it toward the face. Demands intense hamstring flexibility.', benefits: 'Stretches hamstrings and hip flexors, massages abdominal organs', drishti: 'Padayoragrai (toes)', vinyasaCount: 22, series: 'Pashasana Group' },

  // Backbend Series
  { sanskrit: 'Shalabhasana A & B', english: 'Locust Pose', description: 'Lying face down, lift the chest and legs simultaneously. A: legs together, arms beside the body. B: arms extended forward. Foundational backbend for strengthening the posterior chain.', benefits: 'Strengthens entire back body, opens chest, prepares spine for deeper backbends', drishti: 'Broomadhya (third eye)', vinyasaCount: 14, series: 'Backbend Series' },
  { sanskrit: 'Bhekasana', english: 'Frog Pose', description: 'Lying prone, bend both knees and catch the tops of the feet. Press the feet toward the floor beside the hips while lifting the chest. A deep quad and hip flexor opener.', benefits: 'Stretches quadriceps and hip flexors, opens the chest', drishti: 'Broomadhya (third eye)', vinyasaCount: 14, series: 'Backbend Series' },
  { sanskrit: 'Dhanurasana', english: 'Bow Pose', description: 'Lying face down, bend both knees and catch the ankles from the outside. Press feet into hands to lift chest and thighs off the floor simultaneously. The body forms a bow shape.', benefits: 'Full spinal extension, opens chest and shoulders, energizing', drishti: 'Broomadhya (third eye)', vinyasaCount: 14, series: 'Backbend Series' },
  { sanskrit: 'Parsva Dhanurasana', english: 'Side Bow Pose', description: 'From Dhanurasana, roll onto one side maintaining the full bow grip. Balance on the side of the thigh and chest. Then roll to the other side. Tests strength and body control.', benefits: 'Lateral body stretch, massages abdominal organs, builds coordination', drishti: 'Parsva (side)', vinyasaCount: 14, series: 'Backbend Series' },
  { sanskrit: 'Ustrasana', english: 'Camel Pose', description: 'Kneeling upright, reach back one hand at a time to catch the heels. Chest lifts high, neck relaxes back. A heart-opening kneeling backbend that prepares for Kapotasana.', benefits: 'Opens the entire front body, strengthens back muscles, energizes', drishti: 'Broomadhya (third eye)', vinyasaCount: 14, series: 'Backbend Series' },
  { sanskrit: 'Laghu Vajrasana', english: 'Little Thunderbolt', description: 'Kneeling, walk the hands back to the floor creating a deep spinal arc. The crown of the head rests on the feet. One of the most challenging preparatory poses for Kapotasana.', benefits: 'Deep spinal backbend, strengthens thighs, opens chest', drishti: 'Broomadhya (third eye)', vinyasaCount: 14, series: 'Backbend Series' },
  { sanskrit: 'Kapotasana A & B', english: 'Pigeon Pose (Full)', description: 'The "king" of second series. From kneeling, drop into a deep backbend with hands catching the feet. B: fingers touch the toes. The full expression takes years to develop. Often called the "gateway" of the second series.', benefits: 'Maximum spinal extension, deep hip flexor opening, emotional release', drishti: 'Nasagrai (nose tip)', vinyasaCount: 14, series: 'Backbend Series' },

  // Leg Behind Head Prep
  { sanskrit: 'Supta Vajrasana', english: 'Reclining Thunderbolt', description: 'From lotus pose, recline back over a bolster or the floor with assistance. The teacher helps lower the head to the floor. A deep counterpose to the intense backbend series.', benefits: 'Counter-pose after backbends, opens the chest, releases the lower back', drishti: 'Broomadhya (third eye)', vinyasaCount: 13, series: 'Leg Behind Head Prep' },
  { sanskrit: 'Bakasana A & B', english: 'Crane / Crow Pose', description: 'A: Jump into crow balance with knees on the backs of the upper arms. B: Jump directly from standing to Bakasana. Tests arm strength, bandha engagement, and fearlessness in arm balancing.', benefits: 'Core and arm strength, develops bandha control, builds courage', drishti: 'Nasagrai (nose tip)', vinyasaCount: 14, series: 'Leg Behind Head Prep' },
  { sanskrit: 'Bharadvajasana', english: "Bharadvaja's Twist", description: 'A seated twist where one leg is in virasana, one in half lotus. The hands bind in opposite directions. Named after the sage Bharadvaja. One of the most elegant seated twists.', benefits: 'Spinal rotation, releases neck and shoulders, improves digestion', drishti: 'Parsva (far side)', vinyasaCount: 16, series: 'Leg Behind Head Prep' },
  { sanskrit: 'Ardha Matsyendrasana', english: 'Half Lord of the Fishes', description: 'One foot outside the opposite hip, the other in half lotus. A deep twist with one arm binding around the knee. Named after the yogi Matsyendra, said to have learned yoga from Shiva himself.', benefits: 'Deep spinal twist, massages kidneys and liver, stimulates digestion', drishti: 'Parsva (far side)', vinyasaCount: 16, series: 'Leg Behind Head Prep' },

  // Leg Behind Head
  { sanskrit: 'Eka Pada Sirsasana', english: 'One Leg Behind Head', description: 'Seated, lift one leg and place it behind the neck/head. Stay upright with the foot secured. Requires extreme hip and hamstring flexibility — often years of preparation.', benefits: 'Ultimate hip opener, calms the nervous system, builds patience', drishti: 'Nasagrai (nose tip)', vinyasaCount: 16, series: 'Leg Behind Head' },
  { sanskrit: 'Dvipada Sirsasana', english: 'Two Legs Behind Head', description: 'Both legs placed behind the neck simultaneously. The practitioner reclines back, then lifts into a balance with arms straight. One of the most extreme flexibility postures in the practice.', benefits: 'Profound hip opening, strengthens core and arms, meditative depth', drishti: 'Nasagrai (nose tip)', vinyasaCount: 14, series: 'Leg Behind Head' },
  { sanskrit: 'Yoganidrasana', english: 'Yoga Sleep Pose', description: 'Lying on the back, both legs behind the head with feet crossed at the ankles. Hands press into the floor or clasp behind the back. The body is completely folded upon itself.', benefits: 'Complete hip and spinal release, pratyahara, profound stillness', drishti: 'Nasagrai (nose tip)', vinyasaCount: 14, series: 'Leg Behind Head' },

  // Arm Balance Series
  { sanskrit: 'Tittibhasana A–D', english: 'Firefly Pose', description: 'A: Low arm balance with legs extended forward through the arms. B: Walk forward in the balance. C: Squat and bind. D: Stand and bind. A demanding sequence requiring both hip flexibility and arm strength.', benefits: 'Core and arm strength, hip opening, coordination', drishti: 'Nasagrai (nose tip)', vinyasaCount: 14, series: 'Arm Balance Series' },
  { sanskrit: 'Pincha Mayurasana', english: 'Feathered Peacock (Forearm Balance)', description: 'Forearm balance with straight body. The "gateway" inversion of the second series. Builds toward Karandavasana. Requires shoulder stability, core strength, and comfort upside down.', benefits: 'Shoulder and core strength, reverses blood flow, develops focus', drishti: 'Nasagrai (nose tip)', vinyasaCount: 14, series: 'Arm Balance Series' },
  { sanskrit: 'Karandavasana', english: 'Duck Pose (Lotus in Forearm Balance)', description: 'From Pincha Mayurasana, take lotus and lower to the upper arms, then press back up. Considered one of the hardest postures in the practice — the combination of strength and control required is extreme.', benefits: 'Peak arm strength, bandha mastery, mental focus', drishti: 'Nasagrai (nose tip)', vinyasaCount: 14, series: 'Arm Balance Series' },
  { sanskrit: 'Mayurasana', english: 'Peacock Pose', description: 'Balance horizontally on both hands placed at the sternum, elbows pressing into the abdomen. The entire body lifts parallel to the floor. An ancient posture demanding core, arm, and digestive strength.', benefits: 'Core and arm strength, stimulates digestive fire, detoxifying', drishti: 'Nasagrai (nose tip)', vinyasaCount: 14, series: 'Arm Balance Series' },
  { sanskrit: 'Nakrasana', english: 'Crocodile Pose', description: 'From plank, hop the entire body forward and back five times, then side to side. A dynamic jumping sequence that tests explosive bandha strength and breath control.', benefits: 'Explosive core and arm strength, bandha awareness, full body coordination', drishti: 'Nasagrai (nose tip)', vinyasaCount: 14, series: 'Arm Balance Series' },

  // Hip Openers & Twists
  { sanskrit: 'Vatayanasana', english: 'Horse Face Pose', description: 'Standing balance in half lotus with one leg bent at a right angle. One of the few standing postures in the second series. Demands hip flexibility and balance simultaneously.', benefits: 'Hip opening in standing balance, develops equanimity', drishti: 'Nasagrai (nose tip)', vinyasaCount: 14, series: 'Hip Openers' },
  { sanskrit: 'Parighasana', english: 'Gate Pose', description: 'One leg extended to the side, the other bent with heel at the groin. Side stretch over the extended leg with arms reaching overhead. A refreshing lateral opening.', benefits: 'Lateral body stretch, opens the intercostals, improves lung capacity', drishti: 'Hastagrai (hand)', vinyasaCount: 14, series: 'Hip Openers' },
  { sanskrit: 'Gomukhasana A & B', english: 'Cow Face Pose', description: 'Legs stacked in the classic gomukha shape. A: Fold forward over the legs with hands clasped behind. B: Upright with arms in the gomukha arm bind (one arm over shoulder, one under). Tests hip stacking and shoulder flexibility.', benefits: 'Deep hip rotation, shoulder opening, calms the mind', drishti: 'Nasagrai (nose tip)', vinyasaCount: 14, series: 'Hip Openers' },

  // Advanced Inversions
  { sanskrit: 'Supta Urdhva Pada Vajrasana', english: 'Reclining Upward Leg Thunderbolt', description: 'From shoulderstand, take a complex leg position involving lotus and extension. A transition posture requiring precise control of the lotus legs while inverted.', benefits: 'Inversion with hip opening, develops balance and concentration', drishti: 'Nasagrai (nose tip)', vinyasaCount: 13, series: 'Advanced Inversions' },
  { sanskrit: 'Mukta Hasta Sirsasana A–C', english: 'Free Hands Headstand Variations', description: 'Three headstand variations without the forearm support: A: hands on the floor beside the head, B: hands on floor in front, C: arms crossed behind the back. Demands complete neck and core control.', benefits: 'Pure neck and core strength, ultimate head and crown activation', drishti: 'Nasagrai (nose tip)', vinyasaCount: 13, series: 'Advanced Inversions' },
  { sanskrit: 'Baddha Hasta Sirsasana A–D', english: 'Bound Hands Headstand Variations', description: 'Four headstand variations with different arm binds: A: forearms on floor, B: hands clasped, C: hands on floor beside the head, D: arms wrapped. The complete headstand curriculum of the second series.', benefits: 'Comprehensive inversion practice, builds total stability upside down', drishti: 'Nasagrai (nose tip)', vinyasaCount: 13, series: 'Advanced Inversions' },
];

// ── SEQUENCES ────────────────────────────────────────────────────────────────

const SEQUENCES = [
  {
    title: 'Primary Series (Yoga Chikitsa)',
    subtitle: 'Yoga Therapy — Detoxification & Alignment',
    description: 'The first series purifies and aligns the body. It consists of forward folds, twists, and hip openers that build a strong foundation. "Chikitsa" means therapy — this series heals the physical body.',
    asanaCount: 41,
    duration: '75–90 min',
    focus: 'Forward folds, hip openers, twists, foundational strength',
  },
  {
    title: 'Intermediate Series (Nadi Shodhana)',
    subtitle: 'Nerve Cleansing — Backbends & Strength',
    description: 'The second series purifies the nervous system through deep backbends, leg-behind-head postures, and arm balances. "Nadi Shodhana" means nerve cleansing.',
    asanaCount: 40,
    duration: '90–120 min',
    focus: 'Deep backbends, arm balances, leg-behind-head, nerve purification',
  },
  {
    title: 'Advanced A (Sthira Bhaga)',
    subtitle: 'Divine Stability — Arm Balances',
    description: 'The third series demands exceptional strength and flexibility. Features complex arm balances, deep backbends, and challenging transitions. Only attempted after mastering Intermediate.',
    asanaCount: 36,
    duration: '120+ min',
    focus: 'Advanced arm balances, extreme flexibility, mental fortitude',
  },
  {
    title: 'Advanced B (Sthira Bhaga)',
    subtitle: 'Divine Stability — Culmination',
    description: 'The fourth series is practiced by very few. It combines the most demanding postures requiring complete mastery of body, breath, and mind.',
    asanaCount: 38,
    duration: '120+ min',
    focus: 'Peak difficulty, complete integration of practice',
  },
];

// ── PHILOSOPHY ───────────────────────────────────────────────────────────────

const PHILOSOPHY = [
  {
    title: 'The Eight Limbs of Yoga',
    subtitle: 'Patanjali\'s Ashtanga',
    content: 'Ashtanga literally means "eight limbs" (ashta = eight, anga = limb). Patanjali outlined them in the Yoga Sutras: 1. Yama (ethical restraints), 2. Niyama (observances), 3. Asana (posture), 4. Pranayama (breath control), 5. Pratyahara (sense withdrawal), 6. Dharana (concentration), 7. Dhyana (meditation), 8. Samadhi (absorption). The physical practice (asana) is just one limb.',
  },
  {
    title: 'Tristhana',
    subtitle: 'The Three Places of Attention',
    content: 'Tristhana refers to the three pillars of Ashtanga practice: Posture (asana), Breathing system (ujjayi pranayama with bandhas), and Gazing point (drishti). When all three are aligned, meditation in motion arises naturally. Each asana has a specific drishti, and the breath should be steady and audible throughout.',
  },
  {
    title: 'Vinyasa',
    subtitle: 'Breath-Movement System',
    content: 'Vinyasa means "to place in a special way." Each movement in Ashtanga is linked to either an inhale or an exhale. This creates an internal heat (tapas) that purifies the blood and organs. The vinyasa count for each posture is precisely defined — there is a specific number of movements to enter, hold, and exit every asana.',
  },
  {
    title: 'Bandhas',
    subtitle: 'Energy Locks',
    content: 'Three bandhas are essential: Mula Bandha (root lock — pelvic floor engagement), Uddiyana Bandha (upward flying lock — lower belly drawn in and up), and Jalandhara Bandha (chin lock — used in specific postures like shoulderstand). Bandhas direct prana (life force) upward and create lightness in the body.',
  },
  {
    title: 'Parampara',
    subtitle: 'The Teacher-Student Lineage',
    content: 'Parampara is the unbroken chain of knowledge passed from teacher to student. In Ashtanga: Krishnamacharya taught Pattabhi Jois, who taught Sharath Jois, R. Sharath Jois now leads the tradition. The method is traditionally taught one-on-one in a Mysore-style setting, where each student receives personal attention and progresses at their own pace.',
  },
  {
    title: 'The Yoga Sutras',
    subtitle: 'Patanjali\'s Guide to Liberation',
    content: 'Written approximately 2,000 years ago, the 196 sutras are divided into four chapters: Samadhi Pada (contemplation), Sadhana Pada (practice), Vibhuti Pada (powers), and Kaivalya Pada (liberation). The second sutra defines yoga: "Yogas chitta vritti nirodha" — Yoga is the cessation of the fluctuations of the mind.',
  },
  {
    title: 'Moon Days',
    subtitle: 'Honoring Natural Rhythms',
    content: 'Ashtanga practitioners traditionally rest on full and new moon days. The moon\'s gravitational pull affects our bodies (we are 70% water). Full moon energy is expansive (risk of over-extension), new moon energy is contractive (lower energy). Observing moon days connects us to natural cycles and teaches restraint.',
  },
  {
    title: 'Mysore Style',
    subtitle: 'The Traditional Teaching Method',
    content: 'Named after the city in India where Pattabhi Jois taught, Mysore style is self-paced practice in a group setting. The teacher gives individual adjustments and teaches new postures one at a time when the student is ready. Students memorize the sequence and practice at their own rhythm, cultivating self-discipline and inner awareness.',
  },
  {
    title: 'Drishti',
    subtitle: 'The Nine Gazing Points',
    content: 'Nine drishtis are used throughout practice: Nasagrai (nose tip), Broomadhya (third eye), Nabi chakra (navel), Hastagrai (hand), Padayoragrai (toes), Parsva drishti (far right/left), Angusta ma dyai (thumbs), Urdhva drishti (upward). The gaze steadies the mind and directs prana. Where the eyes go, the mind follows.',
  },
];

// ── MANTRAS ──────────────────────────────────────────────────────────────────

const MANTRAS: MantraEntry[] = [
  {
    sanskrit: 'ॐ\nवन्दे गुरूणां चरणारविन्दे\nसन्दर्शितस्वात्मसुखावबोधे\nनिःश्रेयसे जाङ्गलिकायमाने\nसंसार हालाहल मोहशान्त्यै',
    transliteration: 'Oṃ\nVande gurūṇāṃ caraṇāravinde\nSandarśita svātma sukhāvabodhe\nNiḥśreyase jāṅgalikāyamāne\nSaṃsāra hālāhala mohaśāntyai',
    english: 'I bow to the lotus feet of the gurus,\nWho awaken insight into the happiness of pure being,\nWho are the jungle physicians,\nPacifying delusion, the poison of saṃsāra.',
    context: 'Opening Mantra — chanted at the beginning of practice. It honors the lineage of teachers and sets the intention for practice.',
  },
  {
    sanskrit: 'आबाहु पुरुषाकारं\nशङ्खचक्रासि धारिणम्\nसहस्र शिरसं श्वेतं\nप्रणमामि पतञ्जलिम्',
    transliteration: 'Ābāhu puruṣākāraṃ\nŚaṅkhacakrāsi dhāriṇam\nSahasra śirasaṃ śvetaṃ\nPraṇamāmi patañjalim',
    english: 'Who has the form of a man up to the shoulders,\nHolding a conch, a disc, and a sword,\nWhite with a thousand heads,\nI bow to Patanjali.',
    context: 'Second part of the Opening Mantra — honors Patanjali, the sage who codified the Yoga Sutras.',
  },
  {
    sanskrit: 'ॐ\nस्वस्ति प्रजाभ्यः परिपालयन्तां\nन्यायेन मार्गेण महीं महीशाः\nगो ब्राह्मणेभ्यः शुभमस्तु नित्यं\nलोकाः समस्ताः सुखिनो भवन्तु',
    transliteration: 'Oṃ\nSvasti prajābhyaḥ paripālayantāṃ\nNyāyena mārgeṇa mahīṃ mahīśāḥ\nGo brāhmaṇebhyaḥ śubhamastu nityaṃ\nLokāḥ samastāḥ sukhino bhavantu',
    english: 'May all beings be governed with justice,\nMay the leaders protect the earth,\nMay there always be auspiciousness for all,\nMay all the worlds be happy.',
    context: 'Closing Mantra (Mangala Mantra) — chanted at the end of practice. A prayer for universal well-being.',
  },
];

// ── SANSKRIT COUNTING ────────────────────────────────────────────────────────

const COUNTING: CountingEntry[] = [
  { number: 1, sanskrit: 'Ekam', pronunciation: 'EH-kum' },
  { number: 2, sanskrit: 'Dve', pronunciation: 'DVAY' },
  { number: 3, sanskrit: 'Trini', pronunciation: 'TREE-nee' },
  { number: 4, sanskrit: 'Chatvari', pronunciation: 'chut-VAH-ree' },
  { number: 5, sanskrit: 'Pancha', pronunciation: 'PUN-cha' },
  { number: 6, sanskrit: 'Shat', pronunciation: 'SHUT' },
  { number: 7, sanskrit: 'Sapta', pronunciation: 'SUP-tah' },
  { number: 8, sanskrit: 'Ashtau', pronunciation: 'ush-TOW' },
  { number: 9, sanskrit: 'Nava', pronunciation: 'NUH-vah' },
  { number: 10, sanskrit: 'Dasha', pronunciation: 'DUH-sha' },
  { number: 11, sanskrit: 'Ekadasha', pronunciation: 'EH-kah-duh-sha' },
  { number: 12, sanskrit: 'Dvadasha', pronunciation: 'DVAH-duh-sha' },
  { number: 13, sanskrit: 'Trayodasha', pronunciation: 'TRY-oh-duh-sha' },
  { number: 14, sanskrit: 'Chaturdasha', pronunciation: 'chuh-TOOR-duh-sha' },
  { number: 15, sanskrit: 'Panchadasha', pronunciation: 'PUN-chuh-duh-sha' },
  { number: 16, sanskrit: 'Shodasha', pronunciation: 'SHOW-duh-sha' },
  { number: 17, sanskrit: 'Saptadasha', pronunciation: 'SUP-tuh-duh-sha' },
  { number: 18, sanskrit: 'Ashtadasha', pronunciation: 'ush-TUH-duh-sha' },
  { number: 19, sanskrit: 'Ekonavimshatih', pronunciation: 'EH-koh-nah-vim-SHAH-tee' },
  { number: 20, sanskrit: 'Vimshatih', pronunciation: 'vim-SHAH-tee' },
  { number: 25, sanskrit: 'Panchavimshatih', pronunciation: 'PUN-chuh-vim-SHAH-tee' },
  { number: 30, sanskrit: 'Trimshat', pronunciation: 'TRIM-shut' },
];

// ── PRANAYAMA ────────────────────────────────────────────────────────────────

const PRANAYAMA = [
  {
    title: 'Ujjayi Pranayama',
    subtitle: 'Victorious Breath',
    description: 'The primary breathing technique used throughout Ashtanga practice. Slight constriction at the back of the throat creates an audible, oceanic sound. Breath is always through the nose, and the sound helps maintain focus and rhythm.',
    howTo: 'Inhale and exhale through the nose. Slightly constrict the glottis (back of the throat) to create a soft hissing or oceanic sound. Keep the breath smooth, long, and even. The inhale and exhale should be equal in length.',
  },
  {
    title: 'Nadi Shodhana',
    subtitle: 'Alternate Nostril Breathing',
    description: 'A purifying pranayama that balances the left (ida) and right (pingala) energy channels. Traditionally practiced after asana, before meditation.',
    howTo: 'Close the right nostril with the right thumb. Inhale through the left nostril. Close the left nostril with the ring finger, release the right. Exhale through the right. Inhale through the right. Close the right, exhale through the left. This is one round.',
  },
  {
    title: 'Kapalabhati',
    subtitle: 'Skull Shining Breath',
    description: 'A kriya (cleansing technique) that purifies the nasal passages and energizes the mind. Quick, forceful exhales with passive inhales.',
    howTo: 'Sit tall. Exhale sharply through the nose by contracting the lower belly. The inhale happens naturally as the belly releases. Start with 30 pumps, rest, then repeat 2-3 rounds. Speed increases with practice.',
  },
  {
    title: 'Kumbhaka',
    subtitle: 'Breath Retention',
    description: 'The practice of holding the breath after inhale (antara kumbhaka) or after exhale (bahya kumbhaka). Advanced pranayama traditionally taught only by a teacher.',
    howTo: 'Only practice under guidance of a qualified teacher. Begin with short retentions after inhale. Never force or strain. Mula bandha and uddiyana bandha are engaged during retention.',
  },
];

// ── ANATOMY ──────────────────────────────────────────────────────────────────

const ANATOMY = [
  {
    title: 'Bandhas — The Energy Locks',
    content: 'Mula Bandha: Engagement of the pelvic floor muscles. Imagine drawing the perineum upward. Active throughout practice. Provides stability and lightness.\n\nUddiyana Bandha: Drawing the lower belly gently in and up, below the navel. Creates core support and internal heat. Should be maintained even through deep breathing.\n\nJalandhara Bandha: Chin lock — lowering the chin to the sternum. Primarily used during pranayama, shoulderstand, and specific postures.',
  },
  {
    title: 'The Spine in Practice',
    content: 'The spine has four curves: cervical (neck), thoracic (mid-back), lumbar (lower back), sacral (base). Forward folds lengthen the posterior chain. Backbends open the front body and compress the back. Twists create rotational mobility between vertebrae. A healthy practice addresses all directions of spinal movement every session.',
  },
  {
    title: 'Hip Anatomy for Yogis',
    content: 'The hip is a ball-and-socket joint with incredible range of motion. External rotation is needed for lotus and bound postures. Internal rotation features in warrior poses. Hip flexion drives forward folds, extension drives backbends. Tight hip flexors (from sitting) are the modern practitioner\'s main challenge. Patient, consistent practice gradually opens the hips safely.',
  },
  {
    title: 'The Shoulder Complex',
    content: 'The shoulder involves the scapula, clavicle, and humerus working together. Binds require internal rotation and extension. Arm balances demand stability and strength in external rotation. Chaturanga requires proper scapular stabilization to protect the rotator cuff. Protraction and retraction of the scapulae should be understood for safe practice.',
  },
  {
    title: 'Understanding Fascia',
    content: 'Fascia is the connective tissue web that runs throughout the entire body. The "back body line" runs from the soles of the feet, up the back of the legs, along the spine, over the skull. This is why Paschimottanasana (western stretch) targets the entire posterior chain. Consistent practice hydrates and reorganizes fascial tissue over time.',
  },
];

// ── HISTORY ──────────────────────────────────────────────────────────────────

const HISTORY = [
  {
    title: 'T. Krishnamacharya (1888–1989)',
    subtitle: 'The Father of Modern Yoga',
    content: 'Born in Mysore, India, Krishnamacharya studied yoga for 7 years in a cave in Tibet with his guru Ramamohan Brahmachari. He later taught at the Mysore Palace under the patronage of the Maharaja. He developed the vinyasa system that would become Ashtanga. His students include Pattabhi Jois, B.K.S. Iyengar, Indra Devi, and his son T.K.V. Desikachar.',
  },
  {
    title: 'Sri K. Pattabhi Jois (1915–2009)',
    subtitle: 'Guruji — The Keeper of the Tradition',
    content: 'Pattabhi Jois began studying with Krishnamacharya at age 12 in 1927. He founded the Ashtanga Yoga Research Institute (KPJAYI) in Mysore in 1948. For decades he taught from a small room in his home, and the practice spread worldwide when Western students began arriving in the 1970s. He taught until his passing at age 93, maintaining that the practice never changes.',
  },
  {
    title: 'R. Sharath Jois (1971–present)',
    subtitle: 'Current Lineage Holder',
    content: 'Sharath began practicing at age 7 under his grandfather Pattabhi Jois. He became the assistant teacher in 1989 and gradually took over the main teaching role. After Guruji\'s passing in 2009, Sharath became the director of KPJAYI (now Sharath Yoga Centre). He is known for his dedication to preserving the traditional method.',
  },
  {
    title: 'The Yoga Korunta',
    subtitle: 'The Ancient Text',
    content: 'Krishnamacharya reportedly discovered an ancient manuscript called the Yoga Korunta by the sage Vamana Rishi, written on palm leaves. This text supposedly described the vinyasa system, grouping asanas into sequences. The original manuscript was said to have been eaten by ants. Whether the Korunta existed as described remains debated among scholars.',
  },
  {
    title: 'Ashtanga Goes West',
    subtitle: 'The 1970s Revolution',
    content: 'In 1973, Norman Allen became the first Westerner to complete the full Ashtanga system in Mysore. David Williams and Nancy Gilgoff followed. They brought the practice to the United States, opening the first Ashtanga studios in Maui and later Encinitas, California. Through the 1990s, Ashtanga\'s popularity exploded, with students making annual pilgrimages to Mysore.',
  },
  {
    title: 'The Mysore Tradition Today',
    subtitle: 'Global Practice, Local Roots',
    content: 'Today, thousands of authorized and certified teachers worldwide carry the Ashtanga tradition forward. The annual trip to Mysore remains a rite of passage. Shalas from Berlin to Bali to Tokyo maintain the 4:30 AM start time. The practice continues to evolve while honoring its roots — an unbroken lineage spanning nearly a century.',
  },
];

// ── Pose Figure (stick-figure avatar) ───────────────────────────────────────
// One example pose: "Arms Raised" — the inhale moment of Surya Namaskara A.
// Using pure React Native Views (no SVG library needed).

function PoseFigure() {
  const c = colors.sage;
  return (
    <View style={pf.container}>
      {/* Head */}
      <View style={[pf.circle, { top: 3, left: 18 }]} />
      {/* Spine */}
      <View style={[pf.line, { top: 11, left: 21, width: 2, height: 15 }]} />
      {/* Left arm raised — angled up-left */}
      <View style={[pf.line, { top: 13, left: 12, width: 10, height: 2, transform: [{ rotate: '-40deg' }] }]} />
      {/* Right arm raised — angled up-right */}
      <View style={[pf.line, { top: 13, left: 22, width: 10, height: 2, transform: [{ rotate: '40deg' }] }]} />
      {/* Left leg */}
      <View style={[pf.line, { top: 25, left: 16, width: 2, height: 14, transform: [{ rotate: '-8deg' }] }]} />
      {/* Right leg */}
      <View style={[pf.line, { top: 25, left: 26, width: 2, height: 14, transform: [{ rotate: '8deg' }] }]} />
    </View>
  );
}

const pf = StyleSheet.create({
  container: {
    width: 44, height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(126,200,164,0.14)',
    marginRight: spacing.sm,
    overflow: 'visible',
  },
  circle: {
    position: 'absolute',
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.sage,
  },
  line: {
    position: 'absolute',
    backgroundColor: colors.sage,
    borderRadius: 1,
  },
});

// ── Component ────────────────────────────────────────────────────────────────

// Philosophy keys for i18n lookup
const PHILOSOPHY_KEYS = [
  'eightLimbs', 'tristhana', 'vinyasa', 'bandhas', 'parampara',
  'yogaSutras', 'moonDays', 'mysoreStyle', 'drishti',
] as const;

const BREATHING_KEYS = [
  'ujjayi', 'nadiShodhana', 'kapalabhati', 'kumbhaka',
] as const;

const ANATOMY_KEYS = [
  'bandhas', 'spine', 'hips', 'shoulders', 'fascia',
] as const;

const HISTORY_KEYS = [
  'krishnamacharya', 'pattabhiJois', 'sharathJois',
  'yogaKorunta', 'goesWest', 'today',
] as const;

export default function LibraryScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';

  const [activeCategory, setActiveCategory] = useState('asanas');
  const [selectedAsana, setSelectedAsana] = useState<Asana | null>(null);
  const [expandedPhilo, setExpandedPhilo] = useState<number | null>(null);
  const [asanaFilter, setAsanaFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSeries, setActiveSeries] = useState<'primary' | 'intermediate'>('primary');

  const PRIMARY_SECTIONS = ['Opening', 'Standing', 'Primary Seated', 'Finishing'];
  const INTERMEDIATE_SECTIONS = ['Pashasana Group', 'Backbend Series', 'Leg Behind Head Prep', 'Leg Behind Head', 'Arm Balance Series', 'Hip Openers', 'Advanced Inversions'];

  const activeAsanas = activeSeries === 'primary' ? PRIMARY_ASANAS : INTERMEDIATE_ASANAS;
  const activeSections = activeSeries === 'primary' ? PRIMARY_SECTIONS : INTERMEDIATE_SECTIONS;

  const filteredAsanas = activeAsanas.filter((a) => {
    const matchesSection = !asanaFilter || a.series === asanaFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q
      || a.sanskrit.toLowerCase().includes(q)
      || a.english.toLowerCase().includes(q);
    return matchesSection && matchesSearch;
  });

  // Group by section when no search query and no section filter
  const showGrouped = !searchQuery && !asanaFilter;
  const groupedAsanas = activeSections.map((sec) => ({
    title: sec,
    asanas: filteredAsanas.filter((a) => a.series === sec),
  })).filter((g) => g.asanas.length > 0);

  return (
    <SafeAreaView style={st.safe}>
      <AppHeader />

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={st.catScroll}
        style={st.catBar}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[st.catChip, activeCategory === cat.key && st.catChipActive]}
            onPress={() => { setActiveCategory(cat.key); setAsanaFilter(null); }}
            activeOpacity={0.7}
          >
            <Ionicons name={cat.icon as any} size={15} color={colors.sage} />
            <Text style={[st.catLabel, activeCategory === cat.key && st.catLabelActive]}>
              {t(`library.categories.${cat.key}`, cat.label)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={st.body}
        contentContainerStyle={st.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── ASANAS ── */}
        {activeCategory === 'asanas' && (
          <>
            {/* Series toggle: Primary / Intermediate */}
            <View style={st.seriesToggle}>
              <TouchableOpacity
                style={[st.seriesBtn, activeSeries === 'primary' && st.seriesBtnActive]}
                onPress={() => { setActiveSeries('primary'); setAsanaFilter(null); setSearchQuery(''); }}
                activeOpacity={0.8}
              >
                <Text style={[st.seriesBtnText, activeSeries === 'primary' && st.seriesBtnTextActive]}>
                  Primary Series
                </Text>
                <Text style={[st.seriesBtnSub, activeSeries === 'primary' && st.seriesBtnSubActive]}>
                  Yoga Chikitsa
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[st.seriesBtn, activeSeries === 'intermediate' && st.seriesBtnActive]}
                onPress={() => { setActiveSeries('intermediate'); setAsanaFilter(null); setSearchQuery(''); }}
                activeOpacity={0.8}
              >
                <Text style={[st.seriesBtnText, activeSeries === 'intermediate' && st.seriesBtnTextActive]}>
                  Intermediate
                </Text>
                <Text style={[st.seriesBtnSub, activeSeries === 'intermediate' && st.seriesBtnSubActive]}>
                  Nadi Shodhana
                </Text>
              </TouchableOpacity>
            </View>

            {/* Search bar */}
            <View style={st.searchWrap}>
              <Ionicons name="search" size={16} color={colors.muted} style={st.searchIcon} />
              <TextInput
                style={st.searchInput}
                placeholder={`Search ${activeSeries === 'primary' ? 'primary' : 'intermediate'} asanas…`}
                placeholderTextColor={colors.mutedL}
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={16} color={colors.mutedL} />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter by section */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.filterRow}>
              <TouchableOpacity
                style={[st.filterChip, !asanaFilter && st.filterChipActive]}
                onPress={() => setAsanaFilter(null)}
              >
                <Text style={[st.filterText, !asanaFilter && st.filterTextActive]}>All ({activeAsanas.length})</Text>
              </TouchableOpacity>
              {activeSections.map((sec) => {
                const count = activeAsanas.filter((a) => a.series === sec).length;
                return (
                  <TouchableOpacity
                    key={sec}
                    style={[st.filterChip, asanaFilter === sec && st.filterChipActive]}
                    onPress={() => setAsanaFilter(sec)}
                  >
                    <Text style={[st.filterText, asanaFilter === sec && st.filterTextActive]}>{sec} ({count})</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* No results */}
            {filteredAsanas.length === 0 && (
              <View style={st.emptyState}>
                <Ionicons name="search-outline" size={40} color={colors.mutedL} />
                <Text style={st.emptyText}>No asanas match "{searchQuery}"</Text>
              </View>
            )}

            {/* Grouped view (default) */}
            {showGrouped && groupedAsanas.map((group, groupIdx) => (
              <View key={group.title}>
                <View style={st.sectionHeader}>
                  <Text style={st.sectionHeaderText}>{group.title}</Text>
                  <Text style={st.sectionHeaderCount}>{group.asanas.length}</Text>
                </View>
                {group.asanas.map((asana, i) => {
                  const poseImg = findPoseImage(asana.sanskrit, asana.english);
                  return (
                  <TouchableOpacity
                    key={i}
                    style={st.asanaRow}
                    onPress={() => setSelectedAsana(asana)}
                    activeOpacity={0.7}
                  >
                    {poseImg ? (
                      <View style={st.asanaThumbWrap}>
                        <Image source={poseImg} style={st.asanaThumb} resizeMode="contain" />
                      </View>
                    ) : (
                      <View style={st.asanaNum}>
                        <Text style={st.asanaNumText}>{i + 1}</Text>
                      </View>
                    )}
                    <View style={st.asanaInfo}>
                      <Text style={st.asanaSanskrit}>{asana.sanskrit}</Text>
                      <Text style={st.asanaEnglish}>{asana.english}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={14} color={colors.mutedL} />
                  </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            {/* Flat view (filtered or searched) */}
            {!showGrouped && filteredAsanas.map((asana, i) => {
              const poseImg = findPoseImage(asana.sanskrit, asana.english);
              return (
              <TouchableOpacity
                key={i}
                style={st.asanaRow}
                onPress={() => setSelectedAsana(asana)}
                activeOpacity={0.7}
              >
                {poseImg ? (
                  <View style={st.asanaThumbWrap}>
                    <Image source={poseImg} style={st.asanaThumb} resizeMode="contain" />
                  </View>
                ) : (
                  <View style={st.asanaNum}>
                    <Text style={st.asanaNumText}>{i + 1}</Text>
                  </View>
                )}
                <View style={st.asanaInfo}>
                  <Text style={st.asanaSanskrit}>{asana.sanskrit}</Text>
                  <Text style={st.asanaEnglish}>{asana.english}</Text>
                </View>
                <Text style={st.asanaSeries}>{asana.series}</Text>
              </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* ── SEQUENCES ── */}
        {activeCategory === 'sequences' && SEQUENCES.map((seq, i) => (
          <View key={i} style={st.seqCard}>
            <View style={st.seqBadge}>
              <Text style={st.seqBadgeText}>Series {i + 1}</Text>
            </View>
            <Text style={st.seqTitle}>{seq.title}</Text>
            <Text style={st.seqSubtitle}>{seq.subtitle}</Text>
            <Text style={st.seqDesc}>{seq.description}</Text>
            <View style={st.seqMeta}>
              <View style={st.seqMetaItem}>
                <Text style={st.seqMetaLabel}>Postures</Text>
                <Text style={st.seqMetaValue}>{seq.asanaCount}</Text>
              </View>
              <View style={st.seqMetaItem}>
                <Text style={st.seqMetaLabel}>Duration</Text>
                <Text style={st.seqMetaValue}>{seq.duration}</Text>
              </View>
            </View>
            <Text style={st.seqFocus}>{seq.focus}</Text>
          </View>
        ))}

        {/* ── PHILOSOPHY ── */}
        {activeCategory === 'philosophy' && PHILOSOPHY_KEYS.map((key, i) => (
          <TouchableOpacity
            key={key}
            style={st.philoCard}
            onPress={() => setExpandedPhilo(expandedPhilo === i ? null : i)}
            activeOpacity={0.7}
          >
            <View style={[st.philoHeader, isRTL && { flexDirection: 'row-reverse' }]}>
              <View style={{ flex: 1 }}>
                <Text style={[st.philoTitle, isRTL && { textAlign: 'right' }]}>
                  {t(`library.philosophy.${key}.title`)}
                </Text>
                <Text style={[st.philoSub, isRTL && { textAlign: 'right' }]}>
                  {t(`library.philosophy.${key}.subtitle`)}
                </Text>
              </View>
              <Text style={st.philoArrow}>{expandedPhilo === i ? '−' : '+'}</Text>
            </View>
            {expandedPhilo === i && (
              <Text style={[st.philoContent, isRTL && { textAlign: 'right' }]}>
                {t(`library.philosophy.${key}.content`)}
              </Text>
            )}
          </TouchableOpacity>
        ))}

        {/* ── MANTRAS ── */}
        {activeCategory === 'mantras' && MANTRAS.map((mantra, i) => (
          <View key={i} style={st.mantraCard}>
            <Text style={st.mantraContext}>{mantra.context}</Text>
            <View style={st.mantraDivider} />
            <Text style={st.mantraLabel}>Sanskrit</Text>
            <Text style={st.mantraSanskrit}>{mantra.sanskrit}</Text>
            <Text style={st.mantraLabel}>Transliteration</Text>
            <Text style={st.mantraTranslit}>{mantra.transliteration}</Text>
            <Text style={st.mantraLabel}>Translation</Text>
            <Text style={st.mantraEnglish}>{mantra.english}</Text>
          </View>
        ))}

        {/* ── COUNTING ── */}
        {activeCategory === 'counting' && (
          <>
            <Text style={st.countingIntro}>
              In Mysore-style practice, the teacher counts vinyasas in Sanskrit.
              Learning these numbers helps you follow the count and deepen your
              connection to the tradition.
            </Text>
            <View style={st.countingGrid}>
              {COUNTING.map((c) => (
                <View key={c.number} style={st.countingCell}>
                  <Text style={st.countingNumber}>{c.number}</Text>
                  <Text style={st.countingSanskrit}>{c.sanskrit}</Text>
                  <Text style={st.countingPronounce}>{c.pronunciation}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── PRANAYAMA ── */}
        {activeCategory === 'breathing' && BREATHING_KEYS.map((key) => (
          <View key={key} style={st.pranaCard}>
            <Text style={[st.pranaTitle, isRTL && { textAlign: 'right' }]}>
              {t(`library.breathing.${key}.title`)}
            </Text>
            <Text style={[st.pranaSub, isRTL && { textAlign: 'right' }]}>
              {t(`library.breathing.${key}.subtitle`)}
            </Text>
            <Text style={[st.pranaDesc, isRTL && { textAlign: 'right' }]}>
              {t(`library.breathing.${key}.description`)}
            </Text>
            <View style={st.pranaHow}>
              <Text style={[st.pranaHowLabel, isRTL && { textAlign: 'right' }]}>
                {t('library.breathing.howToPractice')}
              </Text>
              <Text style={[st.pranaHowText, isRTL && { textAlign: 'right' }]}>
                {t(`library.breathing.${key}.howTo`)}
              </Text>
            </View>
          </View>
        ))}

        {/* ── ANATOMY ── */}
        {activeCategory === 'anatomy' && ANATOMY_KEYS.map((key) => (
          <View key={key} style={st.anatomyCard}>
            <Text style={[st.anatomyTitle, isRTL && { textAlign: 'right' }]}>
              {t(`library.anatomy.${key}.title`)}
            </Text>
            <Text style={[st.anatomyContent, isRTL && { textAlign: 'right' }]}>
              {t(`library.anatomy.${key}.content`)}
            </Text>
          </View>
        ))}

        {/* ── HISTORY ── */}
        {activeCategory === 'history' && HISTORY_KEYS.map((key) => (
          <View key={key} style={[st.historyCard, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={st.historyDot} />
            <View style={st.historyBody}>
              <Text style={[st.historyTitle, isRTL && { textAlign: 'right' }]}>
                {t(`library.history.${key}.title`)}
              </Text>
              <Text style={[st.historySub, isRTL && { textAlign: 'right' }]}>
                {t(`library.history.${key}.subtitle`)}
              </Text>
              <Text style={[st.historyContent, isRTL && { textAlign: 'right' }]}>
                {t(`library.history.${key}.content`)}
              </Text>
            </View>
          </View>
        ))}

      </ScrollView>

      {/* ── Asana Detail Modal ── */}
      <Modal
        visible={selectedAsana !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedAsana(null)}
      >
        {selectedAsana && (() => {
          const modalImg = findPoseImage(selectedAsana.sanskrit, selectedAsana.english);
          return (
          <SafeAreaView style={st.modalSafe}>
            {/* Hero gradient header */}
            <LinearGradient
              colors={['#1E2D37', '#2A4A3E']}
              style={st.modalHero}
            >
              {/* Close + badge row */}
              <View style={st.modalTopRow}>
                <TouchableOpacity
                  onPress={() => setSelectedAsana(null)}
                  style={st.modalCloseBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={18} color="rgba(255,255,255,0.85)" />
                </TouchableOpacity>
                <View style={st.modalBadge}>
                  <Text style={st.modalBadgeText}>{selectedAsana.series}</Text>
                </View>
              </View>

              {/* Pose image */}
              {modalImg && (
                <View style={st.modalImageWrap}>
                  <Image source={modalImg} style={st.modalImage} resizeMode="contain" />
                </View>
              )}

              {/* Asana name */}
              <Text style={st.modalSanskrit}>{selectedAsana.sanskrit}</Text>
              <Text style={st.modalEnglish}>{selectedAsana.english}</Text>

              {/* Vinyasa count pill */}
              <View style={st.modalVinyasaPill}>
                <Text style={st.modalVinyasaNum}>{selectedAsana.vinyasaCount}</Text>
                <Text style={st.modalVinyasaLabel}> vinyasas</Text>
              </View>
            </LinearGradient>

            {/* Content */}
            <ScrollView style={st.modalBody} contentContainerStyle={st.modalBodyContent} showsVerticalScrollIndicator={false}>
              <View style={st.modalSection}>
                <Text style={st.modalSectionTitle}>Description</Text>
                <Text style={st.modalText}>{selectedAsana.description}</Text>
              </View>

              <View style={st.modalSection}>
                <Text style={st.modalSectionTitle}>Benefits</Text>
                <Text style={st.modalText}>{selectedAsana.benefits}</Text>
              </View>

              <View style={st.modalSection}>
                <View style={st.modalDrishtiRow}>
                  <Ionicons name="eye-outline" size={16} color={colors.sage} />
                  <Text style={st.modalSectionTitle}>Drishti</Text>
                </View>
                <Text style={st.modalText}>{selectedAsana.drishti}</Text>
              </View>
            </ScrollView>
          </SafeAreaView>
          );
        })()}
      </Modal>
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF8F5' },


  // Category bar
  catBar: { flexGrow: 0 },
  catScroll: {
    paddingHorizontal: spacing.lg, gap: 8,
    paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: '#EDE9E3',
  },
  catChipActive: {
    backgroundColor: colors.ink, borderColor: colors.ink,
  },
  catIcon: { fontSize: 15 },
  catLabel: { ...typography.labelSm, color: colors.ink, fontSize: 12 },
  catLabelActive: { color: '#fff' },

  body: { flex: 1 },
  bodyContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing['4xl'], paddingTop: spacing.sm },

  // Series toggle (Primary / Intermediate)
  seriesToggle: {
    flexDirection: 'row',
    backgroundColor: '#EDE9E3',
    borderRadius: radius.xl,
    padding: 3,
    marginBottom: spacing.md,
    gap: 3,
  },
  seriesBtn: {
    flex: 1, alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },
  seriesBtnActive: {
    backgroundColor: colors.ink,
  },
  seriesBtnText: {
    ...typography.headingXs, color: colors.muted, fontSize: 12,
  },
  seriesBtnTextActive: { color: '#fff' },
  seriesBtnSub: {
    ...typography.bodyXs, color: colors.mutedL, fontSize: 9, marginTop: 1,
  },
  seriesBtnSubActive: { color: 'rgba(255,255,255,0.55)' },

  // Avatar label (example indicator)
  avatarLabel: {
    ...typography.bodyXs, color: colors.sage, fontSize: 9,
    marginTop: 2, fontStyle: 'italic',
  },

  // Asana filter row
  filterRow: { gap: 8, marginBottom: spacing.md, paddingBottom: 4 },
  filterChip: {
    backgroundColor: '#fff', borderRadius: 16,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#EDE9E3',
  },
  filterChipActive: { backgroundColor: colors.sage, borderColor: colors.sage },
  filterText: { ...typography.labelSm, color: colors.ink, fontSize: 11 },
  filterTextActive: { color: '#fff' },

  // Asana list
  asanaRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: radius.xl,
    padding: spacing.md, marginBottom: 8,
    ...shadows.sm,
  },
  asanaThumbWrap: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: '#F6F2EC',
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
    overflow: 'hidden' as any,
  },
  asanaThumb: {
    width: 40, height: 40,
  },
  asanaNum: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: colors.sagePale, alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.md,
  },
  asanaNumText: { ...typography.headingSm, color: colors.sage, fontSize: 12 },
  asanaInfo: { flex: 1 },
  asanaSanskrit: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 15, lineHeight: 20,
    color: colors.ink,
  },
  asanaEnglish: { ...typography.bodyXs, color: colors.muted, marginTop: 1 },
  asanaSeries: { ...typography.labelSm, color: colors.sage, fontSize: 10 },

  // Sequences
  seqCard: {
    backgroundColor: '#fff', borderRadius: radius['2xl'],
    padding: spacing.xl, marginBottom: spacing.md,
    borderLeftWidth: 4, borderLeftColor: colors.sage,
    ...shadows.sm,
  },
  seqBadge: {
    backgroundColor: colors.sagePale, borderRadius: radius.full,
    paddingHorizontal: 10, paddingVertical: 3,
    alignSelf: 'flex-start', marginBottom: spacing.sm,
  },
  seqBadgeText: { ...typography.labelSm, color: colors.sage, textTransform: 'uppercase', letterSpacing: 0.8 },
  seqTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 20, lineHeight: 26,
    color: colors.ink, marginBottom: 2,
  },
  seqSubtitle: { ...typography.bodySm, color: colors.sage, fontStyle: 'italic', marginBottom: spacing.sm },
  seqDesc: { ...typography.bodyMd, color: colors.inkMid, lineHeight: 21, marginBottom: spacing.md },
  seqMeta: { flexDirection: 'row', gap: spacing.xl, marginBottom: spacing.sm },
  seqMetaItem: { alignItems: 'center' },
  seqMetaLabel: { ...typography.labelSm, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  seqMetaValue: { fontFamily: 'DMSerifDisplay_400Regular', fontSize: 18, color: colors.ink },
  seqFocus: { ...typography.bodySm, color: colors.muted, fontStyle: 'italic', marginTop: spacing.sm },

  // Philosophy
  philoCard: {
    backgroundColor: '#fff', borderRadius: radius['2xl'],
    padding: spacing.lg, marginBottom: 10,
    ...shadows.sm,
  },
  philoHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  philoTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 17, lineHeight: 22,
    color: colors.ink,
  },
  philoSub: { ...typography.bodyXs, color: colors.sage, marginTop: 2 },
  philoArrow: { fontSize: 22, color: colors.muted, marginLeft: spacing.sm },
  philoContent: {
    ...typography.bodyMd, color: colors.inkMid, lineHeight: 22,
    marginTop: spacing.md,
  },

  // Mantras
  mantraCard: {
    backgroundColor: '#fff', borderRadius: radius['2xl'],
    padding: spacing.xl, marginBottom: spacing.md,
    ...shadows.sm,
  },
  mantraContext: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 17, lineHeight: 22,
    color: colors.ink, marginBottom: spacing.sm,
  },
  mantraDivider: { height: 1, backgroundColor: '#F0EDE8', marginBottom: spacing.md },
  mantraLabel: {
    ...typography.labelSm, color: colors.sage, textTransform: 'uppercase',
    letterSpacing: 0.8, marginBottom: 4, marginTop: spacing.md,
  },
  mantraSanskrit: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 15, lineHeight: 24,
    color: colors.ink,
  },
  mantraTranslit: {
    ...typography.bodyMd, color: colors.inkMid, lineHeight: 22, fontStyle: 'italic',
  },
  mantraEnglish: {
    ...typography.bodyMd, color: colors.inkMid, lineHeight: 22,
  },

  // Counting
  countingIntro: {
    ...typography.bodyMd, color: colors.inkMid, lineHeight: 21,
    marginBottom: spacing.lg,
  },
  countingGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  countingCell: {
    backgroundColor: '#fff', borderRadius: radius.xl,
    padding: spacing.md, width: '30%' as any, alignItems: 'center',
    ...shadows.sm,
  },
  countingNumber: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 24, color: colors.sage,
  },
  countingSanskrit: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 14, color: colors.ink,
    marginTop: 4,
  },
  countingPronounce: { ...typography.bodyXs, color: colors.muted, marginTop: 2, textAlign: 'center' },

  // Pranayama
  pranaCard: {
    backgroundColor: '#fff', borderRadius: radius['2xl'],
    padding: spacing.xl, marginBottom: spacing.md,
    ...shadows.sm,
  },
  pranaTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 19, lineHeight: 24,
    color: colors.ink,
  },
  pranaSub: { ...typography.bodySm, color: colors.sage, fontStyle: 'italic', marginBottom: spacing.sm },
  pranaDesc: { ...typography.bodyMd, color: colors.inkMid, lineHeight: 21, marginBottom: spacing.md },
  pranaHow: {
    backgroundColor: colors.sagePale, borderRadius: radius.lg,
    padding: spacing.lg,
  },
  pranaHowLabel: { ...typography.headingSm, color: colors.sage, marginBottom: spacing.xs },
  pranaHowText: { ...typography.bodyMd, color: colors.inkMid, lineHeight: 21 },

  // Anatomy
  anatomyCard: {
    backgroundColor: '#fff', borderRadius: radius['2xl'],
    padding: spacing.xl, marginBottom: spacing.md,
    ...shadows.sm,
  },
  anatomyTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 18, lineHeight: 24,
    color: colors.ink, marginBottom: spacing.sm,
  },
  anatomyContent: { ...typography.bodyMd, color: colors.inkMid, lineHeight: 22 },

  // History
  historyCard: {
    flexDirection: 'row', marginBottom: spacing.md,
  },
  historyDot: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: colors.sage, marginTop: 6, marginRight: spacing.md,
  },
  historyBody: {
    flex: 1, backgroundColor: '#fff', borderRadius: radius['2xl'],
    padding: spacing.lg, ...shadows.sm,
  },
  historyTitle: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 17, lineHeight: 22,
    color: colors.ink,
  },
  historySub: { ...typography.bodySm, color: colors.sage, fontStyle: 'italic', marginBottom: spacing.sm },
  historyContent: { ...typography.bodyMd, color: colors.inkMid, lineHeight: 22 },

  // Search bar
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: radius.xl,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    marginBottom: spacing.sm, borderWidth: 1, borderColor: '#EDE9E3',
    ...shadows.sm,
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: {
    flex: 1, ...typography.bodyMd, color: colors.ink,
    paddingVertical: 0,
  },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: spacing['4xl'] },
  emptyIcon: { fontSize: 32, marginBottom: spacing.sm },
  emptyText: { ...typography.bodyMd, color: colors.muted },

  // Section group headers
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 2, marginTop: spacing.lg, marginBottom: spacing.sm,
  },
  sectionHeaderText: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 16, color: colors.ink,
  },
  sectionHeaderCount: {
    ...typography.labelSm, color: colors.muted,
    backgroundColor: '#EDE9E3', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2,
  },

  // Asana detail modal — redesigned
  modalSafe: { flex: 1, backgroundColor: '#FAF8F5' },

  modalHero: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  modalTopRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  modalCloseBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  modalBadge: {
    backgroundColor: 'rgba(126,200,164,0.3)',
    borderRadius: radius.full,
    paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(126,200,164,0.5)',
  },
  modalBadgeText: { ...typography.labelSm, color: '#9DE0C0' },
  modalImageWrap: {
    alignSelf: 'center' as any,
    width: 160, height: 160, borderRadius: 20,
    backgroundColor: '#F6F2EC',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.lg,
    overflow: 'hidden' as any,
  },
  modalImage: {
    width: 140, height: 140,
  },
  modalSanskrit: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 28, lineHeight: 34,
    color: '#fff', marginBottom: 4,
  },
  modalEnglish: { ...typography.bodyMd, color: 'rgba(255,255,255,0.65)', marginBottom: spacing.md },
  modalVinyasaPill: {
    flexDirection: 'row', alignItems: 'baseline',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  modalVinyasaNum: {
    fontFamily: 'DMSerifDisplay_400Regular', fontSize: 18, color: '#fff',
  },
  modalVinyasaLabel: { ...typography.labelSm, color: 'rgba(255,255,255,0.7)' },

  modalBody: { flex: 1 },
  modalBodyContent: { paddingHorizontal: spacing.xl, paddingBottom: 48 },
  modalSection: {
    backgroundColor: '#fff', borderRadius: radius.xl,
    padding: spacing.lg, marginTop: spacing.md,
    ...shadows.sm,
  },
  modalDrishtiRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.xs },
  modalSectionTitle: {
    ...typography.headingXs, color: colors.sage, textTransform: 'uppercase',
    letterSpacing: 0.8, marginBottom: spacing.sm,
  },
  modalText: { ...typography.bodyMd, color: colors.inkMid, lineHeight: 22 },
});
