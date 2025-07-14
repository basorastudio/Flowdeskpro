import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  Default,
  ForeignKey,
  DataType,
  AutoIncrement,
  BelongsTo
} from "sequelize-typescript";
import Whatsapp from "./Whatsapp";

@Table
class BaileysChats extends Model<BaileysChats> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  jid: string;

  @Column(DataType.BIGINT)
  conversationTimestamp: number;

  @Default(0)
  @Column
  unreadCount: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => Whatsapp)
  @Column(DataType.INTEGER)
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;
}

export default BaileysChats;