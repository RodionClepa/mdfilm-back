import { prisma } from '../../lib/prisma.js';

export class PersonService {
  private _toProfileData(data: any) {
    const genderRaw = typeof data?.gender === 'string' ? data.gender : undefined;
    const gender = genderRaw === 'MALE' || genderRaw === 'FEMALE' || genderRaw === 'UNSPECIFIED'
      ? genderRaw
      : undefined;

    const birthDateRaw = data?.birthDate;
    const birthDate =
      birthDateRaw == null || birthDateRaw === ''
        ? undefined
        : birthDateRaw instanceof Date
          ? birthDateRaw
          : new Date(String(birthDateRaw));

    const earningsRaw = data?.earnings;
    const earnings =
      earningsRaw == null || earningsRaw === ''
        ? undefined
        : Number.isFinite(Number(earningsRaw))
          ? Number(earningsRaw)
          : undefined;

    return {
      earnings,
      biography: data?.biography != null && String(data.biography).trim() !== '' ? String(data.biography) : undefined,
      birthDate: birthDate != null && !Number.isNaN(birthDate.getTime()) ? birthDate : undefined,
      gender,
      imageUrl: data?.imageUrl != null && String(data.imageUrl).trim() !== '' ? String(data.imageUrl) : undefined,
      placeOfBirth:
        data?.placeOfBirth != null && String(data.placeOfBirth).trim() !== '' ? String(data.placeOfBirth) : undefined,
    };
  }

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
      data: {
        name: String(data.name),
        ...this._toProfileData(data),
      },
    });
  }

  async update(id: number, data: any) {
    if (!id) throw new Error('ID is required.');
    if (!data?.name) throw new Error('Name is required.');
    await this.getById(id);
    return prisma.person.update({
      where: { id },
      data: {
        name: String(data.name),
        ...this._toProfileData(data),
      },
    });
  }

  async getFilmography(id: number) {
    if (!id) throw new Error('ID is required.');
    await this.getById(id);
    return prisma.media.findMany({
      where: {
        cast: {
          some: { personId: id },
        },
      },
      include: { type: true },
      orderBy: { releaseDate: 'desc' },
    });
  }

  async delete(id: number) {
    if (!id) throw new Error('ID is required.');
    await this.getById(id);
    await prisma.person.delete({ where: { id } });
  }
}

export const personService = new PersonService();

