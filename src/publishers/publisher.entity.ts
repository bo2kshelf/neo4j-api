import {Directive, Field, ID, ObjectType} from '@nestjs/graphql';
import {BookEntity} from '../books/entities/book.entity';

@ObjectType('Publisher')
@Directive('@key(fields: "id")')
export class PublisherEntity {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  name!: string;
}

@ObjectType('Publication')
export class PublicationEntity {
  @Field(() => PublisherEntity)
  publisher!: PublisherEntity;

  @Field(() => BookEntity)
  book!: BookEntity;
}
