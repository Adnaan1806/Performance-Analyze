import DailyLog from "../Models/DailyLog.js";

const addDailyLog = async (req, res) => {
  try {
    const { tasks, learnings, challenges, logDate } = req.body;

    if (!tasks || !learnings || !challenges || !logDate) {
      return res.status(400).json({
        success: false,
        message: "Tasks, learnings, challenges, and date are required.",
      });
    }

    const log = await DailyLog.create({
      userId: req.user._id,
      tasks,
      learnings,
      challenges,
      logDate,
    });

    return res.status(201).json({
      success: true,
      message: "Daily log added successfully!",
      log,
    });
  } catch (error) {
    console.error("Error adding daily log:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while adding daily log",
      error: error.message,
    });
  }
};

const getDailyLogs = async (req, res) => {
  try {
    const logs = await DailyLog.find({ userId: req.user._id })
      .populate("approvedBy", "name email")
      .sort({
        logDate: -1,
      });

    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { addDailyLog, getDailyLogs };
