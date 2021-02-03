import {AuthorEntity} from '../authors/author.entity';
import {BookEntity} from '../books/book.entity';

export class SeriesPartEntity {
  series!: AuthorEntity;
  book!: BookEntity;
}
