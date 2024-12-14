const { validateInput, ErrorResponse } = require('../Utils/validateInput');
const RightTimeModel = require('../Models/RightTimeModel');
const Chalet = require('../Models/ChaletsModel');
const ReservationDate = require('../Models/ReservationDatesModel');


exports.createRightTime = async (req, res) => {
    try {
        const { name, time, lang, chalet_id, price } = req.body;
        const image = req.file ? req.file.filename : null;

    
        const validationErrors = validateInput({ name, time, lang, chalet_id, price });
        if (validationErrors.length > 0) {
            return res.status(400).json(new ErrorResponse('Validation failed', validationErrors));
        }

      
        if (!['en', 'ar'].includes(lang)) {
            return res.status(400).json(new ErrorResponse('Invalid language'));
        }

     
        const chalet = await Chalet.findByPk(chalet_id);
        if (!chalet) {
            return res.status(404).json(new ErrorResponse('Chalet not found'));
        }

     
        const newRightTime = await RightTimeModel.create({
            image,
            name,
            time,
            lang,
            chalet_id,
            price
        });

        
        return res.status(201).json({
            message: 'RightTime created successfully',
            rightTime: newRightTime
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ErrorResponse('Internal server error'));
    }
};


exports.getRightTimeById = async (req, res) => {
    try {
        const { id, lang } = req.params;

        const rightTime = await RightTimeModel.findOne({
            where: { id, lang },
            include: [
                { model: Chalet },
                { model: ReservationDate }
            ]
        });

        if (!rightTime) {
            return res.status(404).json(new ErrorResponse('RightTime not found'));
        }

        return res.status(200).json({ rightTime });
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ErrorResponse('Internal server error'));
    }
};


exports.getAllRightTimesByChaletId = async (req, res) => {
    try {
        const { chalet_id, lang } = req.params;

        const chalet = await Chalet.findByPk(chalet_id);
        if (!chalet) {
            return res.status(404).json(new ErrorResponse('Chalet not found'));
        }

        const rightTimes = await RightTimeModel.findAll({
            where: { chalet_id, lang },
            include: [
                { model: ReservationDate }
            ]
        });

        if (rightTimes.length === 0) {
            return res.status(404).json(new ErrorResponse('No RightTimes found for this chalet in the specified language'));
        }

        return res.status(200).json({ rightTimes });
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ErrorResponse('Internal server error'));
    }
};


exports.updateRightTime = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, time, lang, chalet_id, price } = req.body;
        const image = req.file ? req.file.filename : null;

     
        const validationErrors = validateInput({ name, time, lang, chalet_id, price });
        if (validationErrors.length > 0) {
            return res.status(400).json(new ErrorResponse('Validation failed', validationErrors));
        }

        const rightTime = await RightTimeModel.findByPk(id);
        if (!rightTime) {
            return res.status(404).json(new ErrorResponse('RightTime not found'));
        }

      
        rightTime.name = name || rightTime.name;
        rightTime.time = time || rightTime.time;
        rightTime.lang = lang || rightTime.lang;
        rightTime.chalet_id = chalet_id !== undefined ? chalet_id : rightTime.chalet_id;
        rightTime.price = price || rightTime.price;
        rightTime.image = image || rightTime.image;

        await rightTime.save();

        return res.status(200).json({
            message: 'RightTime updated successfully',
            rightTime
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ErrorResponse('Internal server error'));
    }
};


exports.deleteRightTime = async (req, res) => {
    try {
        const { id, lang } = req.params;

        const rightTime = await RightTimeModel.findOne({ where: { id, lang } });
        if (!rightTime) {
            return res.status(404).json(new ErrorResponse('RightTime not found'));
        }

        await rightTime.destroy();

        return res.status(200).json({ message: 'RightTime deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ErrorResponse('Internal server error'));
    }
};


exports.get = async (req, res) => {
    try {
        const { lang } = req.params;

        const rightTimes = await RightTimeModel.findAll({
            where: { lang },
            include: [
                { model: Chalet },
                { model: ReservationDate }
            ]
        });

        if (rightTimes.length === 0) {
            return res.status(404).json(new ErrorResponse('No RightTimes found for this language'));
        }

        return res.status(200).json({ rightTimes });
    } catch (error) {
        console.error(error);
        return res.status(500).json(new ErrorResponse('Internal server error'));
    }
};
