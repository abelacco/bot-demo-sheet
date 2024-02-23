
// import { PaginationMessageDto } from '../dto/pagination.dto';
import { UpdateMessageDto } from '../dto';
import { Message } from '../entities/message.entity';

export interface IMessageDao {


  // create(createDoctoDto: CreateDoctorDto): Promise<Doctor>;

  // findAll(props?: FindDoctorDto): Promise<Array<Doctor>>;
    
  // findAllByPagination(paginationMessageDto: PaginationMessageDto): Promise<{ data: Message[]; total: number }>;

  // findById(id: string): Promise<Doctor>;

  findOrCreate(clientPhone: string): Promise<Message>;

  updateMessage(id: string, updateMessageDto: UpdateMessageDto): Promise<Message>;

  updateStatusByAppId(appointmentId: string , updateMessageDto: UpdateMessageDto): Promise<Message>;

  // findMessageByterm(term: string): Promise<Message>;

  // remove(id: string): Promise<Doctor>;
}
