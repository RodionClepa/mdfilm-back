import { prisma } from '../../lib/prisma.js';

export class DirectorService {
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
    return prisma.director.update({
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
        directors: {
          some: { directorId: id },
        },
      },
      include: { type: true },
      orderBy: { releaseDate: 'desc' },
    });
  }

  async delete(id: number) {
    if (!id) throw new Error('ID is required.');
    await this.getById(id);
    await prisma.director.delete({ where: { id } });
  }
}

export const directorService = new DirectorService();

