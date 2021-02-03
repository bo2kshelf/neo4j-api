import {
  Args,
  Mutation,
  Query,
  Resolver,
  ResolveReference,
} from '@nestjs/graphql';
import {AuthorEntity} from './author.entity';
import {AuthorsService} from './authors.service';

@Resolver('Author')
export class AuthorsResolver {
  constructor(private readonly authorsService: AuthorsService) {}

  @ResolveReference()
  resolveReference(reference: {__typename: string; id: string}) {
    return this.authorsService.findById(reference.id);
  }

  @Query()
  async author(@Args('id') id: string): Promise<AuthorEntity> {
    return this.authorsService.findById(id);
  }

  @Query()
  async allAuthors(): Promise<AuthorEntity[]> {
    return this.authorsService.findAllAuthors();
  }

  @Mutation()
  async createAuthor(
    @Args() {data}: {data: {name: string}},
  ): Promise<AuthorEntity> {
    return this.authorsService.createAuthor(data);
  }
}
