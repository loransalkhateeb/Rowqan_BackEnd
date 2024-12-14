const request = require('supertest');
const app = require('../server'); 
const  Sub_Events  = require('../Models/SubEventsModel'); 
const Available_Events = require('../Models/AvailableEvents')


beforeAll(async () => {
  await Available_Events.sync();
  await Sub_Events.sync();
});


afterAll(async () => {
  await Available_Events.destroy({ where: {} });
  await Sub_Events.destroy({ where: {} });
});


describe('POST /available-events', () => {
  it('should create a new Available Event', async () => {
    const subEvent = await Sub_Events.create({
      title: 'Sub Event Test',
      lang: 'en',
    });

    const response = await request(app)
      .post('/api/available-events')  
      .field('title', 'Test Event')
      .field('no_people', 100)
      .field('price', 200)
      .field('rating', 5)
      .field('location', 'Test Location')
      .field('cashback', 10)
      .field('time', '2024-12-31T00:00:00')
      .field('description', 'Test Description')
      .field('lang', 'en')
      .field('sub_event_id', subEvent.id)
      .attach('image', 'path/to/test/image.jpg');  

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Available Event created successfully');
    expect(response.body.event.title).toBe('Test Event');
  });

  it('should return validation errors for missing fields', async () => {
    const response = await request(app)
      .post('/api/available-events')
      .send({});  

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Validation failed');
  });
});

describe('GET /available-events/:id/:lang', () => {
  it('should return an Available Event by ID and language', async () => {
    const subEvent = await Sub_Events.create({
      title: 'Sub Event Test',
      lang: 'en',
    });

    const event = await Available_Events.create({
      title: 'Test Event',
      no_people: 100,
      price: 200,
      rating: 5,
      location: 'Test Location',
      cashback: 10,
      time: '2024-12-31T00:00:00',
      description: 'Test Description',
      lang: 'en',
      sub_event_id: subEvent.id,
    });

    const response = await request(app)
      .get(`/api/available-events/${event.id}/en`); 

    expect(response.status).toBe(200);
    expect(response.body[0].title).toBe('Test Event');
  });

  it('should return a 404 error if event not found', async () => {
    const response = await request(app)
      .get('/api/available-events/999/en');  

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Available Event with id 999 and language en not found');
  });
});


describe('PUT /available-events/:id', () => {
  it('should update an Available Event', async () => {
    const subEvent = await Sub_Events.create({
      title: 'Sub Event Test',
      lang: 'en',
    });

    const event = await Available_Events.create({
      title: 'Test Event',
      no_people: 100,
      price: 200,
      rating: 5,
      location: 'Test Location',
      cashback: 10,
      time: '2024-12-31T00:00:00',
      description: 'Test Description',
      lang: 'en',
      sub_event_id: subEvent.id,
    });

    const response = await request(app)
      .put(`/api/available-events/${event.id}`)
      .send({
        title: 'Updated Event',
        no_people: 200,
        price: 300,
        rating: 4,
        location: 'Updated Location',
        cashback: 20,
        time: '2025-01-01T00:00:00',
        description: 'Updated Description',
        lang: 'en',
        sub_event_id: subEvent.id,
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Available Event updated successfully');
    expect(response.body.event.title).toBe('Updated Event');
  });

  it('should return 404 if event not found', async () => {
    const response = await request(app)
      .put('/api/available-events/999')
      .send({
        title: 'Non-existent Event',
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Available Event not found');
  });
});


describe('DELETE /available-events/:id/:lang', () => {
  it('should delete an Available Event', async () => {
    const subEvent = await Sub_Events.create({
      title: 'Sub Event Test',
      lang: 'en',
    });

    const event = await Available_Events.create({
      title: 'Test Event',
      no_people: 100,
      price: 200,
      rating: 5,
      location: 'Test Location',
      cashback: 10,
      time: '2024-12-31T00:00:00',
      description: 'Test Description',
      lang: 'en',
      sub_event_id: subEvent.id,
    });

    const response = await request(app)
      .delete(`/api/available-events/${event.id}/en`);  

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Available Event deleted successfully');
  });

  it('should return 404 if event to delete not found', async () => {
    const response = await request(app)
      .delete('/api/available-events/999/en');  

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Available Event not found');
  });
});
