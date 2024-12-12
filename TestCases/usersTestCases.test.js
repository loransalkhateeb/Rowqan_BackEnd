const request = require('supertest');
const app = require('../server');
const { User } = require('../Models/UsersModel');


jest.mock('../Models/UsersModel');

describe('User Controller', () => {
  let token;

  beforeAll(async () => {
   
    token = 'mocked_token';
  });

  describe('POST /users', () => {
    it('should create a new user', async () => {
      const mockCreateUser = jest.fn().mockResolvedValue({ id: 1, name: 'John Doe' });
      User.create = mockCreateUser;  

      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          phone_number: '1234567890',
          country: 'US',
          password: 'password123',
          lang: 'en',
          user_type_id: 2,
          RepeatPassword: 'password123',
        });

      expect(mockCreateUser).toHaveBeenCalled(); 
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User created successfully');
    });

    it('should return error if passwords do not match', async () => {
      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          phone_number: '1234567890',
          country: 'US',
          password: 'password123',
          lang: 'en',
          user_type_id: 2,
          RepeatPassword: 'wrongpassword',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toHaveLength(1);
    });
  });


  

  describe('GET /users/:lang', () => {
    it('should fetch all users for the specified language', async () => {
      
      const mockGetUsers = jest.fn().mockResolvedValue([{ id: 1, name: 'John Doe' }]);
      User.findAll = mockGetUsers; 

      const response = await request(app)
        .get('/users/en')
        .set('Authorization', `Bearer ${token}`);

      expect(mockGetUsers).toHaveBeenCalled(); 
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Users fetched successfully');
    });

    it('should return error for invalid language', async () => {
      const response = await request(app)
        .get('/users/invalid')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid language. Please use "ar" or "en".');
    });
  });





  describe('GET /users/:id/:lang', () => {
    it('should fetch a user by ID', async () => {
      const user = { id: 1, name: 'John Doe' };
      const mockGetUserById = jest.fn().mockResolvedValue(user);
      User.findByPk = mockGetUserById; 

      const response = await request(app)
        .get(`/users/${user.id}/en`)
        .set('Authorization', `Bearer ${token}`);

      expect(mockGetUserById).toHaveBeenCalled(); 
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User fetched successfully');
    });

    it('should return error if user not found', async () => {
      const mockGetUserById = jest.fn().mockResolvedValue(null);  
      User.findByPk = mockGetUserById;

      const response = await request(app)
        .get('/users/999/en')
        .set('Authorization', `Bearer ${token}`);

      expect(mockGetUserById).toHaveBeenCalled();
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });
  });





  describe('PUT /users/:id', () => {
    it('should update user details', async () => {
      const user = { id: 1, name: 'John Doe', email: 'john@example.com' };
      const mockUpdateUser = jest.fn().mockResolvedValue({ id: 1, name: 'John Updated' });
      User.update = mockUpdateUser; 

      const response = await request(app)
        .put(`/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'John Updated',
          email: 'johnupdated@example.com',
          phone_number: '1111111111',
          country: 'US',
          password: 'newpassword123',
          lang: 'en',
          user_type_id: 2,
          RepeatPassword: 'newpassword123',
        });

      expect(mockUpdateUser).toHaveBeenCalled(); 
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User updated successfully');
    });

    it('should return error for unauthorized update attempt', async () => {
      const response = await request(app)
        .put('/users/999')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Unauthorized Update',
          email: 'unauthorized@example.com',
          phone_number: '0000000000',
          country: 'US',
          password: 'wrongpassword',
          lang: 'en',
          user_type_id: 2,
          RepeatPassword: 'wrongpassword',
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('You are not authorized to update users');
    });
  });




  describe('DELETE /users/:id', () => {
    it('should delete a user by ID', async () => {
      const user = { id: 1, name: 'John Doe' };
      const mockDeleteUser = jest.fn().mockResolvedValue(1); 
      User.destroy = mockDeleteUser; 

      const response = await request(app)
        .delete(`/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(mockDeleteUser).toHaveBeenCalled(); 
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User deleted successfully');
    });

    it('should return error if user not found', async () => {
      const mockDeleteUser = jest.fn().mockResolvedValue(0); 
      User.destroy = mockDeleteUser; 

      const response = await request(app)
        .delete('/users/999')
        .set('Authorization', `Bearer ${token}`);

      expect(mockDeleteUser).toHaveBeenCalled(); 
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });
  });
});
