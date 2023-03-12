import { BoardRepository } from './board.repository';
import { CreateBoardDto } from './dto/create-board.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BoardStatus } from './board-status.enum';
import { User } from 'src/auth/user.entity';

/**
 * pipe 유효성 체크
 * https://github.com/typestack/class-validator#manual-validation
 */

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(BoardRepository)
    private boardRepository: BoardRepository,
  ) {}

  createBoard(createBoardDto: CreateBoardDto, user: User) {
    return this.boardRepository.createBoard(createBoardDto, user);
  }

  async getAllBoards(user: User) {
    const query = this.boardRepository.createQueryBuilder('board');

    query.where('board.userId = :uesrId', { userId: user.id });

    const boards = await query.getMany();
    return boards;
  }

  async getBoardById(id: number) {
    const found = await this.boardRepository.findOne(id);

    if (!found) {
      throw new NotFoundException(`Can't find board with id (${id})`);
    }

    return found;
  }

  async deleteBoard(id: number, user: User) {
    const result = await this.boardRepository.delete({ id, user });

    if (result.affected === 0) {
      throw new NotFoundException(`Can;t find Board with id ${id}`);
    }
  }

  async updateBoardStatus(id: number, status: BoardStatus) {
    const board = await this.getBoardById(id);
    board.status = status;
    await this.boardRepository.save(board);

    return board;
  }
}
