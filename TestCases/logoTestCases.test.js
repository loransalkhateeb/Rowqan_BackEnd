
const request = require('supertest');
const app = require('../server'); 
const { Logo } = require('../Models/LogoModel');  

jest.mock('../Models/LogoModel');  





describe('Logo Controller', () => {
  describe('POST /logos', () => {
    it('should create a new logo successfully', async () => {

      Logo.create.mockResolvedValue({ id: 1, image: 'logo.jpg' });

      const response = await request(app)
        .post('/logos')
        .attach('file', 'path/to/logo.jpg');  

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Logo created successfully');
      expect(response.body.hero).toHaveProperty('id', 1);
      expect(response.body.hero).toHaveProperty('image', 'logo.jpg');
    });

    it('should handle error when logo creation fails', async () => {
      Logo.create.mockRejectedValue(new Error('Database Error'));  

      const response = await request(app)
        .post('/logos')
        .attach('file', 'path/to/logo.jpg');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to create Logo');
    });
  });





  describe('GET /logos', () => {
    it('should fetch all logos successfully', async () => {
      const mockLogos = [{ id: 1, image: 'logo1.jpg' }, { id: 2, image: 'logo2.jpg' }];
      Logo.findAll.mockResolvedValue(mockLogos);  

      const response = await request(app).get('/logos');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockLogos);
    });

    it('should handle error when fetching logos fails', async () => {
      Logo.findAll.mockRejectedValue(new Error('Database Error'));  
      const response = await request(app).get('/logos');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch logos');
    });
  });





  describe('GET /logos/:id', () => {
    it('should fetch a logo by ID successfully', async () => {
      const mockLogo = { id: 1, image: 'logo.jpg' };
      Logo.findOne.mockResolvedValue(mockLogo);  

      const response = await request(app).get('/logos/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockLogo);
    });

    it('should return 404 if logo not found', async () => {
      Logo.findOne.mockResolvedValue(null);  

      const response = await request(app).get('/logos/999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Logo not found');
    });

    it('should handle error when fetching logo fails', async () => {
      Logo.findOne.mockRejectedValue(new Error('Database Error'));  

      const response = await request(app).get('/logos/1');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch logo');
    });
  });







  describe('PUT /logos/:id', () => {
    it('should update the logo successfully', async () => {
      const mockLogo = { id: 1, image: 'logo.jpg' };
      Logo.findByPk.mockResolvedValue(mockLogo);  

      const updatedLogo = { image: 'updated_logo.jpg' };
      Logo.save.mockResolvedValue(updatedLogo);  
      const response = await request(app)
        .put('/logos/1')
        .attach('file', 'path/to/updated_logo.jpg');  
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logo updated successfully');
      expect(response.body.logo.image).toBe('updated_logo.jpg');
    });

    it('should return 404 if logo to update is not found', async () => {
      Logo.findByPk.mockResolvedValue(null);  

      const response = await request(app)
        .put('/logos/999')
        .attach('file', 'path/to/updated_logo.jpg');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Logo not found');
    });

    it('should handle error when updating logo fails', async () => {
      Logo.findByPk.mockRejectedValue(new Error('Database Error'));  

      const response = await request(app)
        .put('/logos/1')
        .attach('file', 'path/to/updated_logo.jpg');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to update logo');
    });
  });





  describe('DELETE /logos/:id', () => {
    it('should delete the logo successfully', async () => {
      const mockLogo = { id: 1, image: 'logo.jpg' };
      Logo.findOne.mockResolvedValue(mockLogo);  

      Logo.destroy.mockResolvedValue(1);  

      const response = await request(app).delete('/logos/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logo deleted successfully');
    });

    it('should return 404 if logo to delete is not found', async () => {
      Logo.findOne.mockResolvedValue(null);  

      const response = await request(app).delete('/logos/999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Logo not found');
    });

    it('should handle error when deleting logo fails', async () => {
      Logo.findOne.mockRejectedValue(new Error('Database Error')); 

      const response = await request(app).delete('/logos/1');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to delete logo');
    });
  });
});
