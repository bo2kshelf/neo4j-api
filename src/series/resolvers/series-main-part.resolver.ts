import {Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {BookEntity} from '../../books/entities/book.entity';
import {BooksService} from '../../books/services/books.service';
import {SeriesMainPartEntity} from '../entities/series-main-part.entity';
import {SeriesEntity} from '../entities/series.entity';
import {SeriesService} from '../services/series.service';

@Resolver(() => SeriesMainPartEntity)
export class SeriesMainPartResolver {
  constructor(
    private readonly booksService: BooksService,
    private readonly seriesService: SeriesService,
  ) {}

  @ResolveField(() => BookEntity)
  async book(@Parent() {bookId}: SeriesMainPartEntity): Promise<BookEntity> {
    return this.booksService.findById(bookId);
  }

  @ResolveField(() => SeriesEntity)
  async series(
    @Parent() {seriesId}: SeriesMainPartEntity,
  ): Promise<SeriesEntity> {
    return this.seriesService.findById(seriesId);
  }
}
