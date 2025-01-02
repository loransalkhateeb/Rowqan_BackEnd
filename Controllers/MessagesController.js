// controllers/messageController.js
const Messages = require('../Models/MessageModel');
const Users = require('../Models/UsersModel');

// دالة إرسال الرسالة
exports.createMessage = async (req, res) => {
  try {
    const { senderId, receiverId, message, lang } = req.body;

    if (!senderId || !receiverId || !message || !lang) {
      return res.status(400).json({ message: 'All fields are required: senderId, receiverId, message, lang' });
    }

    // إنشاء الرسالة في قاعدة البيانات
    const newMessage = await Messages.create({
      senderId,
      receiverId,
      message,
      lang,
    });

    // نشر الرسالة عبر الـ Socket للمستلم
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

// دالة استرجاع الرسائل بين المستخدمين
exports.getMessagesBetweenUsers = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    if (!senderId || !receiverId) {
      return res.status(400).json({ message: 'Both senderId and receiverId are required' });
    }

    // استرجاع الرسائل بين المستخدمين من قاعدة البيانات
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

    // إرسال الرسائل عبر الـ Socket للمستلمين
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

// دالة استرجاع الرسائل المرسلة
exports.getSentMessages = async (req, res) => {
  try {
    const { senderId } = req.params;

    if (!senderId) {
      return res.status(400).json({ message: 'senderId is required' });
    }

    // استرجاع الرسائل المرسلة
    const messages = await Messages.findAll({
      where: { senderId },
      include: [
        { model: Users, as: 'Receiver', attributes: ['id', 'name', 'email'] },
      ],
      order: [['id', 'ASC']],
    });

    res.status(200).json({ message: 'Sent messages retrieved successfully', data: messages });

    // إرسال الرسائل عبر الـ Socket
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

// دالة استرجاع الرسائل المستلمة
exports.getReceivedMessages = async (req, res) => {
  try {
    const { receiverId } = req.params;

    if (!receiverId) {
      return res.status(400).json({ message: 'receiverId is required' });
    }

    // استرجاع الرسائل المستلمة
    const messages = await Messages.findAll({
      where: { receiverId },
      include: [
        { model: Users, as: 'Sender', attributes: ['id', 'name', 'email'] },
      ],
      order: [['id', 'ASC']],
    });

    res.status(200).json({ message: 'Received messages retrieved successfully', data: messages });

    // إرسال الرسائل عبر الـ Socket
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

// دالة حذف الرسالة
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    if (!messageId) {
      return res.status(400).json({ message: 'messageId is required' });
    }

    // حذف الرسالة من قاعدة البيانات
    const deleted = await Messages.destroy({ where: { id: messageId } });

    if (!deleted) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // نشر الحدث عبر الـ Socket عند حذف الرسالة
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
