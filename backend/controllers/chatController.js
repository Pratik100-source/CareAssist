const ChatMessage = require("../models/chatMessage");

const fetchMessages = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const conversation = await ChatMessage.findOne({ bookingId });
    if (!conversation) {
      return res.status(200).json({ messages: [] }); // No conversation yet
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({ error: "Failed to fetch chat messages" });
  }
};

module.exports = { fetchMessages };
