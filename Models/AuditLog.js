const { DataTypes } = require('sequelize');
const sequelize = require('../Config/dbConnect');

const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 255] 
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true, 
    },
    details: {
        type: DataTypes.TEXT, 
        allowNull: true
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, 
        allowNull: false
    }
}, {
    timestamps: false, 
    tableName: 'audit_logs' 
});

module.exports = AuditLog;