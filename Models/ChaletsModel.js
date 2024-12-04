const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');
const chaletsImages = require('../Models/ChaletsImagesModel');
const BreifDetailsChalets = require('../Models/BreifDetailsChalets');
const RightTimeModel = require('../Models/RightTimeModel');
const ReservationDate = require('../Models/ReservationDatesModel');
const Status = require('../Models/StatusModel');
const ChaletsDetails = require('../Models/ChaletsDetails')
const ReservationsModel = require('../Models/ReservationsModel')


const Chalet = sequelize.define('Chalet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reserve_price:{
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  lang: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['ar', 'en']],
    },
  },
}, {
  timestamps: false, 
});


Chalet.hasMany(chaletsImages, { foreignKey: 'chalet_id', onDelete: 'CASCADE' });
chaletsImages.belongsTo(Chalet, { foreignKey: 'chalet_id' });

Chalet.hasMany(BreifDetailsChalets, { foreignKey: 'chalet_id', onDelete: 'CASCADE' });
BreifDetailsChalets.belongsTo(Chalet, { foreignKey: 'chalet_id' });

Chalet.hasMany(RightTimeModel, { foreignKey: 'chalet_id', onDelete: 'CASCADE' });
RightTimeModel.belongsTo(Chalet, { foreignKey: 'chalet_id' });

Chalet.hasMany(ReservationDate, { foreignKey: 'chalet_id', onDelete: 'CASCADE' });
ReservationDate.belongsTo(Chalet, { foreignKey: 'chalet_id' });


Chalet.belongsTo(Status, { foreignKey: 'status_id' });
Status.hasOne(Chalet, { foreignKey: 'status_id'});



Chalet.hasMany(ChaletsDetails, { foreignKey: 'chalet_id', onDelete: 'CASCADE' });
ChaletsDetails.belongsTo(Chalet, { foreignKey: 'chalet_id' });



Chalet.hasMany(ReservationsModel, { foreignKey: 'Chalet_id' });
ReservationsModel.belongsTo(Chalet, { foreignKey: 'Chalet_id' });




module.exports = Chalet;
