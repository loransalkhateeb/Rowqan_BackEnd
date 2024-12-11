'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Chalets', 'reserve_price', {
      type: Sequelize.FLOAT,  // Use the correct data type for your use case
      allowNull: false,         // Change to false if you want it to be non-nullable
    });
  },

  down: async (queryInterface, Sequelize) => {
    // In case you need to rollback the migration, you can remove the column
    await queryInterface.removeColumn('Chalets', 'reserve_price');
  }
};
