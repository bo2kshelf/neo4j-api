import {ObjectType} from '@nestjs/graphql';

@ObjectType('Labeling')
export class LabelingEntity {
  labelId!: string;
  bookId!: string;
}
