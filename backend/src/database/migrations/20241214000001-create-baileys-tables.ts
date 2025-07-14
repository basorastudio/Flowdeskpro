import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.createTable("Baileys", {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        whatsappId: {
          type: DataTypes.INTEGER,
          references: { model: "Whatsapps", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          allowNull: false
        },
        contacts: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        chats: {
          type: DataTypes.TEXT,
          allowNull: true
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false
        }
      }),

      queryInterface.createTable("BaileysChats", {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        whatsappId: {
          type: DataTypes.INTEGER,
          references: { model: "Whatsapps", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          allowNull: false
        },
        jid: {
          type: DataTypes.STRING,
          allowNull: false
        },
        conversationTimestamp: {
          type: DataTypes.BIGINT,
          allowNull: false
        },
        unreadCount: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          allowNull: false
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false
        }
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.dropTable("BaileysChats"),
      queryInterface.dropTable("Baileys")
    ]);
  }
};