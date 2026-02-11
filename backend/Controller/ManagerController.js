import DailyLog from "../Models/DailyLog.js";
import User from "../Models/UserModel.js";

const getPendingLogs = async (req, res) => {
  try {
    const { employeeId } = req.query;

    const query = employeeId
      ? { status: "pending", userId: employeeId }
      : { status: "pending" };

    const logs = await DailyLog.find(query)
      .populate("userId", "name email")
      .sort({ logDate: -1 });

    res.status(200).json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { managerFeedback } = req.body;

    const log = await DailyLog.findById(id);
    if (!log) return res.status(404).json({ message: "Log not found" });

    log.status = "approved";
    log.managerFeedback = managerFeedback || "Approved";
    log.approvedBy = req.user._id;
    log.approvedAt = new Date();

    await log.save();

    res.status(200).json({
      success: true,
      message: "Log approved successfully",
      log,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rejectLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { managerFeedback } = req.body;

    const log = await DailyLog.findById(id);
    if (!log) return res.status(404).json({ message: "Log not found" });

    log.status = "rejected";
    log.managerFeedback = managerFeedback;
    log.approvedBy = req.user._id;
    log.approvedAt = new Date();

    await log.save();

    res.status(200).json({
      success: true,
      message: "Log rejected",
      log,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: "Employee" })
      .select("name email _id");

    return res.status(200).json({
      success: true,
      employees,
    });

  } catch (error) {
    console.error("Error fetching employees:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
    });
  }
};

const getLogsForManager = async (req, res) => {
  try {
    const { employeeId } = req.query;

    // If a specific employee is selected
    const query = employeeId ? { userId: employeeId } : {};

    const logs = await DailyLog.find(query)
      .populate("userId", "name email")
      .sort({ logDate: -1 });

    return res.status(200).json({ success: true, logs });

  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch logs" });
  }
};

 const getLogStats = async (req, res) => {
  try {
    const pending = await DailyLog.countDocuments({ status: "pending" });
    const approved = await DailyLog.countDocuments({ status: "approved" });
    const rejected = await DailyLog.countDocuments({ status: "rejected" });

    res.status(200).json({
      success: true,
      stats: { pending, approved, rejected },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const filterApprovedLogs = async (req, res) => {
  try {
    const { employeeId, start, end } = req.query;

    // Validate required fields
    if (!employeeId || !start || !end) {
      return res.status(400).json({ 
        success: false,
        message: "employeeId, start date, and end date are required" 
      });
    }

    const logs = await DailyLog.find({
      userId: employeeId,
      status: "approved",
      logDate: { $gte: new Date(start), $lte: new Date(end) }
    })
    .populate("userId", "name email")
    .sort({ logDate: 1 });

    return res.status(200).json({ success: true, logs });

  } catch (error) {
    console.error("Error filtering logs:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export { getPendingLogs, approveLog, rejectLog, getAllEmployees, getLogStats, getLogsForManager, filterApprovedLogs };
