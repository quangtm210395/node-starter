import { IsNumber, IsString } from 'class-validator';

export class TestBody {
  @IsString()
  name: string;

  @IsNumber()
  age: number;

  @IsString()
  bio: string;
}
