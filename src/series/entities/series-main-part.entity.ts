import {Field, ObjectType} from '@nestjs/graphql';

@ObjectType('SeriesMainPart')
export class SeriesMainPartEntity {
  seriesId!: string;
  bookId!: string;

  @Field(() => String, {nullable: true})
  numberingAs?: string;
}
