import {ArgsType, Field, ID, InputType, Int, ObjectType} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';
import {LabelingEntity} from '../../entities/labeling.entity';

@InputType()
export class LabelLabeledBooksArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.ASC})
  title!: OrderBy;
}

@ArgsType()
export class LabelsLabeledBooksArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;

  @Field(() => [ID!], {nullable: true, defaultValue: []})
  except!: string[];

  @Field(() => LabelLabeledBooksArgsOrderBy, {
    nullable: true,
    defaultValue: new LabelLabeledBooksArgsOrderBy(),
  })
  orderBy!: LabelLabeledBooksArgsOrderBy;
}

@ObjectType()
export class LabelLabeledBooksReturnType {
  @Field(() => [LabelingEntity])
  nodes!: LabelingEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}
