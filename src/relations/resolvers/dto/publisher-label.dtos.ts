import {ArgsType, Field, ID, InputType, Int, ObjectType} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';
import {PublisherLabelRelationEntity} from '../../entities/publisher-label.entity';

@InputType()
export class PublisherHasLabelsArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.ASC})
  name!: OrderBy;
}

@ArgsType()
export class PublisherHasLabelsArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;

  @Field(() => [ID!], {nullable: true, defaultValue: []})
  except!: string[];

  @Field(() => PublisherHasLabelsArgsOrderBy, {
    nullable: true,
    defaultValue: new PublisherHasLabelsArgsOrderBy(),
  })
  orderBy!: PublisherHasLabelsArgsOrderBy;
}

@ObjectType()
export class PublisherHasLabelsReturnType {
  @Field(() => [PublisherLabelRelationEntity])
  nodes!: PublisherLabelRelationEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}
