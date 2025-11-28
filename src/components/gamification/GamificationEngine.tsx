import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Target, TrendingUp, Award, Star, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

// ===================================
// ROAST DATABASE (The Witty System)
// ===================================

const ROASTS = {
  morning: [
    "Aray yaar, internet slow hai ya tum? ☕",
    "Subah ka waqt hai, patients ka intezar hai! 🌅",
    "Chai peenay ka time nahi, kaam karo! ☕",
    "Boss, clinic khol lo pehlay! 🏥",
    "Naveed bhai, system on karo! 💻",
  ],
  revenueLow: [
    "Agar isi tarha chalta raha, rent kaisay hoga? 😅",
    "Boss, aaj ka target miss ho raha hai! 📉",
    "Patients ko WhatsApp bhejo yaar! 📱",
    "Lab ka paisa bhi dena hai yaad hai? 💸",
    "Aray bhai, ortho walay doctor ka hissa bhi dena hai! 🦷",
  ],
  success: [
    "Mashallah! Aaj ka target achieve! 🎉",
    "Shabash Naveed! Bonus milega! 💰",
    "Dr. Sahab khush hongay! ⭐",
    "Kya baat hai! Keep it up! 🔥",
    "Allah ka shukar, acha din raha! 🙌",
  ],
  streakBreak: [
    "Aray yaar, streak toot gai! 😢",
    "Kal wapas mehnat karna paray ga! 💪",
    "Koi baat nahi, naya start! 🚀",
    "Boss, focus wapis lao! 🎯",
  ],
};

// ===================================
// POINTS SYSTEM
// ===================================

const POINTS_CONFIG = {
  newPatient: 50,
  completedAppointment: 25,
  completedTreatment: 40,
  billPaid: 30,
  labDelivered: 20,
  orthoSettlement: 35,
  expenseRecorded: 10,
  dailyTarget: 100, // Bonus for hitting PKR 50k
};

// ===================================
// GAMIFICATION ENGINE
// ===================================

interface GamificationState {
  streak: number;
  totalPoints: number;
  dailyScore: number;
  lastActiveDate: string;
  achievements: string[];
}

const STORAGE_KEY = 'abdullah_dental_gamification';

const GamificationEngine: React.FC = () => {
  const [state, setState] = useState<GamificationState>({
    streak: 0,
    totalPoints: 0,
    dailyScore: 0,
    lastActiveDate: new Date().toISOString().split('T')[0],
    achievements: [],
  });

  const [currentRoast, setCurrentRoast] = useState<string>('');
  const [showRoast, setShowRoast] = useState(false);

  // Load state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedState: GamificationState = JSON.parse(saved);

        const today = new Date().toISOString().split('T')[0];
        if (parsedState.lastActiveDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (parsedState.lastActiveDate === yesterdayStr) {
            setState({
              ...parsedState,
              streak: parsedState.streak + 1,
              dailyScore: 0,
              lastActiveDate: today,
            });
          } else {
            showRandomRoast('streakBreak');
            setState({
              ...parsedState,
              streak: 1,
              dailyScore: 0,
              lastActiveDate: today,
            });
          }
        } else {
          setState(parsedState);
        }
      } else {
        showRandomRoast('morning');
      }
    } catch (err) {
      console.error('Failed to parse gamification state:', err);
      showRandomRoast('morning');
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error('Failed to save gamification state:', err);
    }
  }, [state]);

  const showRandomRoast = (category: keyof typeof ROASTS) => {
    const roasts = ROASTS[category];
    const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
    setCurrentRoast(randomRoast);
    setShowRoast(true);
    setTimeout(() => setShowRoast(false), 5000);
  };

  const addPoints = (amount: number, reason: string) => {
    setState(prev => {
      const newDailyScore = prev.dailyScore + amount;
      const newTotalPoints = prev.totalPoints + amount;

      // Trigger confetti
      triggerConfetti();

      checkAchievements(newDailyScore, newTotalPoints, prev.streak, prev.achievements);

      if (newDailyScore % 100 === 0) {
        showRandomRoast('success');
      }

      return {
        ...prev,
        dailyScore: newDailyScore,
        totalPoints: newTotalPoints,
      };
    });
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f97316', '#fb923c', '#fdba74'],
    });
  };

  const checkAchievements = (
    dailyScore: number,
    totalPoints: number,
    streak: number,
    prevAchievements: string[]
  ) => {
    const newAchievements = [...prevAchievements];

    if (dailyScore >= 100 && !newAchievements.includes('daily_100')) newAchievements.push('daily_100');
    if (dailyScore >= 200 && !newAchievements.includes('daily_200')) newAchievements.push('daily_200');

    if (totalPoints >= 1000 && !newAchievements.includes('total_1000')) newAchievements.push('total_1000');
    if (totalPoints >= 5000 && !newAchievements.includes('total_5000')) newAchievements.push('total_5000');

    if (streak >= 7 && !newAchievements.includes('streak_7')) newAchievements.push('streak_7');
    if (streak >= 30 && !newAchievements.includes('streak_30')) newAchievements.push('streak_30');

    if (newAchievements.length > prevAchievements.length) {
      setState(prev => ({
        ...prev,
        achievements: newAchievements,
      }));
      triggerConfetti();
    }
  };

  const getLevel = (): number => Math.floor(state.totalPoints / 500) + 1;
  const getLevelProgress = (): number => (state.totalPoints % 500) / 500 * 100;

  return (
    <>
      {showRoast && (
        <div className="fixed top-20 right-4 z-50 bg-brand-500 text-white px-6 py-4 rounded-lg shadow-lg animate-bounce max-w-sm">
          <p className="text-sm font-bold">{currentRoast}</p>
        </div>
      )}

      <div className="bg-gradient-to-r from-brand-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-sm text-orange-100 mb-1">Naveed's Performance</h3>
            <p className="text-3xl font-bold">{state.dailyScore} Points</p>
            <p className="text-xs text-orange-100">Level {getLevel()}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="text-yellow-300" size={20} />
              <span className="text-2xl font-bold">{state.streak}</span>
            </div>
            <p className="text-xs text-orange-100">Day Streak</p>
          </div>
        </div>

        <div className="bg-orange-800 rounded-full h-3 mb-4">
          <div
            className="bg-yellow-300 h-3 rounded-full transition-all duration-500"
            style={{ width: `${getLevelProgress()}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <Trophy size={20} className="mx-auto mb-1" />
            <p className="text-lg font-bold">{state.totalPoints}</p>
            <p className="text-xs text-orange-100">Total Points</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <Target size={20} className="mx-auto mb-1" />
            <p className="text-lg font-bold">{state.dailyScore}</p>
            <p className="text-xs text-orange-100">Today</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <Award size={20} className="mx-auto mb-1" />
            <p className="text-lg font-bold">{state.achievements.length}</p>
            <p className="text-xs text-orange-100">Badges</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => addPoints(POINTS_CONFIG.newPatient, 'New Patient')}
            className="flex-1 bg-white text-brand-600 py-2 px-3 rounded-lg font-semibold text-sm hover:bg-orange-50 transition"
          >
            +{POINTS_CONFIG.newPatient} New Patient
          </button>
          <button
            onClick={() => addPoints(POINTS_CONFIG.completedAppointment, 'Completed Appointment')}
            className="flex-1 bg-white text-brand-600 py-2 px-3 rounded-lg font-semibold text-sm hover:bg-orange-50 transition"
          >
            +{POINTS_CONFIG.completedAppointment} Appointment
          </button>
        </div>
      </div>

      {state.achievements.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 mt-4">
          <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Star className="text-yellow-500" size={20} />
            Achievements Unlocked
          </h4>
          <div className="flex flex-wrap gap-2">
            {state.achievements.map((achievement) => (
              <span
                key={achievement}
                className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold"
              >
                🏆 {achievement.replace('_', ' ').toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

// ===================================
// HOOK FOR OTHER COMPONENTS
// ===================================

export const useGamification = () => {
  const addPoints = (amount: number, reason: string) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved) as GamificationState;
        const newState = {
          ...state,
          dailyScore: state.dailyScore + amount,
          totalPoints: state.totalPoints + amount,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));

        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#f97316', '#fb923c', '#fdba74'],
        });
      }
    } catch (err) {
      console.error('Failed to update gamification state:', err);
    }
  };

  return { addPoints };
};

export default GamificationEngine;
