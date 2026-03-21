import { prisma } from '../../lib/prisma.js';

export class MovieService {
  /**
   * Helper method to verify a movie exists and is actually a MOVIE
   */
  private async _ensureMovieExists(id: number) {
    const movie = await prisma.media.findFirst({
      where: {
        id,
        type: { name: 'MOVIE' }
      },
    });

    if (!movie) {
      throw new Error(`Movie with ID ${id} not found.`);
    }
    return movie;
  }

  async getAll() {
    return prisma.media.findMany({
      where: { type: { name: 'MOVIE' } },
      include: { movieInfo: true, type: true, directors: { include: { director: true } } },
    });
  }

  async getById(id: number) {
    if (!id) throw new Error("ID is required.");

    // Using our helper to ensure existence and type safety
    const movie = await prisma.media.findFirst({
      where: { id, type: { name: 'MOVIE' } },
      include: { movieInfo: true, directors: { include: { director: true } } },
    });

    if (!movie) throw new Error(`Movie with ID ${id} not found.`);

    return movie;
  }

  async create(data: any) {
    // 1. Basic field validation
    if (!data.title) throw new Error("Title is required.");

    // 2. Lookup Type ID
    const movieType = await prisma.mediaType.findUnique({
      where: { name: 'MOVIE' },
    });

    if (!movieType) {
      throw new Error("MediaType 'MOVIE' not found. Please seed your database.");
    }

    return prisma.media.create({
      data: {
        title: data.title,
        releaseDate: new Date(data.releaseDate),
        synopsis: data.synopsis,
        country: data.country,
        posterImage: data.posterImage,
        typeId: movieType.id,
        movieInfo: {
          create: {
            duration: data.duration,
            budget: data.budget,
          },
        },
      },
      include: { movieInfo: true },
    });
  }

  async update(id: number, data: any) {
    if (!id) throw new Error("ID is required.");

    // Ensure the record exists and is a movie before updating
    await this._ensureMovieExists(id);

    return prisma.media.update({
      where: { id },
      data: {
        title: data.title,
        synopsis: data.synopsis,
        country: data.country,
        posterImage: data.posterImage,
        releaseDate: data.releaseDate ? new Date(data.releaseDate) : undefined,
        movieInfo: {
          update: {
            duration: data.duration,
            budget: data.budget,
          },
        },
      },
      include: { movieInfo: true }
    });
  }

  async delete(id: number) {
    if (!id) throw new Error("ID is required.");

    // Ensure it exists and is a movie
    await this._ensureMovieExists(id);

    // Prisma will delete the related MovieInfo automatically 
    // if you set onDelete: Cascade in schema, otherwise it handles it here.
    return prisma.media.delete({
      where: { id }
    });
  }
}

export const movieService = new MovieService();