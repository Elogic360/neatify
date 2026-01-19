import React from 'react';
import { Award } from 'lucide-react';
interface LoyaltyCardProps {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  pointsToNextTier?: number;
}
export const LoyaltyCard: React.FC<LoyaltyCardProps> = ({
  tier,
  points,
  pointsToNextTier
}) => {
  const getTierColor = (tier: string) => {
    const colors = {
      bronze: 'from-orange-600 to-orange-400',
      silver: 'from-gray-400 to-gray-300',
      gold: 'from-yellow-500 to-yellow-300',
      platinum: 'from-purple-600 to-purple-400'
    };
    return colors[tier as keyof typeof colors] || colors.bronze;
  };

  const getTierInfo = (tier: string) => {
    const info = {
      bronze: { name: 'Bronze', discount: '5%' },
      silver: { name: 'Silver', discount: '10%' },
      gold: { name: 'Gold', discount: '15%' },
      platinum: { name: 'Platinum', discount: '20%' }
    };
    return info[tier as keyof typeof info] || info.bronze;
  };

  const tierInfo = getTierInfo(tier);
  const progress = pointsToNextTier ? (points / pointsToNextTier) * 100 : 0;

  return (
    <div className={`bg-gradient-to-r ${getTierColor(tier)} rounded-lg p-6 text-white shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Award className="w-8 h-8" />
          <div>
            <h3 className="text-2xl font-bold">{tierInfo.name} Member</h3>
            <p className="text-sm opacity-90">Enjoy {tierInfo.discount} off all purchases</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">{points}</p>
          <p className="text-sm opacity-90">Points</p>
        </div>
      </div>
      {pointsToNextTier && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress to next tier</span>
            <span>{pointsToNextTier - points} points to go</span>
          </div>
          <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
            <div
              className={`bg-white rounded-full h-2 transition-all duration-300 w-[${Math.min(progress, 100)}%]`}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};