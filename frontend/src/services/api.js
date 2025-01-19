import axios from 'axios';

const railsApi = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true, // Send cookies for authentication
});

const golangApi = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
});

// User APIs
export const login = (credentials) => railsApi.post('/login', credentials);
export const signup = (data) => railsApi.post('/signup', data);

export const logout = () => railsApi.delete('/logout');

export const createLibrarian = (data) =>
  railsApi.post('/users/create_librarian', {
    user: {
      username: data.username,
      email: data.email,
      mobile: data.mobile,
      password: data.password,
      password_confirmation: data.password_confirmation,
    },
  });

export const updateLibrarian = (id, data) =>
  railsApi.put(`/users/${id}/update_librarian`, {
    user: data,
  });

export const deleteLibrarian = (id) => railsApi.delete(`/users/${id}/destroy_librarian`);
export const getLibrarians = async () => {
  try {
    const response = await railsApi.get('/users/view_librarian');
    console.log(response.data) // Update this endpoint if needed
    return response.data; // This should return { librarians: [...] }
  } catch (error) {
    console.error('Error fetching librarians:', error);
    throw error;
  }
};

// Book APIs
export const createBook = (data) => golangApi.post('/books/createBook', data);
export const updateBook = (id, data) => golangApi.put(`/books/updateBook/${id}`, data);
export const deleteBook = (id) => golangApi.delete(`/books/deleteBook/${id}`);
export const getBookById = (id) => golangApi.get(`/books/id/${id}`);
export const getBookByTitle = (title) => golangApi.get(`/books/title/${title}`);
export const getAllBooks = ({ page = 1, limit = 10, search = '' } = {}) =>
  golangApi.get('/books', {
    params: { page, limit, search },
  });
export const viewBorrowHistory = () => golangApi.get('/history');
export const borrowBook = (id) => golangApi.post(`/books/${id}/borrow`);
export const returnBook = (id) => golangApi.post(`/books/${id}/return`);
