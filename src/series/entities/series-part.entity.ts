import {Field, Float, ObjectType} from '@nestjs/graphql';

@ObjectType('SeriesPart')
export class SeriesPartEntity {
  seriesId!: string;
  bookId!: string;

  @Field(() => Float, {nullable: true})
  order?: number;

  @Field(() => String, {nullable: true})
  displayAs?: string;
}
