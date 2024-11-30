const Services = require('../Models/ServicesModel');  
const path = require('path');  

exports.createService = async (req, res) => {
  try {
    const { title, status_service, lang } = req.body;
    const image = req.file ? req.file.filename : null; 

 
    if (!title || !lang || !status_service) {
      return res.status(400).json({ error: 'Title, status_service, and language are required' });
    }

   
    const existingService = await Services.findOne({ where: { title, lang } });
    if (existingService) {
      return res.status(400).json({ error: 'Service with the same title and language already exists' });
    }

    const newService = await Services.create({
      title,
      status_service,
      lang,
      image,
    });

    res.status(201).json({
      message: 'Service created successfully',
      service: newService,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create service' });
  }
};


exports.getAllServices = async (req, res) => {
  try {
    const { lang } = req.params;  

    const services = await Services.findAll({ where: { lang } });

    if (!services.length) {
      return res.status(404).json({ error: 'No services found for this language' });
    }

    res.status(200).json({ services });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve services' });
  }
};

exports.getServiceByStatus = async (req, res) => {
  try {
    const { lang } = req.params; 
    const { status_service } = req.body;  

    if (!status_service) {
      return res.status(400).json({ error: 'status_service is required' });
    }

    const services = await Services.findAll({
      where: { 
        lang,
        status_service 
      }
    });
    if (!services.length) {
      return res.status(404).json({ error: 'No services found for this language and status' });
    }

    res.status(200).json({ services });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve services' });
  }
};


exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;  
    const { title, status_service,lang } = req.body;
    const image = req.file ? req.file.filename : null; 

    const service = await Services.findOne({ where: { id } });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }


    service.title = title || service.title;
    service.status_service = status_service || service.status_service;
    service.lang = lang || service.lang;
    service.image = image || service.image; 


    await service.save();

    res.status(200).json({ message: 'Service updated successfully', service });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update service' });
  }
};


exports.getServiceById = async (req, res) => {
    try {
      const { id, lang } = req.params;
  
      const service = await Services.findOne({ where: { id, lang } });
  
      if (!service) {
        return res.status(404).json({ error: `Service with id ${id} and language ${lang} not found` });
      }

      res.status(200).json({ service });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch service' });
    }
  };
  

exports.deleteService = async (req, res) => {
  try {
    const { id, lang } = req.params; 


    const service = await Services.findOne({ where: { id, lang } });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }


    await service.destroy();

    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
};
