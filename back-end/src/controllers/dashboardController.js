const { getDashboardStats } = require("../services/dashboardService");

const getStats = async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching dashboard stats",
      error: error.message,
    });
  }
};

module.exports = {
  getStats,
};
