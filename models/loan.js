'use strict';

const dateFormat= require('dateformat');

module.exports = (sequelize, DataTypes) => {
  const Loan = sequelize.define('Loan', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    book_id: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: {
          msg: "A book is required"
        }
      }
    },
    patron_id:{
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: {
          msg: "A patron is required"
        }
      }
    },
    loaned_on: {
      type: DataTypes.DATEONLY,
      validate:{
        isDate:{
          msg: 'Loaned on must be a valid date'
        }
      }
    },
    return_by: {
      type: DataTypes.DATEONLY,
      validate:{
        isDate:{
          msg: 'Return by must be a valid date'
        }
      }
    },
    returned_on: {
      type: DataTypes.DATEONLY,
      validate:{
        isDate:{
          msg: 'Returned on must be a valid date'
        }
      }
    }
  }, {
    timestamps: false
  });
  Loan.associate = function(models) {
    // associations can be defined here
    Loan.belongsTo(models.Book, {
     foreignKey: 'book_id'
    }),
    Loan.belongsTo(models.Patron, {
     foreignKey: 'patron_id'
    })
  };

  Loan.prototype.loanedOn = function() {
    console.log('executing loanedOn');
    return dateFormat(this.loaned_on, "YYYY-mm-dd");
  };

  Loan.prototype.returnedOn = function() {
    console.log('executing returnedOn');
    return dateFormat(this.returned_on , "YYYY-mm-dd");
  };

  Loan.prototype.returnBy = function() {
    return dateFormat(this.return_by, "YYYY-mm-dd");
  };
  return Loan;
};
