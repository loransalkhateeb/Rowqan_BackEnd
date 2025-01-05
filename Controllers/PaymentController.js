const  Payments  = require('../Models/Payments');
const  Users  = require('../Models/UsersModel');
const  ReservationChalets  = require('../Models/Reservations_Chalets');
const { client } = require('../Utils/redisClient');
const { validateInput, ErrorResponse } = require('../Utils/validateInput');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createPayment = async (req, res) => {
    try {
      const { user_id, reservation_id, status, paymentMethod } = req.body;
  
      if (!user_id || !reservation_id || !status || !paymentMethod) {
        return res
          .status(400)
          .json(
            ErrorResponse('Validation failed', [
              'User, reservation, status, and paymentMethod are required.',
            ])
          );
      }
  
      const validationErrors = validateInput({ status, paymentMethod });
      if (validationErrors.length > 0) {
        return res
          .status(400)
          .json(ErrorResponse('Validation failed', validationErrors));
      }
  
      const user = await Users.findByPk(user_id);
      const reservation = await ReservationChalets.findByPk(reservation_id);
  
      if (!user || !reservation) {
        return res
          .status(404)
          .json(
            ErrorResponse('Validation failed', [
              'User or Reservation not found.',
            ])
          );
      }
  
      const newPayment = await Payments.create({
        user_id,
        reservation_id,
        status,
        paymentMethod,
      });
  
      res.status(201).json({
        message: 'Payment created successfully',
        payment: newPayment,
      });
    } catch (error) {
      console.error('Error in createPayment:', error.message);
      res
        .status(500)
        .json(
          ErrorResponse('Failed to create payment', [
            'An internal server error occurred.',
          ])
        );
    }
  };
  


  const axios = require('axios');


  exports.createPaymentIntent = async (req, res) => {
    try {
      const { amount, currency, phone, payment_type } = req.body;
      
      if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).send({ error: 'Invalid amount provided.' });
      }
  
      let convertedAmount = amount; 
  

      let paymentDescription = "";
  
      if (payment_type === "initial") {
        
      if (currency === 'jod') {
        const response = await axios.get('https://v6.exchangerate-api.com/v6/48fb1b6e8b9bab92bb9abe37/latest/USD');
        const exchangeRate = response.data.conversion_rates.JOD;  
        convertedAmount = amount * exchangeRate;
      }
  
     
      const paymentIntent = await stripe.paymentIntents.create({
        amount: convertedAmount * 100, 
        currency: currency === 'jod' ? 'jod' : 'usd',
        payment_method_types: ['card'],
        description: paymentDescription, 
      });
  
      res.send({
        clientSecret: paymentIntent.client_secret,
        referenceId: paymentIntent.id,
        phone: phone, 
      });
      } else if (payment_type === "total") {
       
      if (currency === 'jod') {
        const response = await axios.get('https://v6.exchangerate-api.com/v6/48fb1b6e8b9bab92bb9abe37/latest/USD');
        const exchangeRate = response.data.conversion_rates.JOD;  
        convertedAmount = amount * exchangeRate;
      }
  
     
      const paymentIntent = await stripe.paymentIntents.create({
        amount: convertedAmount * 100, 
        currency: currency === 'jod' ? 'jod' : 'usd',
        payment_method_types: ['card'],
        description: paymentDescription, 
      });
  
      res.send({
        clientSecret: paymentIntent.client_secret,
        referenceId: paymentIntent.id,
        phone: phone, 
      });
      } else {
        return res.status(400).send({ error: "Invalid payment type. Please specify either 'initial' or 'total'." });
      }
  
    } catch (error) {
      console.error('Stripe Error:', error);
      res.status(400).send({ error: error.message });
    }
  };
  
  
  





exports.getPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const cacheKey = `payments:page:${page}:limit:${limit}`;

    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    const payments = await Payments.findAll({
      include: [
        { model: Users, attributes: ['id', 'name', 'email'] },
        { model: ReservationChalets, attributes: ['id', 'total_amount'] },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    await client.setEx(cacheKey, 3600, JSON.stringify(payments));
    res.status(200).json(payments);
  } catch (error) {
    console.error('Error in getPayments:', error.message);
    res
      .status(500)
      .json(
        ErrorResponse('Failed to fetch payments', [
          'An internal server error occurred.',
        ])
      );
  }
};


exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `payment:${id}`;

    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    const payment = await Payments.findOne({
      include: [
        { model: Users, attributes: ['id', 'name', 'email'] },
        { model: ReservationChalets, attributes: ['id', 'total_amount'] },
      ],
      where: { id },
    });

    if (!payment) {
      return res
        .status(404)
        .json(
          ErrorResponse('Payment not found', [
            'No payment found with the given ID.',
          ])
        );
    }

    await client.setEx(cacheKey, 3600, JSON.stringify(payment));
    res.status(200).json(payment);
  } catch (error) {
    console.error('Error in getPaymentById:', error.message);
    res
      .status(500)
      .json(
        ErrorResponse('Failed to fetch payment', [
          'An internal server error occurred.',
        ])
      );
  }
};


exports.updatePayment = async (req, res) => {
    try {
      const { id } = req.params;
      const { status, paymentMethod } = req.body;
  
      const validationErrors = validateInput({ status, paymentMethod });
      if (validationErrors.length > 0) {
        return res
          .status(400)
          .json(ErrorResponse('Validation failed', validationErrors));
      }
  
      const payment = await Payments.findByPk(id);
      if (!payment) {
        return res
          .status(404)
          .json(
            ErrorResponse('Payment not found', [
              'No payment found with the given ID.',
            ])
          );
      }
  
      await payment.update({ status, paymentMethod });
  
      const updatedData = payment.toJSON();
  
      res.status(200).json({
        message: 'Payment updated successfully',
        payment: updatedData,
      });
    } catch (error) {
      console.error('Error in updatePayment:', error.message);
      res
        .status(500)
        .json(
          ErrorResponse('Failed to update payment', [
            'An internal server error occurred.',
          ])
        );
    }
  };
  


exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payments.findByPk(id);
    if (!payment) {
      return res
        .status(404)
        .json(
          ErrorResponse('Payment not found', [
            'No payment found with the given ID.',
          ])
        );
    }

    await payment.destroy();

    const cacheKey = `payment:${id}`;
    await client.del(cacheKey);

    res.status(200).json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error in deletePayment:', error.message);
    res
      .status(500)
      .json(
        ErrorResponse('Failed to delete payment', [
          'An internal server error occurred.',
        ])
      );
  }
};
