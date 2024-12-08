const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');
const Chalets = require('../Models/ChaletsModel'); 

const Chalets_Props = sequelize.define('Chalets_Props', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lang: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: false,
});


Chalets.hasMany(Chalets_Props, { foreignKey: 'Chalet_Id' });
Chalets_Props.belongsTo(Chalets, { foreignKey: 'Chalet_Id' });

module.exports = Chalets_Props;
