import { Field, Int, ObjectType } from 'type-graphql';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'user',
})
@ObjectType()
export class User {
  @PrimaryGeneratedColumn()
  @Field(of => Int)
  id: number;

  @Column()
  @Field()
  name: string;
}
