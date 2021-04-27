import {ArgsType, Field, ID, InputType, Int, ObjectType} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';
import {PublicationEntity} from '../../entities/publication.entity';

@InputType()
export class PublisherPublishedBooksArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.ASC})
  title!: OrderBy;
}

@ArgsType()
export class PublisherPublishedBooksArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;

  @Field(() => [ID!], {nullable: true, defaultValue: []})
  except!: string[];

  @Field(() => PublisherPublishedBooksArgsOrderBy, {
    nullable: true,
    defaultValue: new PublisherPublishedBooksArgsOrderBy(),
  })
  orderBy!: PublisherPublishedBooksArgsOrderBy;
}

@ObjectType()
export class PublisherPublishedBooksReturnType {
  @Field(() => [PublicationEntity])
  nodes!: PublicationEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}
