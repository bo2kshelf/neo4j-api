import {AuthorEntity} from '../authors/author.entity';
import {BookEntity} from '../books/book.entity';

export class WritingEntity {
  author!: AuthorEntity;
  book!: BookEntity;
}
