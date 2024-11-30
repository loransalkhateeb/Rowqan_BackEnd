'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Chalets', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      image: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lang: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isIn: [['ar', 'en']], 
        },
      },
    });

 
    await queryInterface.createTable('ChaletsImages', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      chalet_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Chalets',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      image: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });

    await queryInterface.createTable('BreifDetailsChalets', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      chalet_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Chalets',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      details: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
    });

    await queryInterface.createTable('RightTimeModels', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      chalet_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Chalets',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      time: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });

    await queryInterface.createTable('ReservationDates', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      chalet_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Chalets',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('Status', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      chalet_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Chalets',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Chalets');
    await queryInterface.dropTable('ChaletsImages');
    await queryInterface.dropTable('BreifDetailsChalets');
    await queryInterface.dropTable('RightTimeModels');
    await queryInterface.dropTable('ReservationDates');
    await queryInterface.dropTable('Status');
  }
};
