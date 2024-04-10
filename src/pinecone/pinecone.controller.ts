import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PineconeService } from './pinecone.service';
import { CreatePineconeDto } from './dto/create-pinecone.dto';
import { UpdatePineconeDto } from './dto/update-pinecone.dto';

@Controller('pinecone')
export class PineconeController {
  constructor(private readonly pineconeService: PineconeService) {}

}
