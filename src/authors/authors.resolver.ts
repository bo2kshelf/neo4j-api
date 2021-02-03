import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  ResolveReference,
} from '@nestjs/graphql';
import {BookEntity} from '../books/book.entity';
import {AuthorEntity} from './author.entity';
import {AuthorsService} from './authors.service';

@Resolver('Author')
export class AuthorsResolver {
  constructor(private readonly authorsService: AuthorsService) {}

  @ResolveReference()
  resolveReference(reference: {__typename: string; id: string}) {
    return this.authorsService.findById(reference.id);
  }

  @ResolveField()
  isbn(
    @Parent() parent: BookEntity,
    @Args() {dehyphenize}: {dehyphenize: boolean},
  ) {
    if (dehyphenize && parent?.isbn) return parent.isbn.replace(/-/g, '');
    return parent?.isbn;
  }

  @Query()
  async author(@Args('id') id: string): Promise<AuthorEntity> {
    return this.authorsService.findById(id);
  }

  @Mutation()
  async createAuthor(
    @Args() {data}: {data: {name: string}},
  ): Promise<BookEntity> {
    return this.authorsService.createAuthor(data);
  }
}
