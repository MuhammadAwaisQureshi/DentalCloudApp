import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Target, MessageCircle, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface TreatmentPending {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  treatmentName: string;
  costPKR: number;
  dateAdded: string;
  toothNumbers: number[];
}

interface RevenueDashboardProps {
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  pendingTreatments: TreatmentPending[];
  todayTarget?: number;
}

const RevenueDashboard: React.FC<RevenueDashboardProps> = ({
  todayRevenue,
  weekRevenue,
  monthRevenue,
  pendingTreatments,
  todayTarget = 50000, // Default PKR 50k per day
}) => {
  const [roastMessage, setRoastMessage] = useState<string>('');

  // Calculate percentage of daily target
  const targetPercentage = (todayRevenue / todayTarget) * 100;

  // Roast messages based on performance
  const ROASTS = {
    veryLow: [
      "Boss, aaj toh bohot slow hai! 😴",
      "Patients ko yaad dilao! 📞",
      "Kya ho gaya? Internet slow hai? 🐌",
      "Aray yaar, target bohot door hai! 😅",
    ],
    low: [
      "Thoda aur mehnat chahiye! 💪",
      "Chalo, ab speed pakar lo! 🚀",
      "Abhi bhi waqt hai! ⏰",
      "WhatsApp messages bhejo patients ko! 📱",
    ],
    good: [
      "Bohot acha chal raha hai! 👍",
      "Keep it up! Target near hai! 🎯",
      "Shabash! Acha progress! 💚",
    ],
    excellent: [
      "Mashallah! Target crossed! 🎉",
      "Kya baat hai! Zabardast! ⭐",
      "Allah ka shukar! Amazing work! 🙌",
      "Bonus time! Keep going! 💰",
    ],
  };

  // Get appropriate roast
  useEffect(() => {
    let category: keyof typeof ROASTS;
    if (targetPercentage < 30) category = 'veryLow';
    else if (targetPercentage < 70) category = 'low';
    else if (targetPercentage < 100) category = 'good';
    else category = 'excellent';

    const messages = ROASTS[category];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setRoastMessage(randomMessage);
  }, [todayRevenue, todayTarget]);

  // Generate WhatsApp message
  const generateWhatsAppLink = (treatment: TreatmentPending): string => {
    const phone = treatment.patientPhone.replace(/\D/g, '');
    const phoneNumber = phone.startsWith('92') ? phone : `92${phone.replace(/^0/, '')}`;

    const message = `السلام علیکم ${treatment.patientName}،

Dr. Ahmed Abdullah Khan here from Abdullah Dental Care. 

Your pending treatment: ${treatment.treatmentName} (Tooth ${treatment.toothNumbers.join(', ')})
Cost: PKR ${treatment.costPKR.toLocaleString()}

We can schedule your appointment soon. When would you like to complete this treatment?

Abdullah Dental Care
Hayatabad, Peshawar
📞 0334-5822-622`;

    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  // Get status color
  const getStatusColor = (): string => {
    if (targetPercentage >= 100) return 'from-green-500 to-emerald-600';
    if (targetPercentage >= 70) return 'from-blue-500 to-cyan-600';
    if (targetPercentage >= 30) return 'from-orange-500 to-amber-600';
    return 'from-red-500 to-rose-600';
  };

  // Calculate potential revenue from pending
  const totalPendingRevenue = pendingTreatments.reduce((sum, t) => sum + t.costPKR, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp className="text-brand-500" size={28} />
          Revenue Dashboard
        </h2>
        <p className="text-sm text-gray-500 mt-1">Real-time financial analytics</p>
      </div>

      {/* Daily Target Card */}
      <div className={`bg-gradient-to-r ${getStatusColor()} rounded-lg shadow-lg p-6 text-white`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-white/80 mb-1">Today's Revenue</p>
            <p className="text-4xl font-bold">PKR {todayRevenue.toLocaleString()}</p>
            <p className="text-sm text-white/80 mt-1">
              Target: PKR {todayTarget.toLocaleString()} ({targetPercentage.toFixed(0)}%)
            </p>
          </div>
          <div className="text-right">
            {targetPercentage >= 100 ? (
              <CheckCircle size={48} className="text-green-200" />
            ) : targetPercentage >= 70 ? (
              <Target size={48} className="text-blue-200" />
            ) : (
              <AlertCircle size={48} className="text-orange-200" />
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/20 rounded-full h-4 mb-4">
          <div
            className="bg-white h-4 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(targetPercentage, 100)}%` }}
          />
        </div>

        {/* Roast Message */}
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <p className="font-bold text-lg">{roastMessage}</p>
        </div>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Today */}
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-brand-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-600">Today</h3>
            <Clock className="text-brand-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            PKR {todayRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {targetPercentage >= 100 ? '✅ Target achieved!' : `${(100 - targetPercentage).toFixed(0)}% to target`}
          </p>
        </div>

        {/* This Week */}
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-600">This Week</h3>
            <TrendingUp className="text-blue-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            PKR {weekRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Avg: PKR {Math.round(weekRevenue / 7).toLocaleString()}/day
          </p>
        </div>

        {/* This Month */}
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-600">This Month</h3>
            <DollarSign className="text-green-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-800">
            PKR {monthRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Avg: PKR {Math.round(monthRevenue / new Date().getDate()).toLocaleString()}/day
          </p>
        </div>
      </div>

      {/* The Gold Mine - Pending Treatments */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-gray-800 text-xl flex items-center gap-2">
              💰 The Gold Mine
            </h3>
            <p className="text-sm text-gray-500">
              Pending treatments worth PKR {totalPendingRevenue.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Potential Revenue</p>
            <p className="text-2xl font-bold text-brand-600">
              PKR {totalPendingRevenue.toLocaleString()}
            </p>
          </div>
        </div>

        {pendingTreatments.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <CheckCircle size={48} className="mx-auto mb-3 text-green-400" />
            <p className="text-lg font-medium">No pending treatments!</p>
            <p className="text-sm mt-1">All treatment plans are completed. Great job! 🎉</p>
          </div>
        ) : (
          <>
            {/* Alert Box */}
            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-amber-600 flex-shrink-0" size={24} />
                <div>
                  <p className="font-bold text-amber-800">Action Required!</p>
                  <p className="text-sm text-amber-700">
                    {pendingTreatments.length} patient{pendingTreatments.length > 1 ? 's have' : ' has'} planned 
                    treatments. Follow up via WhatsApp to schedule and convert to revenue.
                  </p>
                </div>
              </div>
            </div>

            {/* Pending Treatments List */}
            <div className="space-y-3">
              {pendingTreatments
                .sort((a, b) => b.costPKR - a.costPKR)
                .map((treatment) => (
                  <div
                    key={treatment.id}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-brand-300 hover:shadow-md transition"
                  >
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      {/* Treatment Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="bg-amber-100 w-12 h-12 rounded-lg flex items-center justify-center text-2xl">
                            💎
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800">{treatment.patientName}</h4>
                            <p className="text-sm text-gray-600">{treatment.treatmentName}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {treatment.toothNumbers.map((tooth) => (
                                <span
                                  key={tooth}
                                  className="px-2 py-0.5 bg-gray-200 rounded text-xs font-bold"
                                >
                                  #{tooth}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>📞 {treatment.patientPhone}</span>
                          <span>📅 Added: {new Date(treatment.dateAdded).toLocaleDateString()}</span>
                          <span className="font-bold text-brand-600">
                            PKR {treatment.costPKR.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* WhatsApp Action */}
                      <div className="flex flex-col gap-2">
                        <a
                          href={generateWhatsAppLink(treatment)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition font-semibold flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                          <MessageCircle size={20} />
                          Follow Up
                        </a>
                        <span className="text-xs text-gray-500 text-center">
                          Send reminder
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Summary Stats */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-brand-500">
                    {pendingTreatments.length}
                  </p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-500">
                    PKR {Math.round(totalPendingRevenue / pendingTreatments.length).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Avg Value</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-500">
                    PKR {Math.max(...pendingTreatments.map(t => t.costPKR)).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Highest</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-500">
                    {((totalPendingRevenue / todayTarget) * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-500">Of Daily Target</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tips Card */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
        <h4 className="font-bold text-blue-800 mb-2">💡 Revenue Optimization Tips</h4>
        <ul className="space-y-1 text-sm text-blue-700">
          <li>• Follow up with pending treatments daily via WhatsApp</li>
          <li>• Prioritize high-value treatments first (PKR 20k+)</li>
          <li>• Offer flexible payment plans for expensive treatments</li>
          <li>• Send reminders 1 week after treatment planning</li>
          <li>• Track conversion rate: Planned → Completed → Paid</li>
        </ul>
      </div>
    </div>
  );
};

export default RevenueDashboard;
