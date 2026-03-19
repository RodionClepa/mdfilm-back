import { prisma } from '../../lib/prisma.js';

export class DirectorService {
  async getAll() {
    return prisma.director.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async getById(id: number) {
    if (!id) throw new Error('ID is required.');
    const director = await prisma.director.findUnique({ where: { id } });
    if (!director) throw new Error(`Director with ID ${id} not found.`);
    return director;
  }

  async create(data: any) {
    if (!data?.name) throw new Error('Name is required.');
    return prisma.director.create({
      data: { name: String(data.name) },
    });
  }
}

export const directorService = new DirectorService();

