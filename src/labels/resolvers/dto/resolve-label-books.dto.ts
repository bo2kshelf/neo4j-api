import {ArgsType, Field, ID, InputType, Int, ObjectType} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';
import {LabelingEntity} from '../../entities/labeling.entity';

@InputType('LabelsBooksArgsOrderBy')
export class ResolveLabelsBooksOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.ASC})
  title!: OrderBy;
}

@ArgsType()
export class ResolveLabelsBooksArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;

  @Field(() => [ID!], {nullable: true, defaultValue: []})
  except!: string[];

  @Field(() => ResolveLabelsBooksOrderBy, {
    nullable: true,
    defaultValue: new ResolveLabelsBooksOrderBy(),
  })
  orderBy!: ResolveLabelsBooksOrderBy;
}

@ObjectType('LabelsBooksReturn')
export class ResolveLabelsBooksReturnEntity {
  @Field(() => [LabelingEntity])
  nodes!: LabelingEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}
