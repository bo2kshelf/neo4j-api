import {Args, Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {AuthorEntity} from '../authors/author.entity';
import {BookEntity} from '../books/book.entity';
import {WritingEntity} from './writing.entity';
import {WritingsService} from './writings.service';

@Resolver()
export class WritingsResolver {
  constructor(private readonly writingsService: WritingsService) {}

  @ResolveField()
  @Resolver('Book')
  async writedBy(
    @Parent() book: BookEntity,
    @Args() args: {skip?: number; limit?: number},
  ): Promise<WritingEntity[]> {
    return this.writingsService.getFromBook(book, args);
  }

  @ResolveField()
  @Resolver('Author')
  async writings(
    @Parent() author: AuthorEntity,
    @Args() args: {skip?: number; limit?: number},
  ): Promise<WritingEntity[]> {
    return this.writingsService.getFromAuthor(author, args);
  }
}
