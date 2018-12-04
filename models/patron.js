'use strict';
module.exports = (sequelize, DataTypes) => {
  const Patron = sequelize.define('Patron', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    first_name: {
      type:DataTypes.STRING,
      validate:{
        notEmpty:{
          msg: 'First name must be specified'
        },
        noNumbers: function(str){
           // Don't allow number
           if (str.match(/\d/g)) {
             throw new Error('Please enter a first name with numbers');
           }
         }
      }
    },
    last_name:  {
      type:DataTypes.STRING,
      validate:{
        notEmpty:{
          msg: 'Last name must be specified'
        },
        noNumbers: function(str){
           // Don't allow number
           if (str.match(/\d/g)) {
             throw new Error('Please enter a last name with numbers');
           }
         }
       }
    },
    address:  {
      type:DataTypes.STRING,
      validate:{
        notEmpty:{
          msg: 'Address must be specified'
        }
      }
    },
    email: {
      type:DataTypes.STRING,
      validate:{
        isEmail: {
          msg: 'Must be a valid email'
        },
        notEmpty:{
          msg: 'Email address cannot be empty'
        }
      }
    },
    library_id: {
      type:DataTypes.STRING,
      validate:{
        notEmpty:{
          msg: 'Library ID must be specified'
        }
      }
    },
    zip_code: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: {
          msg: "A Zip Code is required"
        }
      }
    }
  }, {
    timestamps: false
});
Patron.associate = function(models) {
  // associations can be defined here
  Patron.hasMany(models.Loan, {
    foreignKey: 'patron_id'
  })
};
  return Patron;
};
