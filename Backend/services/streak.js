// services/updateUserStreak.js
const { DailyStreak } = require('../db/models'); // adjust path
const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

const updateUserStreak = async (userId) => {
  try {
    let streak = await DailyStreak.findOne({ where: { userId }, paranoid: false });
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (!streak) {
      await DailyStreak.create({
        userId,
        nombreStreak: 1,
        streakCount: 1,
      });
      return 'Streak initialized';
    }

    const lastLogin = new Date(streak.updatedAt);
    const lastLoginStr = lastLogin.toISOString().split('T')[0];

    if (lastLoginStr === todayStr) {
      return 'Streak already updated today';
    }

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastLoginStr === yesterdayStr || isWeekend(yesterday)) {
      streak.nombreStreak += 1;
      streak.streakCount += 1;
    } else {
      streak.nombreStreak = 1;
      streak.streakCount = 1;
    }

    if (streak.nombreStreak % 5 === 0) {
      console.log('Weekly reward triggered!');
    }

    await streak.save();
    return 'Streak updated successfully';

  } catch (error) {
    console.error('Error updating streak:', error);
    throw new Error('Failed to update streak');
  }
};

module.exports = updateUserStreak;
