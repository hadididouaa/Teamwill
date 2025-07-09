// utils/cron.js
const cron = require('node-cron');
const { User, Trace } = require('../db/models');
const { Op } = require('sequelize');
const moment = require('moment');  // For date comparisons
const { checkInactiveUsers } = require('../services/userService');  // Import checkInactiveUsers method

// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    // 1. DELETE traces older than 5 minutes
    const deletedTraces = await Trace.destroy({
      where: {
        createdAt: {
          [Op.lt]: new Date(Date.now() - 5 * 60 * 1000)
        }
      }
    });
    console.log(`${deletedTraces} trace logs permanently deleted.`);

    // 2. DEACTIVATE users who haven't logged in since account creation (after 24h)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const inactiveUsers = await User.findAll({
      where: {
        isActive: true,
        createdAt: { [Op.lte]: twentyFourHoursAgo },
        derConnx: { [Op.eq]: col('createdAt') } // same value = never logged in
      }
    });

    for (const user of inactiveUsers) {
      user.isActive = false;
      await user.save();
      console.log(`User ${user.username} deactivated due to 24h of inactivity since creation.`);
    }

  } catch (error) {
    console.error('Cron job error:', error);
  }
});

// Schedule a task to run every day at midnight to check inactive users
cron.schedule('0 0 * * *', async () => {  // Run every day at midnight
  try {
    // Call the method to check and deactivate inactive users
    await checkInactiveUsers();
  } catch (error) {
    console.error('Error while checking inactive users:', error);
  }
});
