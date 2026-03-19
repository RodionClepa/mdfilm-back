import { prisma } from '../../lib/prisma.js';

export class SeriesService {
  /**
   * Helper method to verify a series exists and is actually a SERIES
   */
  private async _ensureSeriesExists(id: number) {
    const series = await prisma.media.findFirst({
      where: {
        id,
        type: { name: 'SERIES' },
      },
    });

    if (!series) {
      throw new Error(`Series with ID ${id} not found.`);
    }
    return series;
  }

  async getAll() {
    return prisma.media.findMany({
      where: { type: { name: 'SERIES' } },
      include: { seriesInfo: true, type: true, directors: { include: { director: true } } },
    });
  }

  async getById(id: number) {
    if (!id) throw new Error('ID is required.');

    const series = await prisma.media.findFirst({
      where: { id, type: { name: 'SERIES' } },
      include: { seriesInfo: true, directors: { include: { director: true } } },
    });

    if (!series) throw new Error(`Series with ID ${id} not found.`);

    return series;
  }

  async create(data: any) {
    if (!data.title) throw new Error('Title is required.');
    if (!data.releaseDate) throw new Error('releaseDate is required.');

    const seriesType = await prisma.mediaType.findUnique({
      where: { name: 'SERIES' },
    });

    if (!seriesType) {
      throw new Error(
        "MediaType 'SERIES' not found. Please seed your database.",
      );
    }

    const firstAirDate =
      data.firstAirDate ?? data.seriesInfo?.firstAirDate ?? data.releaseDate;
    if (!firstAirDate) throw new Error('firstAirDate is required.');

    const lastAirDate = data.lastAirDate ?? data.seriesInfo?.lastAirDate ?? null;

    return prisma.media.create({
      data: {
        title: data.title,
        releaseDate: new Date(data.releaseDate),
        synopsis: data.synopsis,
        country: data.country,
        posterImage: data.posterImage,
        typeId: seriesType.id,
        seriesInfo: {
          create: {
            totalSeasons:
              data.totalSeasons ?? data.seriesInfo?.totalSeasons ?? 1,
            status: data.status ?? data.seriesInfo?.status,
            firstAirDate: new Date(firstAirDate),
            lastAirDate: lastAirDate ? new Date(lastAirDate) : null,
          },
        },
      },
      include: { seriesInfo: true },
    });
  }

  async update(id: number, data: any) {
    if (!id) throw new Error('ID is required.');

    await this._ensureSeriesExists(id);

    return prisma.media.update({
      where: { id },
      data: {
        title: data.title,
        synopsis: data.synopsis,
        country: data.country,
        posterImage: data.posterImage,
        releaseDate: data.releaseDate ? new Date(data.releaseDate) : undefined,
        seriesInfo: {
          update: {
            totalSeasons: data.totalSeasons ?? data.seriesInfo?.totalSeasons,
            status: data.status ?? data.seriesInfo?.status,
            firstAirDate: data.firstAirDate
              ? new Date(data.firstAirDate)
              : data.seriesInfo?.firstAirDate
                ? new Date(data.seriesInfo.firstAirDate)
                : undefined,
            lastAirDate:
              data.lastAirDate !== undefined
                ? data.lastAirDate
                  ? new Date(data.lastAirDate)
                  : null
                : data.seriesInfo?.lastAirDate !== undefined
                  ? data.seriesInfo.lastAirDate
                    ? new Date(data.seriesInfo.lastAirDate)
                    : null
                  : undefined,
          },
        },
      },
      include: { seriesInfo: true },
    });
  }

  async delete(id: number) {
    if (!id) throw new Error('ID is required.');

    await this._ensureSeriesExists(id);

    return prisma.media.delete({
      where: { id },
    });
  }
}

export const seriesService = new SeriesService();

