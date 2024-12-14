const { validateInput, ErrorResponse } = require('../Utils/validateInput');
const Messages = require('../Models/MessageModel');
const Users = require('../Models/UsersModel');


exports.createMessage = async (req, res) => {
    try {
        const { Message, lang, User_Id } = req.body;

        
        const validationErrors = validateInput({ Message, lang, User_Id });
        if (validationErrors.length > 0) {
            return res.status(400).json(new ErrorResponse('Validation failed', validationErrors));
        }

        
        const user = await Users.findByPk(User_Id);
        if (!user) {
            return res.status(404).json(ErrorResponse('User not found.'));
        }

    
        const newMessage = await Messages.create({
            Message,
            lang,
            User_Id
        });

        return res.status(201).json({
            message: 'Message created successfully',
            data: newMessage
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json(ErrorResponse('Internal server error'));
    }
};


exports.getMessagesByLanguage = async (req, res) => {
    try {
        const { lang } = req.params;

        const messages = await Messages.findAll({
            where: { lang },
            include: [{ model: Users }]
        });

        if (messages.length === 0) {
            return res.status(404).json(ErrorResponse('No messages found in the specified language.'));
        }

        return res.status(200).json({ messages });
    } catch (error) {
        console.error(error);
        return res.status(500).json(ErrorResponse('Internal server error'));
    }
};



exports.getMessageById = async (req, res) => {
    try {
        const { id } = req.params;

        const message = await Messages.findOne({
            where: { id },
            include: [{ model: Users }]
        });

        if (!message) {
            return res.status(404).json(ErrorResponse('Message not found.'));
        }

        return res.status(200).json({ message });
    } catch (error) {
        console.error(error);
        return res.status(500).json(ErrorResponse('Internal server error'));
    }
};


exports.updateMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { Message, lang } = req.body;

       
        const validationErrors = validateInput({ Message, lang });
        if (validationErrors.length > 0) {
            return res.status(400).json(new ErrorResponse('Validation failed', validationErrors));
        }

        const message = await Messages.findByPk(id);
        if (!message) {
            return res.status(404).json(ErrorResponse('Message not found.'));
        }

        
        message.Message = Message || message.Message;
        message.lang = lang || message.lang;

        await message.save();

        return res.status(200).json({
            message: 'Message updated successfully',
            data: message
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json(ErrorResponse('Internal server error'));
    }
};


exports.deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;

        const message = await Messages.findByPk(id);
        if (!message) {
            return res.status(404).json(ErrorResponse('Message not found.'));
        }

        await message.destroy();

        return res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json(ErrorResponse('Internal server error'));
    }
};


exports.getMessagesByUserId = async (req, res) => {
    try {
        const { User_Id } = req.params;

        const user = await Users.findByPk(User_Id);
        if (!user) {
            return res.status(404).json(ErrorResponse('User not found.'));
        }

        const messages = await Messages.findAll({
            where: { User_Id },
            include: [{ model: Users }]
        });

        if (messages.length === 0) {
            return res.status(404).json(ErrorResponse('No messages found for this user.'));
        }

        return res.status(200).json({ messages });
    } catch (error) {
        console.error(error);
        return res.status(500).json(ErrorResponse('Internal server error'));
    }
};
