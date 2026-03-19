import { prisma } from '../../lib/prisma.js';

export class PersonService {
  async getAll() {
    return prisma.person.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async getById(id: number) {
    if (!id) throw new Error('ID is required.');
    const person = await prisma.person.findUnique({ where: { id } });
    if (!person) throw new Error(`Person with ID ${id} not found.`);
    return person;
  }

  async create(data: any) {
    if (!data?.name) throw new Error('Name is required.');
    return prisma.person.create({
      data: { name: String(data.name) },
    });
  }
}

export const personService = new PersonService();

