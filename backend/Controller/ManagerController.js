import DailyLog from "../Models/DailyLog.js";

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

export { getPendingLogs, approveLog, rejectLog };
