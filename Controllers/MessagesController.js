
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


    if (req.socketIoInstance) {
      req.socketIoInstance.emit('receive_message', {
        senderId,
        receiverId,
        message,
        lang,
      });
    } else {
      console.error('socketIoInstance is undefined');
    }

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


    if (req.socketIoInstance) {
      req.socketIoInstance.emit('receive_message_batch', messages);
    } else {
      console.error('socketIoInstance is undefined');
    }
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

  
    if (req.socketIoInstance) {
      req.socketIoInstance.emit('sent_messages', messages);
    } else {
      console.error('socketIoInstance is undefined');
    }
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

  
    if (req.socketIoInstance) {
      req.socketIoInstance.emit('received_messages', messages);
    } else {
      console.error('socketIoInstance is undefined');
    }
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


    if (req.socketIoInstance) {
      req.socketIoInstance.emit('message_deleted', messageId);
    } else {
      console.error('socketIoInstance is undefined');
    }

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
