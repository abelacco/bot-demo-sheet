import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common/dto';

export class FindUserDto extends PaginationDto {
  @IsString()
  @IsOptional()
  phone: string;

  @IsString()
  @IsOptional()
  name: string;
}
