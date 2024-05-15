const bcrypt = require('bcrypt'); 

exports.seed = async (knex) => {
  const password = await bcrypt.hash('12345', 10); 

  return knex('users').del()
    .then(() => {
      return knex('users').insert([
        { name: 'Nare', email: 'john.doe@example.com', password },
      ]);
    });
};