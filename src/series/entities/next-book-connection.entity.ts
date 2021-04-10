import {ObjectType} from '@nestjs/graphql';

@ObjectType('NextBookConnection')
export class NextBookConnection {
  previousId!: string;
  nextId!: string;
}
