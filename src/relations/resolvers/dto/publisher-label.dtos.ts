import {ArgsType, Field, ID, InputType, Int, ObjectType} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';
import {PublisherLabelRelationEntity} from '../../entities/publisher-label.entity';

@InputType('PublishersLabelsArgsOrderBy')
export class ResolvePublishersLabelsArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.ASC})
  name!: OrderBy;
}

@ArgsType()
export class ResolvePublishersLabelsArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;

  @Field(() => [ID!], {nullable: true, defaultValue: []})
  except!: string[];

  @Field(() => ResolvePublishersLabelsArgsOrderBy, {
    nullable: true,
    defaultValue: new ResolvePublishersLabelsArgsOrderBy(),
  })
  orderBy!: ResolvePublishersLabelsArgsOrderBy;
}

@ObjectType('PublishersLabelsReturn')
export class ResolvePublishersLabelsReturn {
  @Field(() => [PublisherLabelRelationEntity])
  nodes!: PublisherLabelRelationEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}
