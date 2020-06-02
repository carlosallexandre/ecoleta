import express from 'express';

const app = express();

app.get('/users', (request, response) => {
  return response.json([
    'Diego',
    'Cleiton',
    'Robson',
  ]);
});

app.listen(3333, () => {
  console.log('Server is running...');
});
