const { validateInput, ErrorResponse } = require('../Utils/validateInput');
const Services = require('../Models/ServicesModel');
const path = require('path');

exports.createService = async (req, res) => {
  try {
    const { title, status_service, url, lang } = req.body;
    const image = req.file ? req.file.filename : null;

   
    const validationErrors = validateInput({ title, status_service, url, lang });
    if (validationErrors) {
      return res.status(400).json(validationErrors);
    }

    const existingService = await Services.findOne({ where: { title, lang } });
    if (existingService) {
      return res.status(400).json(new ErrorResponse('Service with the same title and language already exists'));
    }

    const newService = await Services.create({
      title,
      status_service,
      url,
      lang,
      image,
    });

    res.status(201).json({
      message: 'Service created successfully',
      service: newService,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to create service'));
  }
};

exports.getAllServices = async (req, res) => {
  try {
    const { lang } = req.params;

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json(new ErrorResponse('Invalid language'));
    }

    const services = await Services.findAll({ where: { lang } });

    if (!services.length) {
      return res.status(404).json(new ErrorResponse('No services found for this language'));
    }

    res.status(200).json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to retrieve services'));
  }
};

exports.getServiceByStatus = async (req, res) => {
  try {
    const { status_service, lang } = req.params;

    
    if (!status_service || !lang) {
      return res.status(400).json(new ErrorResponse('status_service and lang are required'));
    }

    const services = await Services.findAll({
      where: {
        lang,
        status_service
      }
    });

    if (services.length === 0) {
      return res.status(404).json(new ErrorResponse(`No services found for language: ${lang} and status: ${status_service}`));
    }

    res.status(200).json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to retrieve services'));
  }
};

exports.getServiceByStatusOnlyLang = async (req, res) => {
  try {
    const { lang } = req.params;

    
    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json(new ErrorResponse('Invalid language'));
    }

    const services = await Services.findAll({
      where: { lang }
    });

    if (!services.length) {
      return res.status(404).json(new ErrorResponse('No services found for this language'));
    }

    res.status(200).json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to retrieve services'));
  }
};

exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status_service, url, lang } = req.body;
    const image = req.file ? req.file.filename : null;

    const service = await Services.findOne({ where: { id } });

    if (!service) {
      return res.status(404).json(new ErrorResponse('Service not found'));
    }

 
    const validationErrors = validateInput({ title, status_service, url, lang });
    if (validationErrors) {
      return res.status(400).json(validationErrors);
    }

    service.title = title || service.title;
    service.status_service = status_service || service.status_service;
    service.url = url || service.url;
    service.lang = lang || service.lang;
    service.image = image || service.image;

    await service.save();

    res.status(200).json({ message: 'Service updated successfully', service });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to update service'));
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const { id, lang } = req.params;

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json(new ErrorResponse('Invalid language'));
    }

    const service = await Services.findOne({ where: { id, lang } });

    if (!service) {
      return res.status(404).json(new ErrorResponse(`Service with id ${id} and language ${lang} not found`));
    }

    res.status(200).json({ service });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to fetch service'));
  }
};

exports.deleteService = async (req, res) => {
  try {
    const { id, lang } = req.params;

    if (!['en', 'ar'].includes(lang)) {
      return res.status(400).json(new ErrorResponse('Invalid language'));
    }

    const service = await Services.findOne({ where: { id, lang } });

    if (!service) {
      return res.status(404).json(new ErrorResponse('Service not found'));
    }

    await service.destroy();

    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json(new ErrorResponse('Failed to delete service'));
  }
};
