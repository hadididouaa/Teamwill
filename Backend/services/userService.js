const { User, Sequelize } = require('../db/models');
const moment = require('moment');

exports.checkInactiveUsers = async () => {
  try {
    const currentDate = moment();  // Get the current date
    const thirtyDaysAgo = currentDate.subtract(30, 'days');  // Get the date 30 days ago

    // Find users who have not logged in for the last 30 days
    const inactiveUsers = await User.findAll({
      where: {
        isActive: true, // Only check active users
        derConnx: {
          [Sequelize.Op.lt]: thirtyDaysAgo.toDate() // Users who last logged in more than 30 days ago
        }
      }
    });

    if (inactiveUsers.length > 0) {
      // Update the isActive field to false for inactive users
      for (let user of inactiveUsers) {
        user.isActive = false;
        await user.save(); // Save the changes
      }
      console.log(`${inactiveUsers.length} users have been marked as inactive.`);
    } else {
      console.log('No inactive users found.');
    }
  } catch (error) {
    console.error('Error checking inactive users:', error);
  }
};
