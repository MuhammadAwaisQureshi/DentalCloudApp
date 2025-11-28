import { Treatment } from '../types';

/**
 * Calculate PKR price from USD base price
 * Rounding rules:
 * - If < 5000: Round up to nearest 500
 * - If >= 5000: Round up to nearest 1000
 */
export const calculatePKR = (baseUSD: number, rate: number): number => {
  const raw = baseUSD * rate;

  if (raw < 5000) {
    return Math.ceil(raw / 500) * 500;
  } else {
    return Math.ceil(raw / 1000) * 1000;
  }
};

/**
 * Comprehensive treatment menu with 70+ items
 * baseUSD prices are in US Dollars
 */
export const TREATMENT_MENU: Treatment[] = [
  // Consultations & Diagnostics
  { id: 't1', name: 'Consultation', baseUSD: 7 },
  { id: 't2', name: 'Emergency Consultation', baseUSD: 12 },
  { id: 't3', name: 'OPG X-Ray', baseUSD: 15 },
  { id: 't4', name: 'IOPA X-Ray', baseUSD: 5 },
  { id: 't5', name: 'Dental Photos', baseUSD: 8 },

  // Restorative Dentistry
  { id: 't6', name: 'Composite Filling (Single Surface)', baseUSD: 22 },
  { id: 't7', name: 'Composite Filling (Two Surfaces)', baseUSD: 30 },
  { id: 't8', name: 'Composite Filling (Three+ Surfaces)', baseUSD: 40 },
  { id: 't9', name: 'GIC Filling', baseUSD: 15 },
  { id: 't10', name: 'Amalgam Filling', baseUSD: 18 },

  // Endodontics (Root Canal)
  { id: 't11', name: 'Root Canal (RCT) - Anterior', baseUSD: 55 },
  { id: 't12', name: 'Root Canal (RCT) - Premolar', baseUSD: 65 },
  { id: 't13', name: 'Root Canal (RCT) - Molar', baseUSD: 85 },
  { id: 't14', name: 'Re-RCT - Anterior', baseUSD: 75 },
  { id: 't15', name: 'Re-RCT - Premolar', baseUSD: 90 },
  { id: 't16', name: 'Re-RCT - Molar', baseUSD: 110 },
  { id: 't17', name: 'Pulpotomy', baseUSD: 25 },
  { id: 't18', name: 'Pulpectomy', baseUSD: 35 },

  // Extractions
  { id: 't19', name: 'Simple Extraction', baseUSD: 18 },
  { id: 't20', name: 'Surgical Extraction', baseUSD: 35 },
  { id: 't21', name: 'Wisdom Tooth Removal (Simple)', baseUSD: 45 },
  { id: 't22', name: 'Wisdom Tooth Removal (Impacted)', baseUSD: 85 },
  { id: 't23', name: 'Root Piece Removal', baseUSD: 28 },
  { id: 't24', name: 'Deciduous Tooth Extraction', baseUSD: 12 },

  // Prosthodontics - Crowns & Bridges
  { id: 't25', name: 'Metal Crown', baseUSD: 65 },
  { id: 't26', name: 'Porcelain Fused to Metal (PFM) Crown', baseUSD: 85 },
  { id: 't27', name: 'Zirconia Crown', baseUSD: 180 },
  { id: 't28', name: 'E-Max Crown (Full Ceramic)', baseUSD: 220 },
  { id: 't29', name: 'PFM Bridge (3 Unit)', baseUSD: 240 },
  { id: 't30', name: 'Zirconia Bridge (3 Unit)', baseUSD: 480 },
  { id: 't31', name: 'Temporary Crown', baseUSD: 15 },

  // Prosthodontics - Dentures
  { id: 't32', name: 'Complete Acrylic Denture (Upper/Lower)', baseUSD: 140 },
  { id: 't33', name: 'Complete Flexible Denture', baseUSD: 280 },
  { id: 't34', name: 'Partial Acrylic Denture', baseUSD: 95 },
  { id: 't35', name: 'Partial Cast Metal Denture', baseUSD: 180 },
  { id: 't36', name: 'Flexible Partial Denture', baseUSD: 200 },
  { id: 't37', name: 'Denture Repair', baseUSD: 25 },
  { id: 't38', name: 'Denture Reline', baseUSD: 40 },
  { id: 't39', name: 'Immediate Denture', baseUSD: 160 },

  // Implantology
  { id: 't40', name: 'Implant (Korean)', baseUSD: 400 },
  { id: 't41', name: 'Implant (Swiss/German)', baseUSD: 700 },
  { id: 't42', name: 'Implant Crown (Abutment + Crown)', baseUSD: 250 },
  { id: 't43', name: 'Bone Graft', baseUSD: 200 },
  { id: 't44', name: 'Sinus Lift', baseUSD: 350 },
  { id: 't45', name: 'All-on-4 (Per Arch)', baseUSD: 3500 },

  // Orthodontics
  { id: 't46', name: 'Fixed Metal Braces (Full Treatment)', baseUSD: 550 },
  { id: 't47', name: 'Ceramic Braces (Full Treatment)', baseUSD: 750 },
  { id: 't48', name: 'Self-Ligating Braces', baseUSD: 900 },
  { id: 't49', name: 'Clear Aligners (Full Treatment)', baseUSD: 1200 },
  { id: 't50', name: 'Retainer (Hawley)', baseUSD: 45 },
  { id: 't51', name: 'Retainer (Clear)', baseUSD: 65 },
  { id: 't52', name: 'Ortho Monthly Adjustment', baseUSD: 20 },
  { id: 't53', name: 'Space Maintainer', baseUSD: 55 },

  // Periodontics
  { id: 't54', name: 'Scaling (Cleaning)', baseUSD: 22 },
  { id: 't55', name: 'Deep Scaling (Per Quadrant)', baseUSD: 35 },
  { id: 't56', name: 'Root Planning (Per Quadrant)', baseUSD: 40 },
  { id: 't57', name: 'Gum Surgery (Flap)', baseUSD: 120 },
  { id: 't58', name: 'Gingivectomy', baseUSD: 85 },
  { id: 't59', name: 'Crown Lengthening', baseUSD: 100 },

  // Cosmetic Dentistry
  { id: 't60', name: 'Teeth Whitening (In-Office)', baseUSD: 120 },
  { id: 't61', name: 'Teeth Whitening (Take-Home Kit)', baseUSD: 80 },
  { id: 't62', name: 'Veneer (Composite)', baseUSD: 85 },
  { id: 't63', name: 'Veneer (Porcelain)', baseUSD: 280 },
  { id: 't64', name: 'Smile Makeover (Per Tooth)', baseUSD: 250 },

  // Pediatric Dentistry
  { id: 't65', name: 'Fluoride Treatment', baseUSD: 12 },
  { id: 't66', name: 'Sealant (Per Tooth)', baseUSD: 15 },
  { id: 't67', name: 'Pediatric Crown (Stainless Steel)', baseUSD: 35 },

  // Miscellaneous
  { id: 't68', name: 'Mouth Guard (Sports)', baseUSD: 45 },
  { id: 't69', name: 'Night Guard (Bruxism)', baseUSD: 85 },
  { id: 't70', name: 'TMJ Splint', baseUSD: 120 },
  { id: 't71', name: 'Post & Core', baseUSD: 40 },
  { id: 't72', name: 'Frenectomy', baseUSD: 65 },
  { id: 't73', name: 'Biopsy', baseUSD: 55 },
  { id: 't74', name: 'Medication (Antibiotics/Pain)', baseUSD: 8 },
];
