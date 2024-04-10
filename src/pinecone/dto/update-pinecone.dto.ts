import { PartialType } from '@nestjs/swagger';
import { CreatePineconeDto } from './create-pinecone.dto';

export class UpdatePineconeDto extends PartialType(CreatePineconeDto) {}
