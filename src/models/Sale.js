export const Sale = (sequelize, DataTypes) => {
  return sequelize.define("sale", {
    sale_code: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    seller: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    selling_elec: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    selling_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });
};
