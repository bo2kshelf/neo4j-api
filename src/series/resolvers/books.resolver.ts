import {Args, Mutation, Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {BookEntity} from '../../books/entities/book.entity';
import {BooksService} from '../../books/services/books.service';
import {SeriesMainPartEntity} from '../entities/series-main-part.entity';
import {SeriesService} from '../services/series.service';
import {
  ConnectNextBookArgs,
  ConnectNextBookReturn,
} from './dto/connect-next-book.dto';
import {
  ResolveBooksNextArgs,
  ResolveBooksNextReturn,
} from './dto/resolve-books-next.dto';
import {
  ResolveBooksPreviousArgs,
  ResolveBooksPreviousReturn,
} from './dto/resolve-books-previous.dto';

@Resolver(() => BookEntity)
export class BooksResolver {
  constructor(private readonly seriesService: SeriesService) {}

  @ResolveField(() => [SeriesMainPartEntity])
  async seriesOf(
    @Parent() {id: bookId}: BookEntity,
  ): Promise<SeriesMainPartEntity[]> {
    return this.seriesService.getSeriesFromBook(bookId);
  }

  @ResolveField(() => ResolveBooksPreviousReturn)
  async previous(
    @Parent() {id: bookId}: BookEntity,
    @Args({type: () => ResolveBooksPreviousArgs})
    args: ResolveBooksPreviousArgs,
  ): Promise<ResolveBooksPreviousReturn> {
    return this.seriesService.previousBooks(bookId, args);
  }

  @ResolveField(() => ResolveBooksNextReturn)
  async next(
    @Parent() {id: bookId}: BookEntity,
    @Args({type: () => ResolveBooksNextArgs})
    args: ResolveBooksNextArgs,
  ): Promise<ResolveBooksNextReturn> {
    return this.seriesService.nextBooks(bookId, args);
  }

  @Mutation(() => ConnectNextBookReturn)
  async connectNextBook(
    @Args({type: () => ConnectNextBookArgs})
    {previousId, nextId}: ConnectNextBookArgs,
  ): Promise<ConnectNextBookReturn> {
    return this.seriesService.connectBooksAsNextBook({previousId, nextId});
  }
}

@Resolver(() => ConnectNextBookReturn)
export class ConnectNextBookResolver {
  constructor(private readonly booksService: BooksService) {}

  @ResolveField(() => BookEntity)
  async previous(
    @Parent() {previousId}: ConnectNextBookReturn,
  ): Promise<BookEntity> {
    return this.booksService.findById(previousId);
  }

  @ResolveField(() => BookEntity)
  async next(@Parent() {nextId}: ConnectNextBookReturn): Promise<BookEntity> {
    return this.booksService.findById(nextId);
  }
}
