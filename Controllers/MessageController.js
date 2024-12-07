const Message = require('../Models/MeesagesModel');
const User = require('../Models/UsersModel');


exports.sendMessage = async (req, res) => {
  const { senderId, receiverId, messageContent } = req.body;

  try {

    const sender = await User.findByPk(senderId);
    const receiver = await User.findByPk(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: 'User not found' });
    }


    const message = await Message.create({
      sender_id: senderId,
      receiver_id: receiverId,
      message: messageContent,
    });

    return res.status(201).json({ message: 'Message sent successfully', data: message });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ message: 'Failed to send message', error });
  }
};


exports.getAllMessages = async (req, res) => {
  try {

    const messages = await Message.findAll({
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email','user_type_id'],
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email','user_type_id'],
        },
        
      ],
    });


    if (messages.length === 0) {
      return res.status(404).json({ message: 'No messages found' });
    }

    return res.status(200).json({
      message: 'Messages retrieved successfully',
      data: messages,
    });
  } catch (error) {
    console.error('Error retrieving all messages:', error);
    return res.status(500).json({ message: 'Failed to retrieve messages', error });
  }
};



exports.getMessages = async (req, res) => {
  const { senderId, receiverId } = req.query; 

  try {

    if (!senderId || !receiverId) {
      return res.status(400).json({ message: 'Both senderId and receiverId are required' });
    }

    const messages = await Message.findAll({
      where: {
        sender_id: senderId,
        receiver_id: receiverId,
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (messages.length === 0) {
      return res.status(404).json({ message: 'No messages found' });
    }

    return res.status(200).json({
      message: 'Messages retrieved successfully',
      data: messages,
    });
  } catch (error) {
    console.error('Error retrieving messages:', error);
    return res.status(500).json({ message: 'Failed to retrieve messages', error });
  }
};





exports.getMessages = async (req, res) => {
  const { senderId, receiverId } = req.query || req.params;  

  try {
    if (!senderId || !receiverId) {
      return res.status(400).json({ message: 'Both senderId and receiverId are required' });
    }

    const messages = await Message.findAll({
      where: {
        sender_id: senderId,
        receiver_id: receiverId,
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (messages.length === 0) {
      return res.status(404).json({ message: 'No messages found' });
    }

    return res.status(200).json({
      message: 'Messages retrieved successfully',
      data: messages,
    });
  } catch (error) {
    console.error('Error retrieving messages:', error);
    return res.status(500).json({ message: 'Failed to retrieve messages', error });
  }
};



const { Op } = require('sequelize');

exports.getUserMessages = async (req, res) => {
  const { userId } = req.params;

  try {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: userId },
          { receiver_id: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email'],
        }
      ],
    });

    if (!messages.length) {
      return res.status(404).json({ message: 'No messages found for this user' });
    }

    return res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching user messages:", error);
    return res.status(500).json({ message: 'Failed to fetch user messages', error });
  }
};


exports.updateMessageStatus = async (req, res) => {
  const { messageId, status } = req.body;

  try {

    const message = await Message.update(
      { status: status },
      { where: { id: messageId } }
    );

    if (!message[0]) {
      return res.status(404).json({ message: 'Message not found' });
    }

    return res.status(200).json({ message: 'Message status updated successfully' });
  } catch (error) {
    console.error("Error updating message status:", error);
    return res.status(500).json({ message: 'Failed to update message status', error });
  }
};


exports.deleteMessage = async (req, res) => {
  const { messageId } = req.params;

  try {
    const message = await Message.destroy({
      where: {
        id: messageId,
      },
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    return res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error("Error deleting message:", error);
    return res.status(500).json({ message: 'Failed to delete message', error });
  }
};

