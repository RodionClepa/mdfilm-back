import { Request, Response } from 'express';
import { personService } from '../services/person.service.js';

class PersonController {
  async getPeople(req: Request, res: Response) {
    try {
      const people = await personService.getAll();
      res.json(people);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.message ?? 'Failed to fetch people' });
    }
  }

  async getPerson(req: Request, res: Response) {
    try {
      const person = await personService.getById(Number(req.params.id));
      res.json(person);
    } catch (error: any) {
      res.status(404).json({ error: error.message ?? 'Person not found' });
    }
  }

  async createPerson(req: Request, res: Response) {
    try {
      const person = await personService.create(req.body);
      res.status(201).json(person);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updatePerson(req: Request, res: Response) {
    try {
      const person = await personService.update(Number(req.params.id), req.body);
      res.json(person);
    } catch (error: any) {
      res.status(400).json({ error: error.message ?? 'Update failed' });
    }
  }

  async deletePerson(req: Request, res: Response) {
    try {
      await personService.delete(Number(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message ?? 'Delete failed' });
    }
  }

  async getPersonFilmography(req: Request, res: Response) {
    try {
      const media = await personService.getFilmography(Number(req.params.id));
      res.json(media);
    } catch (error: any) {
      res.status(400).json({ error: error.message ?? 'Failed to fetch filmography' });
    }
  }
}

export const personController = new PersonController();

