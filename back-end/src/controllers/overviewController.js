const { getOverviewStats } = require("../services/overviewService");

const getStats = async (req, res) => {
  try {
    const stats = await getOverviewStats();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching overview stats",
      error: error.message,
    });
  }
};

module.exports = {
  getStats,
};
