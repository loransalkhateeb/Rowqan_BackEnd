const Messages = require('../Models/MessageModel');
const Users = require('../Models/UsersModel');


exports.createMessage = async (req, res) => {
  try {
    const { senderId, receiverId, message, lang } = req.body;

 
    if (!senderId || !receiverId || !message || !lang) {
      return res.status(400).json({ message: 'All fields are required: senderId, receiverId, message, lang' });
    }

 
    const newMessage = await Messages.create({
      senderId,
      receiverId,
      message,
      lang,
    });

    res.status(201).json({ message: 'Message created successfully', data: newMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};





exports.getMessagesBetweenUsers = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    if (!senderId || !receiverId) {
      return res.status(400).json({ message: 'Both senderId and receiverId are required' });
    }

    
    const messages = await Messages.findAll({
      where: {
        senderId,
        receiverId,
      },
      include: [
        { model: Users, as: 'Sender', attributes: ['id', 'name', 'email'] },
        { model: Users, as: 'Receiver', attributes: ['id', 'name', 'email'] },
      ],
      order: [['id', 'ASC']], 
    });

    res.status(200).json({ message: 'Messages retrieved successfully', data: messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


exports.getSentMessages = async (req, res) => {
  try {
    const { senderId } = req.params;

    if (!senderId) {
      return res.status(400).json({ message: 'senderId is required' });
    }

  
    const messages = await Messages.findAll({
      where: { senderId },
      include: [
        { model: Users, as: 'Receiver', attributes: ['id', 'name', 'email'] },
      ],
      order: [['id', 'ASC']],
    });

    res.status(200).json({ message: 'Sent messages retrieved successfully', data: messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


 exports.getReceivedMessages = async (req, res) => {
  try {
    const { receiverId } = req.params;

    if (!receiverId) {
      return res.status(400).json({ message: 'receiverId is required' });
    }

 
    const messages = await Messages.findAll({
      where: { receiverId },
      include: [
        { model: Users, as: 'Sender', attributes: ['id', 'name', 'email'] },
      ],
      order: [['id', 'ASC']],
    });

    res.status(200).json({ message: 'Received messages retrieved successfully', data: messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    if (!messageId) {
      return res.status(400).json({ message: 'messageId is required' });
    }

   
    const deleted = await Messages.destroy({ where: { id: messageId } });

    if (!deleted) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


