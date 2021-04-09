import {Field, ObjectType} from '@nestjs/graphql';

@ObjectType('SeriesPart')
export class SeriesPartEntity {
  seriesId!: string;
  bookId!: string;

  @Field(() => String, {nullable: true})
  numberingAs?: string;
}
