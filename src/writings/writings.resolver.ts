import {Args, Mutation, Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {AuthorEntity} from '../authors/author.entity';
import {BookEntity} from '../books/book.entity';
import {AuthorWritesArgs} from './dto/author-writes.dto';
import {BookWritedByArgs} from './dto/book-writed-by.dto';
import {ConnectBookToAuthorArgs} from './dto/connect-book-to-author.dto';
import {WritingEntity} from './writing.entity';
import {WritingsService} from './writings.service';

@Resolver(() => WritingEntity)
export class WritingsResolver {
  constructor(private readonly writingsService: WritingsService) {}

  @Mutation(() => WritingEntity)
  async connectBookToAuthor(
    @Args({type: () => ConnectBookToAuthorArgs})
    {bookId, authorId, ...props}: ConnectBookToAuthorArgs,
  ) {
    return this.writingsService.connectBookToAuthor({bookId, authorId}, props);
  }
}

@Resolver(() => AuthorEntity)
export class AuthorWritesResolver {
  constructor(private readonly writingsService: WritingsService) {}

  @ResolveField(() => [WritingEntity])
  async writings(
    @Parent() author: AuthorEntity,
    @Args({type: () => AuthorWritesArgs}) args: AuthorWritesArgs,
  ): Promise<WritingEntity[]> {
    return this.writingsService.getFromAuthor(author, args);
  }
}

@Resolver(() => BookEntity)
export class BookWritedByResolver {
  constructor(private readonly writingsService: WritingsService) {}

  @ResolveField(() => [WritingEntity])
  async writedBy(
    @Parent() book: BookEntity,
    @Args({type: () => BookWritedByArgs}) args: BookWritedByArgs,
  ): Promise<WritingEntity[]> {
    return this.writingsService.getFromBook(book, args);
  }
}
