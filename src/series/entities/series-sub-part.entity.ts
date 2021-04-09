import {ObjectType} from '@nestjs/graphql';

@ObjectType('SeriesSubPart')
export class SeriesSubPartEntity {
  seriesId!: string;
  bookId!: string;
}
